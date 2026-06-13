# BloodBridge - Blood Donor Connection System

A modern web application that connects blood donors with recipients in need.

## ✅ Features Implemented

- **User Authentication**: Sign up and login with email/password
- **Role-Based Access**: Separate dashboards for Donors, Recipients, and Admins
- **Responsive Design**: Works on desktop and mobile devices
- **Database Integration**: Supabase backend with secure data storage
- **Role-Based Routing**: Automatically routes users to their appropriate dashboard based on their role

## 🚀 Getting Started

### Test Accounts

Use these credentials to test the application:

**Donor Account:**
- Email: `donor@example.com`
- Password: `Password123!`
- Role: Blood Donor

**Recipient Account:**
- Email: `recipient@example.com`  
- Password: `Password123!`
- Role: Blood Recipient

**Demo Account:**
- Email: `demo@test.com`
- Password: `Demo123!`
- Role: Blood Donor

## 🔧 Setup Instructions

### Environment Variables

The following environment variables are required:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These are already configured in the `.env.local` file.

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open http://localhost:3000 in your browser
```

## 📱 User Flow

1. **Sign Up**: Create a new account with email, password, and role selection
2. **Login**: Enter email and password to access your dashboard
3. **Dashboard**: 
   - Donors can view blood requests and register to donate
   - Recipients can create blood requests and track donations
   - Admins can manage all requests and users
4. **Logout**: Click logout to return to the login page

## 🗄️ Database Schema

- `profiles`: User profile information with roles
- `donors`: Donor-specific data (blood type, availability)
- `recipients`: Recipient-specific data (blood type, medical condition)
- `blood_requests`: Blood requests from recipients
- `donations`: Donation records and history
- `notifications`: User notifications

## 🔒 Security Features

- Row-Level Security (RLS) enabled on all tables
- Password encryption with bcrypt
- Session-based authentication
- User-scoped data access

## 📞 Support

For issues or questions, please refer to the application's help section or contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: December 2024
