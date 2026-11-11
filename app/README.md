# Smart Sanitation Complaint Management System – Chendra Gudem
React + Vite + Tailwind + Supabase (Auth, Postgres, Storage, RLS).

## Setup
1. Create a project at supabase.com.
2. SQL Editor → paste and run `supabase/schema.sql` (tables, RLS, functions, private storage bucket).
3. `cp .env.example .env` and fill in the Project URL and **anon** key (never the service-role key).
4. `npm install && npm run dev`
5. Register an account, then in the SQL editor run:
   `update public.profiles set role='admin' where email='you@example.com';`
6. As admin, open User Management to promote registered users to `officer`.

## Deploy
`npm run build`, then deploy `dist/` on Vercel/Netlify with the two env vars set and an SPA rewrite to `index.html`.

## Security notes
- Signup trigger always creates `villager`; a trigger blocks non-admins from changing `role`.
- Officers/admins change status only via the `update_complaint` function; villagers cannot edit status.
- Images live in a private bucket under `<user_id>/`, shown via signed URLs.

## Status
Code written but NOT yet tested against a live Supabase project. Test the checklist (register, login, submit with image, officer update, notification, role restrictions) before demo.
Future work: GPS, SMS/WhatsApp, AI classification, Android app, officer analytics page, category management UI, profile page, date filter.
