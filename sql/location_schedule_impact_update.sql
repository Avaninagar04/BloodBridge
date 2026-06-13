alter table public.donors add column if not exists latitude numeric(10, 8);
alter table public.donors add column if not exists longitude numeric(11, 8);
alter table public.recipients add column if not exists location_area text;
alter table public.recipients add column if not exists city text;
alter table public.recipients add column if not exists state text;
alter table public.recipients add column if not exists latitude numeric(10, 8);
alter table public.recipients add column if not exists longitude numeric(11, 8);
alter table public.blood_requests add column if not exists location_area text;
alter table public.blood_requests add column if not exists city text;
alter table public.blood_requests add column if not exists state text;
alter table public.blood_requests add column if not exists latitude numeric(10, 8);
alter table public.blood_requests add column if not exists longitude numeric(11, 8);
alter table public.donations add column if not exists scheduled_at timestamptz;

create index if not exists idx_donors_location on public.donors(latitude, longitude);
create index if not exists idx_blood_requests_location on public.blood_requests(latitude, longitude);

create or replace function public.distance_miles(
  lat1 numeric,
  lon1 numeric,
  lat2 numeric,
  lon2 numeric
)
returns numeric
language sql
immutable
as $$
  select case
    when lat1 is null or lon1 is null or lat2 is null or lon2 is null then null
    else 3959 * acos(
      least(
        1,
        greatest(
          -1,
          cos(radians(lat1::double precision)) *
          cos(radians(lat2::double precision)) *
          cos(radians((lon2 - lon1)::double precision)) +
          sin(radians(lat1::double precision)) *
          sin(radians(lat2::double precision))
        )
      )
    )
  end
$$;

create or replace function public.public_platform_stats()
returns table (
  active_donors bigint,
  lives_impacted bigint,
  total_donations bigint,
  active_requests bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*) from public.donors where is_available = true) as active_donors,
    (select coalesce(sum(units_donated), 0)::bigint from public.donations where status = 'completed') as lives_impacted,
    (select count(*) from public.donations) as total_donations,
    (select count(*) from public.blood_requests where status = 'open') as active_requests
$$;

grant execute on function public.public_platform_stats() to anon, authenticated;

create or replace function public.notify_matching_donors_for_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status <> 'open' then
    return new;
  end if;

  insert into public.notifications (user_id, title, message, type)
  select
    d.user_id,
    case
      when new.urgency_level = 'critical' then 'Critical blood request nearby'
      when new.urgency_level = 'urgent' then 'Urgent blood request match'
      else 'New compatible blood request'
    end,
    'A recipient needs ' || new.blood_type || ' blood. Your blood type may be compatible.',
    'match_found'
  from public.donors d
  where d.is_available = true
    and public.can_donate_to(d.blood_type, new.blood_type)
    and (
      new.latitude is null
      or new.longitude is null
      or d.latitude is null
      or d.longitude is null
      or public.distance_miles(d.latitude, d.longitude, new.latitude, new.longitude) <= 50
    )
    and not exists (
      select 1
      from public.recipients r
      where r.id = new.recipient_id
        and r.user_id = d.user_id
    );

  return new;
end;
$$;
