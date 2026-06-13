# BloodBridge Application - Current Status

## Completed

- Supabase-backed authentication with signup, login, callback handling, and role routing.
- Role-protected donor, recipient, and admin dashboards.
- Canonical database schema in `sql/schema.sql`.
- Safe setup seed in `sql/seed.sql`.
- Auth trigger that creates `public.profiles` from Supabase Auth users.
- RLS policies for profiles, donors, recipients, blood requests, donations, notifications, and inventory.
- Donor profile creation using real Supabase data.
- Recipient profile and blood request creation using real Supabase data.
- Donation interest creation with `units_donated`.
- Notification center scoped to the authenticated user.
- Database triggers for matching donor notifications and donation/request updates.
- Blood inventory table with default blood-type rows.
- Optional Gemini chatbot through `GEMINI_API_KEY`.
- Rule-based/free donor matching, blood compatibility, health eligibility, emergency priority, and notifications.
- Production build passes.

## Deployment Steps

1. Run `sql/schema.sql` in Supabase SQL Editor.
2. Run `sql/seed.sql` in Supabase SQL Editor.
3. Configure Supabase auth redirect URLs.
4. Add environment variables locally and in Vercel.
5. Sign up through the app.
6. Promote a real user to admin in Supabase SQL Editor.
7. Deploy to Vercel.

See `docs/DEPLOYMENT_CHECKLIST.md` for the exact checklist.
