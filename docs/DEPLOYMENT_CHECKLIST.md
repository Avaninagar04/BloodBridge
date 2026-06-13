# BloodBridge Deployment Checklist

## 1. Supabase

1. Create a Supabase project.
2. Open SQL Editor.
3. Run `sql/schema.sql`.
4. Run `sql/seed.sql`.
5. In Authentication > URL Configuration, set:
   - Site URL: `https://your-vercel-domain.vercel.app`
   - Redirect URL: `https://your-vercel-domain.vercel.app/auth/callback`
   - Local redirect URL: `http://localhost:3000/auth/callback`
6. Sign up once in the app.
7. Promote your admin account in SQL Editor:

```sql
update public.profiles
set role = 'admin'
where email = 'your-admin-email@example.com';
```

## 2. Environment Variables

Set these locally and in Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GEMINI_API_KEY=your-gemini-api-key
```

`GEMINI_API_KEY` is optional. If it is missing, only the chatbot is disabled.

## 3. Local Verification

```bash
pnpm install
pnpm exec tsc --noEmit
pnpm lint
pnpm build
pnpm dev
```

## 4. Manual App Test

1. Sign up as a donor.
2. Complete donor profile.
3. Sign out.
4. Sign up as a recipient.
5. Create a blood request.
6. Sign in as donor.
7. Confirm the compatible request appears.
8. Click `I Can Donate`.
9. Confirm the recipient receives a notification.
10. Submit an emergency request.
11. Sign in as admin.
12. Confirm dashboard counts and inventory load from Supabase.
13. Test chatbot with and without `GEMINI_API_KEY`.

## 5. Vercel

1. Push the repo to GitHub.
2. Import the repo in Vercel.
3. Add the environment variables above.
4. Deploy.
5. Add the deployed `/auth/callback` URL to Supabase redirect URLs.
