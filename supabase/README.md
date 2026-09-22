# Supabase authentication setup

The portfolio includes real Supabase email/password authentication, a protected member dashboard, and an administrator dashboard. The browser uses only a publishable key; authorization is enforced by PostgreSQL row-level security.

## 1. Create or connect a Supabase project

Create a project at Supabase, then open **Project Settings → API** and copy:

- Project URL
- Publishable key (the legacy `anon` key also works)

Never put a `service_role` or secret key in this application.

## 2. Apply the database setup

Open **SQL Editor** in Supabase and run [setup.sql](./setup.sql) in full. It creates:

- `public.profiles`
- a signup trigger that creates user profiles
- restricted grants and row-level security policies
- a private admin-role helper used by RLS

## 3. Configure the application

Copy `.env.example` to `.env`, then set:

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Restart the server after changing environment variables.

## 4. Configure email authentication

In **Authentication → URL Configuration**, set the production Site URL. For local development, add `http://localhost:3000` to the allowed redirect URLs. Email/password signup must be enabled in **Authentication → Providers**.

If email confirmation is enabled, new users must confirm their email before signing in.

## 5. Create the first administrator

Create an account through `login.html`, then run this statement once in the Supabase SQL Editor:

```sql
update public.profiles
set role = 'admin'
where email = 'your-admin@example.com';
```

The same login page provides **User login** and **Admin login** tabs. The admin tab rejects accounts whose protected profile role is not `admin`.

## Security model

- Signed-out visitors cannot read or write profiles.
- Users can read their own profile and update only `full_name` or `avatar_url`.
- Users cannot promote themselves because the `role` column is not granted for client updates.
- Administrators can list all profiles through an RLS policy.
- Admin authorization is enforced in the database, not only by hiding UI.
