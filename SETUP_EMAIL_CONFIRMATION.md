# Email Confirmation Setup

## Issue
By default, Supabase requires email confirmation before users can log in. Users see "Email not confirmed" error.

## Solution: Disable Email Confirmation (Development/Testing)

### Option 1: Via Supabase Dashboard (Recommended for Testing)

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Click on **Email**
5. Toggle OFF **Confirm email** 
6. Save changes

Users can now sign up and log in immediately without confirming their email.

### Option 2: Keep Email Confirmation (Production)

If you want to keep email confirmation enabled:

1. Users will sign up via the signup form
2. They'll see a success message asking them to check their email
3. They'll receive a confirmation link in their email
4. After clicking the link, they can log in
5. The confirmation link redirects to `/auth/callback` which exchanges the code for a session

## Testing Email Confirmation Locally

If you want to test email confirmation:

1. Keep email confirmation enabled in Supabase
2. Use a test email service like [Mailtrap](https://mailtrap.io/) or [MailHog](https://github.com/mailhog/MailHog)
3. Configure Supabase SMTP settings to use your test email service
4. Emails will be delivered to your test service instead of real email servers

## Current Status

The BloodBridge app supports both scenarios:
- Email confirmation is properly integrated at `/auth/callback`
- Success page guides users to check their email
- Login page shows helpful error messages

To complete the email confirmation flow, users need to disable email confirmation in their Supabase dashboard for development mode.
