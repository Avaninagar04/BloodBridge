# BloodBridge AI

BloodBridge AI is a Supabase-backed blood donation coordination app with role-based dashboards, rule-based donor matching, emergency request handling, real-time notifications, and an optional Gemini chatbot.

## Features

- Supabase Auth signup/login with donor, recipient, and admin roles
- Automatic `profiles` creation from Supabase Auth metadata
- Donor dashboard with donor profile creation, compatibility-filtered requests, donation offers, and notifications
- Recipient dashboard with recipient profile creation, blood request creation, request status management, and notifications
- Admin dashboard with real Supabase counts and blood inventory
- Emergency request flow with priority scoring and compatible donor notifications
- Rule-based blood compatibility, donor matching, health eligibility, emergency priority, and notification generation
- Optional Gemini chatbot using `GEMINI_API_KEY`
- RLS-protected Supabase database schema
- Vercel-ready Next.js production build

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Supabase Auth and PostgreSQL
- Supabase Realtime for notifications
- Google Gemini REST API for optional chatbot responses
- Tailwind CSS

## Folder Structure

```txt
app/                  Next.js pages, route handlers, server actions
components/           Reusable UI and dashboard components
lib/ai/               Gemini and rule-based AI health logic
lib/blood/            Blood compatibility, matching, and priority scoring
lib/supabase/         Supabase browser/server/proxy helpers
lib/utils.ts          Shared utilities
types/                Shared TypeScript types
sql/                  Supabase schema and safe setup seed
docs/                 Deployment and manual verification docs
public/               Public assets
```

## Environment Variables

Create `.env.local` for local development and set the same values in Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.5-flash
```

`GEMINI_API_KEY` is optional. If it is missing, the chatbot returns:

```txt
AI assistant is currently disabled. Core BloodBridge features still work.
```

Google AI Studio may create newer authorization keys that start with `AQ`. Those are valid Gemini keys. Keep `GEMINI_API_KEY` server-only; do not prefix it with `NEXT_PUBLIC_`.

## Supabase Setup

1. Create a Supabase project.
2. Open Supabase SQL Editor.
3. Run `sql/schema.sql`.
4. Run `sql/seed.sql`.
5. In Supabase Authentication settings, add redirect URLs:

```txt
http://localhost:3000/auth/callback
https://your-vercel-domain.vercel.app/auth/callback
```

6. Configure email confirmation as desired:
   - Enabled: users confirm email before login.
   - Disabled: easier local testing.

## Admin Setup

There is no demo admin login. Create a real user through signup, then promote that user in Supabase SQL Editor:

```sql
update public.profiles
set role = 'admin'
where email = 'your-admin-email@example.com';
```

## Local Development

```bash
pnpm install
pnpm dev
```

Open:

```txt
http://localhost:3000
```

## Verification

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

Manual flow checks:

1. Sign up as donor using `/auth/sign-up?role=donor`.
2. Complete donor profile.
3. Sign out.
4. Sign up as recipient using `/auth/sign-up?role=recipient`.
5. Create a blood request.
6. Sign in as donor and confirm compatible requests appear.
7. Click `I Can Donate`.
8. Confirm recipient notification appears.
9. Submit an emergency request.
10. Promote a real user to admin and verify admin dashboard data.
11. Test chatbot with and without `GEMINI_API_KEY`.

## Vercel Deployment

1. Push the repo to GitHub.
2. Import it into Vercel.
3. Add environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.5-flash
```

4. Deploy.
5. Add the deployed callback URL to Supabase Authentication redirect URLs.

See `docs/DEPLOYMENT_CHECKLIST.md` for a concise checklist.

## Troubleshooting

- Missing Supabase env vars: configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Signup succeeds but login fails: check Supabase email confirmation settings.
- Redirect does not work after email confirmation: check Supabase redirect URLs and `NEXT_PUBLIC_SITE_URL`.
- Chatbot disabled: add `GEMINI_API_KEY`.
- No donor requests shown: create a recipient request with a blood type compatible with the donor profile.
- Admin dashboard inaccessible: promote a real signed-up user to `admin`.

## Security Notes

- No demo mode.
- No auth bypass.
- No mock Supabase fallback.
- Private Gemini keys are server-only.
- Client Supabase uses only the public anon key.
- RLS is enabled on all user-facing tables.
