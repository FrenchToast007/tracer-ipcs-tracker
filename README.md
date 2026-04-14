# Tracer IPCS Tracker

A small team app for running the IPCS rollout — Stage 0 (5S Blitz) through Stage 7. Built with React, TypeScript, Vite, Tailwind, Zustand, and Supabase.

Everyone on the team sees the same data, in real time.

---

## How the shared data works

- **Frontend:** React + Vite (static site — deploy anywhere that serves static files).
- **Backend:** Supabase (Postgres + Auth + Realtime).
- **Shared state:** A single row in the `app_state` table keyed `tracer-ipcs-main` whose `data` column is a JSONB blob of the full tracker state. Every approved user reads and writes that row. Supabase Realtime pushes changes to every open browser instantly.
- **Access control:** New users sign up but start with `approved = false`. An admin flips the flag in the Supabase dashboard. Row Level Security makes sure only approved users can read or write `app_state`.

---

## First-time setup (one time only)

You need three accounts, all free:

1. **Supabase** — https://supabase.com
2. **GitHub** — https://github.com
3. **Vercel** — https://vercel.com (sign in with GitHub)

### 1. Set up the Supabase project

1. Go to https://supabase.com, create a new project. Save the database password somewhere safe.
2. When it finishes provisioning, open **SQL Editor → New query**.
3. Open `supabase/schema.sql` from this repo, copy the whole file, paste it into the SQL editor, and click **Run**. This creates the tables, triggers, RLS policies, and realtime publication.
4. Go to **Authentication → Providers → Email**. Make sure Email is enabled. For easier onboarding, turn **off** "Confirm email" so new users can sign in without clicking a verification link.
5. Go to **Settings → API**. Copy:
   - `Project URL`
   - `anon` public key
6. In the project root, copy `.env.example` to `.env.local` and paste those two values in.

### 2. Approve yourself

1. `npm install`
2. `npm run dev`
3. In the app, click **Sign up**, create your account with your email and a password.
4. Back in Supabase, go to **Table Editor → user_profiles**. Find your row. Flip `approved` to `true` and set `role` to `admin`.
5. Refresh the app — you're in.

### 3. Approve teammates

Whenever a teammate signs up, they land on a "waiting for approval" screen. Go to **Table Editor → user_profiles** and flip their `approved` flag to `true`. Next time they refresh, they're in.

---

## Deploying to Vercel (so teammates can use it on the web)

1. Create a new GitHub repository (e.g. `tracer-ipcs-tracker`).
2. Push this project to it:
   ```bash
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/<your-username>/tracer-ipcs-tracker.git
   git push -u origin main
   ```
3. Go to https://vercel.com, click **Add New → Project**, import your GitHub repo.
4. Vercel will detect Vite automatically. Before clicking **Deploy**, expand **Environment Variables** and add:
   - `VITE_SUPABASE_URL` — your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` — your Supabase anon key
5. Click **Deploy**. In about a minute you'll get a URL like `https://tracer-ipcs-tracker.vercel.app`.
6. Share that URL with your team. Every push to `main` automatically redeploys.

**Important:** `.env.local` is in `.gitignore`, so your Supabase keys will **not** be pushed to GitHub. You set them in the Vercel dashboard instead.

---

## Local development

```bash
npm install          # install dependencies
npm run dev          # start dev server on http://localhost:5173
npm run build        # production build into dist/
npm run preview      # serve the production build locally
```

You need `.env.local` populated with your Supabase credentials before the app will start.

---

## Exporting data

Inside Stage 0, click **Export to Excel**. You'll get a multi-sheet `.xlsx` with:

- Summary, Activities, Zones, 5S Scores, Supplies, Red Tags, Maintenance Tags, Huddle Logs, Photos, KPIs, Exit Criteria.

All fields you've entered are included.
