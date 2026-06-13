-- BloodBridge Supabase schema and RLS policies
-- Run this file in the Supabase SQL editor before using the app.

create extension if not exists pgcrypto;

do $$ begin
  create type public.user_role as enum ('donor', 'recipient', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.urgency_level as enum ('normal', 'urgent', 'critical');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.request_status as enum ('open', 'fulfilled', 'cancelled');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.donation_status as enum ('pending', 'completed', 'cancelled');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  email text unique,
  phone text,
  role public.user_role not null default 'donor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.donors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  blood_type text not null check (blood_type in ('O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-')),
  age integer,
  weight numeric,
  is_available boolean not null default true,
  last_donation_date timestamptz,
  health_conditions text,
  medications text,
  address text,
  city text,
  state text,
  country text,
  latitude numeric(10, 8),
  longitude numeric(11, 8),
  total_donations integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recipients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  blood_type text not null check (blood_type in ('O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-')),
  age integer,
  medical_condition text,
  hospital_name text,
  location_area text,
  city text,
  state text,
  doctor_name text,
  doctor_contact text,
  urgency_level public.urgency_level not null default 'normal',
  units_needed integer not null default 1,
  latitude numeric(10, 8),
  longitude numeric(11, 8),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blood_requests (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.recipients(id) on delete cascade,
  blood_type text not null check (blood_type in ('O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-')),
  units_requested integer not null default 1 check (units_requested > 0),
  units_fulfilled integer not null default 0 check (units_fulfilled >= 0),
  urgency_level public.urgency_level not null default 'normal',
  priority_score integer not null default 50 check (priority_score >= 0 and priority_score <= 100),
  status public.request_status not null default 'open',
  needed_by_date timestamptz,
  posted_date timestamptz not null default now(),
  location_area text,
  city text,
  state text,
  latitude numeric(10, 8),
  longitude numeric(11, 8),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blood_requests_units_valid check (units_fulfilled <= units_requested)
);

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references public.donors(id) on delete cascade,
  blood_request_id uuid references public.blood_requests(id) on delete set null,
  units_donated integer not null default 1 check (units_donated > 0),
  donation_date timestamptz not null default now(),
  status public.donation_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text,
  type text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.blood_inventory (
  id uuid primary key default gen_random_uuid(),
  blood_type text not null unique check (blood_type in ('O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-')),
  units_available integer not null default 0 check (units_available >= 0),
  units_reserved integer not null default 0 check (units_reserved >= 0),
  updated_at timestamptz not null default now(),
  constraint blood_inventory_reserved_valid check (units_reserved <= units_available)
);

alter table public.donors add column if not exists age integer;
alter table public.donors add column if not exists weight numeric;
alter table public.donors add column if not exists medications text;
alter table public.donors add column if not exists address text;
alter table public.donors add column if not exists city text;
alter table public.donors add column if not exists state text;
alter table public.donors add column if not exists country text;
alter table public.donors add column if not exists latitude numeric(10, 8);
alter table public.donors add column if not exists longitude numeric(11, 8);
alter table public.donors add column if not exists total_donations integer not null default 0;

alter table public.recipients add column if not exists age integer;
alter table public.recipients add column if not exists location_area text;
alter table public.recipients add column if not exists city text;
alter table public.recipients add column if not exists state text;
alter table public.recipients add column if not exists doctor_name text;
alter table public.recipients add column if not exists doctor_contact text;
alter table public.recipients add column if not exists urgency_level public.urgency_level not null default 'normal';
alter table public.recipients add column if not exists units_needed integer not null default 1;
alter table public.recipients add column if not exists latitude numeric(10, 8);
alter table public.recipients add column if not exists longitude numeric(11, 8);

alter table public.blood_requests add column if not exists posted_date timestamptz not null default now();
alter table public.blood_requests add column if not exists priority_score integer not null default 50;
alter table public.blood_requests add column if not exists location_area text;
alter table public.blood_requests add column if not exists city text;
alter table public.blood_requests add column if not exists state text;
alter table public.blood_requests add column if not exists latitude numeric(10, 8);
alter table public.blood_requests add column if not exists longitude numeric(11, 8);

alter table public.donations add column if not exists units_donated integer not null default 1;
alter table public.donations add column if not exists scheduled_at timestamptz;
alter table public.profiles add column if not exists email_notifications boolean not null default true;
alter table public.profiles add column if not exists donation_reminders boolean not null default true;
alter table public.profiles add column if not exists emergency_alerts boolean not null default true;

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_donors_user_id on public.donors(user_id);
create index if not exists idx_donors_available_blood_type on public.donors(is_available, blood_type);
create index if not exists idx_donors_location on public.donors(latitude, longitude);
create index if not exists idx_recipients_user_id on public.recipients(user_id);
create index if not exists idx_blood_requests_recipient_id on public.blood_requests(recipient_id);
create index if not exists idx_blood_requests_status on public.blood_requests(status);
create index if not exists idx_blood_requests_location on public.blood_requests(latitude, longitude);
create index if not exists idx_donations_donor_id on public.donations(donor_id);
create index if not exists idx_donations_request_id on public.donations(blood_request_id);
create index if not exists idx_notifications_user_id on public.notifications(user_id, read, created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role::text from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false)
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.user_role;
begin
  requested_role := case
    when new.raw_user_meta_data ->> 'role' in ('donor', 'recipient') then (new.raw_user_meta_data ->> 'role')::public.user_role
    else 'donor'::public.user_role
  end;

  insert into public.profiles (id, first_name, last_name, email, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.email,
    requested_role
  )
  on conflict (id) do update
    set first_name = excluded.first_name,
        last_name = excluded.last_name,
        email = excluded.email,
        role = excluded.role,
        updated_at = now();

  return new;
end;
$$;

create or replace function public.prevent_profile_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role is distinct from new.role
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Only admins can change profile roles';
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.refresh_donor_total_donations()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_donor uuid;
begin
  if tg_op = 'DELETE' then
    target_donor := old.donor_id;
  else
    target_donor := new.donor_id;
  end if;

  update public.donors
  set total_donations = (
    select count(*)::integer
    from public.donations
    where donor_id = target_donor
      and status = 'completed'
  )
  where id = target_donor;

  return coalesce(new, old);
end;
$$;

drop trigger if exists donations_refresh_donor_totals on public.donations;
create trigger donations_refresh_donor_totals
  after insert or update or delete on public.donations
  for each row execute function public.refresh_donor_total_donations();

create or replace function public.can_donate_to(donor_blood_type text, recipient_blood_type text)
returns boolean
language sql
immutable
as $$
  select case donor_blood_type
    when 'O-' then recipient_blood_type in ('O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-')
    when 'O+' then recipient_blood_type in ('O+', 'A+', 'B+', 'AB+')
    when 'A-' then recipient_blood_type in ('A+', 'A-', 'AB+', 'AB-')
    when 'A+' then recipient_blood_type in ('A+', 'AB+')
    when 'B-' then recipient_blood_type in ('B+', 'B-', 'AB+', 'AB-')
    when 'B+' then recipient_blood_type in ('B+', 'AB+')
    when 'AB-' then recipient_blood_type in ('AB+', 'AB-')
    when 'AB+' then recipient_blood_type = 'AB+'
    else false
  end
$$;

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

drop trigger if exists blood_requests_notify_matching_donors on public.blood_requests;
create trigger blood_requests_notify_matching_donors
  after insert on public.blood_requests
  for each row execute function public.notify_matching_donors_for_request();

create or replace function public.handle_donation_notifications()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recipient_user_id uuid;
  donor_user_id uuid;
  donor_blood_type text;
begin
  select r.user_id
  into recipient_user_id
  from public.blood_requests br
  join public.recipients r on r.id = br.recipient_id
  where br.id = new.blood_request_id;

  select d.user_id, d.blood_type
  into donor_user_id, donor_blood_type
  from public.donors d
  where d.id = new.donor_id;

  if tg_op = 'INSERT' and recipient_user_id is not null then
    insert into public.notifications (user_id, title, message, type)
    values (
      recipient_user_id,
      'Donor interest received',
      'A compatible donor with ' || coalesce(donor_blood_type, 'matching') || ' blood has offered to donate.',
      'donor_found'
    );
  end if;

  if new.status = 'completed'
     and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    update public.donors
    set last_donation_date = coalesce(new.donation_date, now()),
        is_available = false
    where id = new.donor_id;

    if new.blood_request_id is not null then
      update public.blood_requests
      set units_fulfilled = least(units_requested, units_fulfilled + new.units_donated),
          status = case
            when least(units_requested, units_fulfilled + new.units_donated) >= units_requested then 'fulfilled'::public.request_status
            else status
          end
      where id = new.blood_request_id;
    end if;

    if donor_blood_type is not null then
      update public.blood_inventory
      set units_available = units_available + new.units_donated,
          updated_at = now()
      where blood_type = donor_blood_type;
    end if;

    if donor_user_id is not null then
      insert into public.notifications (user_id, title, message, type)
      values (
        donor_user_id,
        'Donation completed',
        'Thank you. Your donation has been recorded and may help save lives.',
        'donation_completed'
      );
    end if;

    if recipient_user_id is not null then
      insert into public.notifications (user_id, title, message, type)
      values (
        recipient_user_id,
        'Blood request updated',
        'A donation has been completed for your blood request.',
        'request_updated'
      );
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists donations_handle_notifications on public.donations;
create trigger donations_handle_notifications
  after insert or update on public.donations
  for each row execute function public.handle_donation_notifications();

create or replace function public.notify_request_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recipient_user_id uuid;
begin
  if old.status is not distinct from new.status then
    return new;
  end if;

  select r.user_id
  into recipient_user_id
  from public.recipients r
  where r.id = new.recipient_id;

  if recipient_user_id is not null then
    insert into public.notifications (user_id, title, message, type)
    values (
      recipient_user_id,
      'Blood request status changed',
      'Your ' || new.blood_type || ' blood request is now ' || new.status || '.',
      'request_status'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists blood_requests_notify_status_change on public.blood_requests;
create trigger blood_requests_notify_status_change
  after update of status on public.blood_requests
  for each row execute function public.notify_request_status_change();

create or replace function public.notify_low_inventory()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.units_available - new.units_reserved) >= 3 then
    return new;
  end if;

  insert into public.notifications (user_id, title, message, type)
  select
    p.id,
    'Low blood inventory',
    new.blood_type || ' inventory is below the configured safety threshold.',
    'low_inventory'
  from public.profiles p
  where p.role = 'admin';

  return new;
end;
$$;

drop trigger if exists blood_inventory_notify_low_inventory on public.blood_inventory;
create trigger blood_inventory_notify_low_inventory
  after update of units_available, units_reserved on public.blood_inventory
  for each row execute function public.notify_low_inventory();

drop trigger if exists touch_profiles_updated_at on public.profiles;
create trigger touch_profiles_updated_at before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists prevent_profile_role_escalation on public.profiles;
create trigger prevent_profile_role_escalation before update on public.profiles
  for each row execute function public.prevent_profile_role_escalation();

drop trigger if exists touch_donors_updated_at on public.donors;
create trigger touch_donors_updated_at before update on public.donors
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_recipients_updated_at on public.recipients;
create trigger touch_recipients_updated_at before update on public.recipients
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_blood_requests_updated_at on public.blood_requests;
create trigger touch_blood_requests_updated_at before update on public.blood_requests
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_donations_updated_at on public.donations;
create trigger touch_donations_updated_at before update on public.donations
  for each row execute function public.touch_updated_at();

insert into public.blood_inventory (blood_type)
values ('O+'), ('O-'), ('A+'), ('A-'), ('B+'), ('B-'), ('AB+'), ('AB-')
on conflict (blood_type) do nothing;

alter table public.profiles enable row level security;
alter table public.donors enable row level security;
alter table public.recipients enable row level security;
alter table public.blood_requests enable row level security;
alter table public.donations enable row level security;
alter table public.notifications enable row level security;
alter table public.blood_inventory enable row level security;

drop policy if exists "Profiles are visible to owner and admins" on public.profiles;
create policy "Profiles are visible to owner and admins" on public.profiles
  for select to authenticated
  using (auth.uid() = id or public.is_admin());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update to authenticated
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert to authenticated
  with check (auth.uid() = id and role in ('donor', 'recipient'));

drop policy if exists "Donors are visible to owner and admins" on public.donors;
create policy "Donors are visible to owner and admins" on public.donors
  for select to authenticated
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can insert own donor profile" on public.donors;
create policy "Users can insert own donor profile" on public.donors
  for insert to authenticated
  with check (auth.uid() = user_id and public.current_user_role() = 'donor');

drop policy if exists "Users can update own donor profile" on public.donors;
create policy "Users can update own donor profile" on public.donors
  for update to authenticated
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "Recipients are visible to owner and admins" on public.recipients;
create policy "Recipients are visible to owner and admins" on public.recipients
  for select to authenticated
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can insert own recipient profile" on public.recipients;
create policy "Users can insert own recipient profile" on public.recipients
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own recipient profile" on public.recipients;
create policy "Users can update own recipient profile" on public.recipients
  for update to authenticated
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "Authenticated users can view open blood requests" on public.blood_requests;
create policy "Authenticated users can view open blood requests" on public.blood_requests
  for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.recipients r
      where r.id = blood_requests.recipient_id
        and r.user_id = auth.uid()
    )
    or exists (
      select 1 from public.donors d
      where d.user_id = auth.uid()
        and d.is_available = true
        and blood_requests.status = 'open'
        and public.can_donate_to(d.blood_type, blood_requests.blood_type)
    )
  );

drop policy if exists "Recipients can insert own blood requests" on public.blood_requests;
create policy "Recipients can insert own blood requests" on public.blood_requests
  for insert to authenticated
  with check (
    public.is_admin()
    or exists (
      select 1 from public.recipients r
      where r.id = recipient_id
        and r.user_id = auth.uid()
    )
  );

drop policy if exists "Recipients can update own blood requests" on public.blood_requests;
create policy "Recipients can update own blood requests" on public.blood_requests
  for update to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.recipients r
      where r.id = blood_requests.recipient_id
        and r.user_id = auth.uid()
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.recipients r
      where r.id = recipient_id
        and r.user_id = auth.uid()
    )
  );

drop policy if exists "Donation records visible to involved users" on public.donations;
create policy "Donation records visible to involved users" on public.donations
  for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.donors d
      where d.id = donations.donor_id
        and d.user_id = auth.uid()
    )
    or exists (
      select 1
      from public.blood_requests br
      join public.recipients r on r.id = br.recipient_id
      where br.id = donations.blood_request_id
        and r.user_id = auth.uid()
    )
  );

drop policy if exists "Donors can insert own donation interest" on public.donations;
create policy "Donors can insert own donation interest" on public.donations
  for insert to authenticated
  with check (
    exists (
      select 1 from public.donors d
      where d.id = donor_id
        and d.user_id = auth.uid()
    )
  );

drop policy if exists "Admins can update donations" on public.donations;
create policy "Admins can update donations" on public.donations
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Users can view own notifications" on public.notifications;
create policy "Users can view own notifications" on public.notifications
  for select to authenticated
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications" on public.notifications
  for update to authenticated
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "Admins can insert notifications" on public.notifications;
create policy "Admins can insert notifications" on public.notifications
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists "Authenticated users can view blood inventory" on public.blood_inventory;
create policy "Authenticated users can view blood inventory" on public.blood_inventory
  for select to authenticated
  using (true);

drop policy if exists "Admins can manage blood inventory" on public.blood_inventory;
create policy "Admins can manage blood inventory" on public.blood_inventory
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
