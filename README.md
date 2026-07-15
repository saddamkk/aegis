# AEGIS Design System — component library

A React/Tailwind implementation of the AEGIS design tokens and components,
built from the Claude Design handoff (`project/AEGIS Design System.dc.html`
and `project/uploads/AEGIS_Design_System_v1.docx` at the repo root).

Scope: **design tokens + component library** — no full styleguide
documentation page, no interactive inbox screen. `src/app/page.tsx` is a
demo/smoke-test harness showing each component, not a styleguide.

## Decisions baked in

- **Font**: Inter (loaded via `next/font/google`), not the spec's
  zero-latency system-sans default — this was an explicit open decision in
  the spec, resolved by the user in favor of cross-platform consistency.
- **Dark mode default**: detects `prefers-color-scheme` on first load (via a
  blocking inline script in `layout.tsx` to avoid a flash), then the toggle
  persists an explicit choice to `localStorage`. Also an explicitly resolved
  open decision — the spec's default was light-always.
- Where the built `.dc.html` and the spec doc (`.docx`) disagreed on a
  visual detail, the `.dc.html` (the final, screenshot-verified artifact)
  was treated as ground truth.

## Structure

- `src/lib/aegis/tokens.ts` — color, type, spacing, radius, and motion
  tokens (source of truth, mirrored as CSS variables).
- `src/app/globals.css` — CSS variables for light/dark surfaces, fixed
  classification-status colors, spacing/radius scale, and the
  `aegisStream` / `aegisPulse` keyframes (with `prefers-reduced-motion`
  fallback).
- `src/theme/ThemeProvider.tsx` — theme context + `useTheme()` hook.
- `src/components/aegis/` — `Button`, `Badge` (classification + status
  pills), `StatCard`, `PipelineBar`, `DraftBlock`, `EmailCard`, `Input`,
  `ThemeToggle`, and the icon set, all exported from `index.ts`.

## Auth flow

`/login` is a single page with a Log in / Sign up tab switcher, styled with
the AEGIS components above. It's wired to real (if minimal) auth:

- `src/lib/supabase.ts` — lazy Supabase client (`@supabase/supabase-js`)
  using the `service_role` key, talking to Supabase's REST API (PostgREST)
  rather than a raw Postgres connection. Chosen over a direct `postgres`
  wire-protocol connection because it works over plain HTTPS — no TCP
  connection-pool exhaustion risk on serverless, and no dependency on
  raw-Postgres-port egress being reachable.
- `db/migrations/001_users.sql` — creates the `users` table. PostgREST
  can't run arbitrary DDL, so this must be run once by hand: Supabase
  dashboard → SQL Editor → paste → Run.
- `src/lib/auth/users.ts` — bcrypt-hashed passwords, queried via the above.
- `src/lib/auth/session.ts` — `iron-session`-backed encrypted cookie
  session. Requires a `SESSION_SECRET` env var (32+ random chars) — see
  `.env.example`. Validated lazily on first request, not at import time,
  so a missing env var doesn't crash the Next.js build.
- `src/app/api/auth/{signup,login,logout,session}/route.ts` — API routes.
- `/dashboard` — a minimal protected page (server-side redirect to
  `/login` if unauthenticated) demonstrating the gated destination. Uses
  `getActiveSession()`, which re-checks `blocked` status against the
  database on every load — a blocked user's session dies the next time
  they hit a protected route, not the instant they're blocked (no push
  mechanism exists).

## Admin panel

`/admin/*` is a **completely separate system** from the public user auth
above — its own `admins` table, its own session cookie
(`aegis_admin_session`, `ADMIN_SESSION_SECRET`), its own login page
(`/admin/login`, no public sign-up). A bug in the public signup/login flow
can't grant admin access, by construction.

- **Roles**: `master_admin` and `admin`. Only `master_admin` can add other
  admins (`/admin/admins` — gated both in the page itself and in the
  `POST /api/admin/admins` route via `requireMasterAdmin()`, so the UI gate
  isn't the only thing standing between a regular admin and that endpoint).
- **Bootstrapping**: nothing public can ever create the first master admin.
  Run `npm run seed:admin` (reads `MASTER_ADMIN_EMAIL` /
  `MASTER_ADMIN_PASSWORD`, idempotent) after running the migrations below.
- **Subscription packages** (`/admin/packages`): structure only, per the
  original ask — `name`, `tier` (free-form text, not a locked enum; loose
  convention so far is `free` / `advanced`), `price_cents`, `description`,
  `is_active`. Tier specifics aren't decided yet; expect this to change.
- **Platform users** (`/admin/users`): lists `id`, signup date, org,
  subscription package, and blocked status — **no email or name is ever
  queried or displayed**, by design. Admins can block/unblock; blocking
  also kills the user's active session (see `getActiveSession()` above) and
  rejects any future login attempt with a distinct "account suspended"
  message.
- `db/migrations/002_admin.sql` — creates `admins` and
  `subscription_packages`, adds `blocked` and `subscription_package_id` to
  `users`. Run after `001_users.sql`.

## Development

```bash
cp .env.example .env.local   # fill in the session secrets and SUPABASE_* vars
npm run dev      # http://localhost:3000
npm run verify   # typecheck + lint + build
```

On Vercel, set `SESSION_SECRET`, `ADMIN_SESSION_SECRET`, `SUPABASE_URL`, and
`SUPABASE_SERVICE_ROLE_KEY` as project environment variables (Settings →
Environment Variables) — the build succeeds without them, but auth routes
need them at runtime. `MASTER_ADMIN_EMAIL` / `MASTER_ADMIN_PASSWORD` are
only needed locally/once when running `npm run seed:admin`.

See [`TEST_PLAN.md`](./TEST_PLAN.md) for the checklist of what to verify
before/after a change — kept up to date alongside new components/routes.
