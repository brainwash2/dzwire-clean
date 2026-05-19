# DzWire

DzWire is a trilingual Algerian news hub built with Next.js 15, TypeScript, Tailwind v4, Framer Motion, Sanity, and PostgreSQL.

## Features
- French / Arabic / English UI
- Dark neon design
- News, globe, map, and events pages
- Password-protected admin panel for events
- PostgreSQL-backed auth/session and event data

## Project structure
- `app/` — routes and pages
- `components/` — UI components
- `lib/` — backend logic, DB helpers, shared utilities
- `replit.md` — app overview
- `PROJECT_PROGRESS.md` — progress tracker
- `WHERE_IS_THE_CODE.md` — quick navigation guide

## Local setup
1. Install dependencies:
```bash
pnpm install
```
2. Set environment variables:
- `DATABASE_URL`
- `SESSION_SECRET`
- `REPL_ID`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_API_READ_TOKEN`
- `SANITY_WRITE_TOKEN`

3. Run dev server:
```bash
pnpm --filter @workspace/dzwire run dev
```

## Database
The app uses PostgreSQL through `pg`.

It auto-creates these tables on startup:
- `users`
- `sessions`
- `user_subscriptions`
- `payment_logs`
- `admin_settings`
- `custom_events`

### Neon or Supabase
To use Neon or Supabase, just replace `DATABASE_URL` with the provider connection string.

## Admin panel
Open:
- `/admin/events`

First visit:
- create an admin password
- then log in with it later

## Build
```bash
pnpm --filter @workspace/dzwire run build
```

## Start production server
```bash
pnpm --filter @workspace/dzwire run start
```

## Push to GitHub
If you already have the repo locally:
```bash
git init
git add .
git commit -m "Initial DzWire import"
git remote add origin <your-github-repo-url>
git push -u origin main
```

If the repo already exists:
```bash
git add .
git commit -m "Update DzWire"
git push
```

## Deploy
### Replit
- Keep the workflow running
- Set the required secrets in Replit
- Use the preview / deployment tools

### Real domain
1. Deploy the app
2. Point your domain to the deployment URL
3. Make sure `DATABASE_URL` points to the production DB
4. Set `NEXT_PUBLIC_BASE_URL` to your live domain if needed

### Launch checklist
- `DATABASE_URL`
- `SESSION_SECRET`
- `REPL_ID`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_API_READ_TOKEN`
- `SANITY_WRITE_TOKEN`
- Confirm `/admin/events` opens and accepts a password
- Confirm `/[locale]/events` loads events from DB
- Confirm `pnpm --filter @workspace/dzwire run build` passes before deploy

## Helpful files
- `artifacts/dzwire/app/admin/events/page.tsx`
- `artifacts/dzwire/app/api/admin/*`
- `artifacts/dzwire/lib/db.ts`
- `artifacts/dzwire/lib/db-events.ts`
