alter table public.profiles add column if not exists email_notifications boolean not null default true;
alter table public.profiles add column if not exists donation_reminders boolean not null default true;
alter table public.profiles add column if not exists emergency_alerts boolean not null default true;
