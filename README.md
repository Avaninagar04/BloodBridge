# BloodBridge AI

BloodBridge AI is an AI-powered blood donation and emergency response web app that connects donors, recipients, and administrators through intelligent matching, real-time notifications, and secure role-based dashboards.

## Overview

BloodBridge AI helps recipients create urgent blood requests and helps donors discover compatible requests based on blood type, eligibility, availability, and location details. The app combines rule-based medical compatibility logic with a Gemini-powered assistant for donation guidance and education.

## Core Features

- Real Supabase authentication
- Donor, recipient, and admin dashboards
- Blood compatibility checker
- Smart donor-recipient matching
- Emergency blood request flow
- Donation offer tracking
- Real-time notifications
- Blood inventory management
- Donor health eligibility scoring
- Gemini-powered AI assistant
- Secure PostgreSQL RLS policies
- Production-ready Vercel deployment setup

## AI Features

BloodBridge AI includes two types of AI-powered functionality:

- Rule-based AI logic for blood compatibility, donor matching, emergency priority, health eligibility, and notification generation
- Gemini chatbot support for donation education, eligibility questions, compatibility explanations, and emergency response guidance

The core app works even if Gemini is not configured. When `GEMINI_API_KEY` is missing, the assistant is disabled safely while dashboards, requests, matching, and notifications continue to work.

## User Roles

Donors can:

- Create and update donor profile
- Add blood type, age, weight, health status, city, and area
- Set availability
- View compatible blood requests
- Offer to donate
- Track donation activity
- Receive notifications

Recipients can:

- Create blood requests
- Add blood type, units needed, hospital, doctor, contact, city, and area
- Track request status
- View donation offers
- Receive emergency and donation notifications

Admins can:

- View users, donors, recipients, requests, donations, and inventory
- Manage blood inventory
- Monitor platform activity
- Access protected admin-only dashboard

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase PostgreSQL
- Supabase Realtime
- Gemini API
- Vercel

## Environment Variables

Create `.env.local` for local development:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
```

For Vercel, add:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
```

Never commit `.env.local`.

## Local Development

```bash
pnpm install
pnpm dev
```

Open:

```txt
http://localhost:3000
```

## Database Setup

Run the SQL files in Supabase SQL Editor:

```txt
sql/schema.sql
sql/seed.sql
sql/settings_preferences.sql
sql/location_schedule_impact_update.sql
```

Then configure Supabase Auth URL settings:

```txt
http://localhost:3000
http://localhost:3000/auth/callback
```

For production, add your Vercel URL and callback URL.

## Deployment

1. Push the project to GitHub.
2. Import the GitHub repo into Vercel.
3. Add all environment variables in Vercel.
4. Deploy.
5. Add the Vercel callback URL in Supabase Auth settings:

```txt
https://your-vercel-domain.vercel.app/auth/callback
```

## Project Goal

BloodBridge AI is designed to reduce delays in emergency blood donation by helping the right donor find the right recipient faster through secure data, intelligent matching, and AI-assisted guidance.
