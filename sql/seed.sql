-- BloodBridge safe setup seed
-- Run after sql/schema.sql.
--
-- This file does not create fake auth users. Create users through Supabase Auth
-- by signing up in the app, then use the admin promotion statement below if needed.

insert into public.blood_inventory (blood_type, units_available, units_reserved)
values
  ('O+', 0, 0),
  ('O-', 0, 0),
  ('A+', 0, 0),
  ('A-', 0, 0),
  ('B+', 0, 0),
  ('B-', 0, 0),
  ('AB+', 0, 0),
  ('AB-', 0, 0)
on conflict (blood_type) do update
set units_available = excluded.units_available,
    units_reserved = excluded.units_reserved,
    updated_at = now();

-- Promote a real signed-up user to admin by replacing the email below.
-- update public.profiles
-- set role = 'admin'
-- where email = 'your-admin-email@example.com';

select 'Profiles' as item, count(*)::text as total from public.profiles
union all
select 'Donors', count(*)::text from public.donors
union all
select 'Recipients', count(*)::text from public.recipients
union all
select 'Blood Requests', count(*)::text from public.blood_requests
union all
select 'Donations', count(*)::text from public.donations
union all
select 'Notifications', count(*)::text from public.notifications
union all
select 'Inventory Rows', count(*)::text from public.blood_inventory;
