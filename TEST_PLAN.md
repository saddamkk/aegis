# Test Plan

**Last updated:** 2026-07-15, verified against commit `450a5cc` (this update
adds the admin panel — sections 8–11 — and revises section 6)

**Update rule:** any change that adds a component, route, or env dependency
adds a row to this file in the same commit. Any change to an existing
checklist item's *behavior* updates that row's "Last verified" only after
actually re-running it — don't bump the date just because the code changed.

## Status legend

| Symbol | Meaning |
|---|---|
| ✅ | Verified — passed the last time it was actually run |
| ❌ | Verified — currently failing |
| ⚠️ | Not run yet |
| 🧑 | Manual only — see "Why some rows say 🧑 manual only" below |

## Prerequisites

```bash
cp .env.example .env.local   # fill in SESSION_SECRET and the SUPABASE_* vars
npm install
npm run dev                  # http://localhost:3000
```

Run both migrations, in order, via the Supabase SQL Editor (dashboard → SQL
Editor → paste → Run) — PostgREST can't execute DDL, so this can't be
automated from the app:

```
db/migrations/001_users.sql
db/migrations/002_admin.sql
```

Then create the first master admin (idempotent, safe to re-run):

```bash
npm run seed:admin   # reads MASTER_ADMIN_EMAIL / MASTER_ADMIN_PASSWORD
```

## Automated checks

```bash
npm run verify   # typecheck && lint && build
```

Covers: TypeScript errors (prop mismatches, wrong types), lint issues
(unused vars, hook rules), and that every route compiles and prerenders
(including with zero env vars set, matching Vercel's default state — see
`src/lib/auth/session.ts` and `src/lib/supabase.ts`, both validate their
required env vars lazily on first use rather than at import time, precisely
so a missing var doesn't crash the build).

Does **not** cover: actual runtime behavior, visual correctness, or
anything that touches a real database or deployment. That's what the
checklists below are for.

## Why some rows say "🧑 manual only"

This assistant's coding sessions run in a sandbox with a strict outbound
network allowlist — `github.com` and `registry.npmjs.org` are reachable,
but the project's Supabase host (`*.supabase.co`) and Vercel deployment
(`*.vercel.app`) are not (confirmed: both return `403 Host not in
allowlist`). So any check that needs a real row in the `users` table, a
real session round-trip, or the live deployed URL can only be run by a
human, or by the assistant in a session whose environment happens to have
that specific domain allowlisted. Rows marked 🧑 aren't being skipped out
of laziness — they're structurally out of reach from here.

---

## 1. Component library

`src/components/aegis/` — Button, Badge, StatCard, PipelineBar, DraftBlock,
EmailCard, ThemeToggle, Input, icons. Demo harness: `src/app/page.tsx`.

Automated coverage: typecheck catches prop mismatches (wrong `BadgeTone`,
missing required props); build confirms the demo page compiles/prerenders.
Does not catch: whether things actually look/behave right.

| # | Test case | Steps | Expected result | Last verified | Verified by |
|---|---|---|---|---|---|
| 1.1 | Button variants render distinctly | Load `/`, inspect all 4 Button variants | `primary`/`secondary`/`danger`/`ghost` are visually distinct per spec | ✅ 2026-07-15 | assistant (Playwright/local) |
| 1.2 | Badge tones render | Load `/`, inspect all 9 badge tones | All render with correct color; `fyi` renders as a bordered/muted chip, not tinted (intentional exception in `Badge.tsx`) | ✅ 2026-07-15 | assistant (Playwright/local) |
| 1.3 | StatCard values/colors | Load `/`, inspect 4 stat cards | Icon/value/label/delta colors match spec (accent blue, green, amber) | ✅ 2026-07-15 | assistant (Playwright/local) |
| 1.4 | PipelineBar states | Load `/`, inspect pipeline bar | `done` steps show checkmark + tint, `active` is solid-filled, `waiting` is bordered-only | ✅ 2026-07-15 | assistant (Playwright/local) |
| 1.5 | PipelineBar size variants | Compare standalone (`md`) vs. EmailCard-nested (`sm`) bars | `sm` renders visibly smaller than `md` | ✅ 2026-07-15 | assistant (Playwright/local) |
| 1.6 | DraftBlock replay | Click "↺ Replay draft stream" | `streamKey` bumps, stream-in animation restarts | ✅ 2026-07-15 (confirmed via DOM remount, not just "no error") | assistant (Playwright/local) |
| 1.7 | DraftBlock approve pulse | Click "Approve & send" | Pulse animation fires, label shows "Sent ✓" for ~1.6s, then reverts | ✅ 2026-07-15 | assistant (Playwright/local) |
| 1.8 | EmailCard expand/collapse | Click header row; also try `Enter`/`Space` on it | Toggles `open`, shows/hides children; left border color matches `classification` tone | ✅ 2026-07-15 | assistant (Playwright/local) |

## 2. Theme (light/dark)

`src/theme/ThemeProvider.tsx`, blocking init script in `src/app/layout.tsx`,
CSS vars in `src/app/globals.css`.

Automated coverage: typecheck/build only confirm the provider compiles —
doesn't exercise actual class toggling, localStorage, or OS-preference
detection.

| # | Test case | Steps | Expected result | Last verified | Verified by |
|---|---|---|---|---|---|
| 2.1 | First load, OS dark, no stored pref | Clear localStorage, emulate `prefers-color-scheme: dark`, load `/` | `<html>` has `.dark` class before first paint (no flash) | ✅ 2026-07-15 | assistant (Playwright/local) |
| 2.2 | First load, OS light, no stored pref | Clear localStorage, emulate light, load `/` | No `.dark` class | ✅ 2026-07-15 | assistant (Playwright/local) |
| 2.3 | Manual toggle persists | Click `ThemeToggle` (note: only present on `/` today — `/login` and `/dashboard` have no toggle UI, they just inherit whatever class the init script set), reload | Toggle changes class immediately; `aegis-theme` key set in localStorage; reload keeps the stored choice over OS preference | ✅ 2026-07-15 — found & fixed a real bug: reload after toggling logged a React hydration-mismatch warning on `<html>` (server-rendered class didn't include `.dark`, pre-hydration script added it). Fixed with `suppressHydrationWarning` on `<html>` in `layout.tsx`; re-verified clean after the fix. | assistant (Playwright/local) |
| 2.4 | Reduced motion respected | Emulate `prefers-reduced-motion: reduce`, trigger DraftBlock stream/pulse | Animations are instant/disabled per the fallback rule in `globals.css` | ✅ 2026-07-15 | assistant (Playwright/local) |

## 3. Auth — Sign up

`src/app/login/page.tsx` (Sign up tab), `POST /api/auth/signup`,
`src/lib/auth/{validation,users}.ts`.

Automated coverage: typecheck covers request/response shapes. Does not
touch Supabase.

| # | Test case | Steps | Expected result | Last verified | Verified by |
|---|---|---|---|---|---|
| 3.1 | Empty-field validation | Submit signup with all fields blank | Errors for name, org, email, password all shown together (not just the first) | ✅ 2026-07-15 | assistant (local API call) |
| 3.2 | Malformed email | Submit with `email: "not-an-email"` | `errors.email = "Enter a valid email address."` | ✅ 2026-07-15 | assistant (local API call) |
| 3.3 | Short password | Submit with password < 8 chars | `errors.password = "Password must be at least 8 characters."` | ✅ 2026-07-15 | assistant (local API call) |
| 3.4 | Password mismatch | `password` ≠ `confirmPassword` | `errors.confirmPassword = "Passwords do not match."` | ✅ 2026-07-15 | assistant (local API call) |
| 3.5 | Malformed request body | `POST /api/auth/signup` with non-JSON body | `400 {error: 'Invalid request body.'}` | ✅ 2026-07-15 | assistant (local API call) |
| 3.6 | Live signup success | Submit a valid new signup against the real DB | `200 {user}`, `aegis_session` cookie set, redirected to `/dashboard` showing correct name/org/email | ⚠️ not run yet | 🧑 manual only |
| 3.7 | Duplicate email | Sign up twice with the same email | Second attempt: `409 {errors:{email: "An account with this email already exists."}}` | ⚠️ not run yet | 🧑 manual only |

## 4. Auth — Log in

`src/app/login/page.tsx` (Log in tab), `POST /api/auth/login`.

| # | Test case | Steps | Expected result | Last verified | Verified by |
|---|---|---|---|---|---|
| 4.1 | Empty-field validation | Submit login with blank email/password | `validateLogin` errors shown | ✅ 2026-07-15 | assistant (local API call) |
| 4.2 | Malformed email | Submit with an invalid email format | `errors.email` shown | ✅ 2026-07-15 | assistant (local API call) |
| 4.3 | Live login success | Submit correct credentials for an existing user | `200 {user}`, session cookie set, redirected to `/dashboard` | ⚠️ not run yet | 🧑 manual only |
| 4.4 | Wrong password / unknown email | Submit wrong password, then a nonexistent email | Both: `401 {errors:{password: "Invalid email or password."}}` — same generic message and similar response time for both cases (`verifyUser` compares against a dummy hash when the user doesn't exist, so the two paths don't leak which one failed via timing) | ⚠️ not run yet | 🧑 manual only |

## 5. Auth — Logout & session

`POST /api/auth/logout`, `GET /api/auth/session`, `src/lib/auth/session.ts`.

| # | Test case | Steps | Expected result | Last verified | Verified by |
|---|---|---|---|---|---|
| 5.1 | Missing `SESSION_SECRET` | Unset/shorten `SESSION_SECRET` in `.env.local`, hit any auth route | Explicit thrown error ("must be set... at least 32 characters"), not a silent 500 or build crash | ✅ 2026-07-15 — confirmed the exact error is logged server-side and the route returns 500 (not a build-time crash) | assistant (local, temporarily blanked `.env.local`) |
| 5.2 | Session probe, no cookie | `GET /api/auth/session` with no cookie | `{user: null}` | ✅ 2026-07-15 | assistant (local API call) |
| 5.3 | Logout | Log in, then click "Log out" on `/dashboard` | `POST /api/auth/logout` → `200 {ok:true}`, session destroyed, redirected to `/login` | ⚠️ not run yet | 🧑 manual only |
| 5.4 | Session probe, valid cookie | `GET /api/auth/session` after a real login | `{user: {...}}` matching the logged-in user | ⚠️ not run yet | 🧑 manual only |

## 6. Protected routes

`src/app/dashboard/page.tsx`, `src/lib/auth/session.ts` (`getActiveSession`).

| # | Test case | Steps | Expected result | Last verified | Verified by |
|---|---|---|---|---|---|
| 6.1 | No-cookie redirect | Visit `/dashboard` with no session cookie (works even without Supabase reachable — the pre-check in `getActiveSession()` only does a DB lookup when a cookie's `user` is present) | Server-side `redirect('/login')` fires | ✅ 2026-07-15 | assistant (Playwright/local) |
| 6.2 | Authenticated render | Visit `/dashboard` with a valid session cookie | Renders "Welcome, {name}" / "{org} · {email}" from the real user | ⚠️ not run yet | 🧑 manual only |
| 6.3 | Block kills active session | Log in as a user, have an admin block that user (§11), then reload `/dashboard` | `getActiveSession()`'s live `blocked` check destroys the session; redirected to `/login` on the next authenticated request (not instantly — no push mechanism exists) | ⚠️ not run yet | 🧑 manual only |
| 6.4 | Blocked user can't log back in | With the same blocked user, attempt to log in again with correct credentials | `401 {errors:{password: "This account has been suspended."}}` — a deliberately distinct message from the generic wrong-password one (see `verifyUser` in `src/lib/auth/users.ts`) | ⚠️ not run yet | 🧑 manual only |

## 7. Deployment / build health

| # | Test case | Steps | Expected result | Last verified | Verified by |
|---|---|---|---|---|---|
| 7.1 | `npm run verify` passes | Run locally after any change | Typecheck, lint, and build (with zero env vars set) all pass | ✅ 2026-07-15 | assistant (local) |
| 7.2 | Vercel env vars set | Check Vercel project settings | `SESSION_SECRET`, `ADMIN_SESSION_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` all present | ⚠️ not run yet | 🧑 manual only |
| 7.3 | Migrations applied | Check Supabase dashboard | Both `db/migrations/001_users.sql` and `002_admin.sql` have been run | ⚠️ not run yet | 🧑 manual only |
| 7.4 | Live deployment smoke test | Visit the deployed `*.vercel.app` URL, run through signup → dashboard → logout → login | All steps succeed against the real deployment | ⚠️ not run yet | 🧑 manual only |
| 7.5 | Master admin seeded | Run `npm run seed:admin` against production, or confirm it's already been run | Exactly one `master_admin` row exists in `admins`; script is idempotent (safe to re-run) | ⚠️ not run yet | 🧑 manual only |

## 8. Admin auth

`src/app/admin/login/page.tsx`, `POST /api/admin/auth/{login,logout,session}`,
`src/lib/admin/{session,admins,validation}.ts`. Deliberately isolated from
the public user auth system — separate cookie (`aegis_admin_session`),
separate secret (`ADMIN_SESSION_SECRET`), separate `admins` table. No public
sign-up exists for this system; see §"Master admin bootstrap" in
`.env.example`.

| # | Test case | Steps | Expected result | Last verified | Verified by |
|---|---|---|---|---|---|
| 8.1 | Empty-field validation | Submit admin login with blank email/password | `validateAdminLogin` errors shown | ✅ 2026-07-15 | assistant (local API call) |
| 8.2 | Malformed email | Submit with an invalid email format | `errors.email` shown | ✅ 2026-07-15 | assistant (local API call) |
| 8.3 | Malformed request body | `POST /api/admin/auth/login` with non-JSON body | `400 {error: 'Invalid request body.'}` | ✅ 2026-07-15 | assistant (local API call) |
| 8.4 | Missing `ADMIN_SESSION_SECRET` | Blank it in `.env.local`, hit `/api/admin/auth/session` | Explicit thrown error, not a silent 500 or build crash | ✅ 2026-07-15 | assistant (local, temporarily blanked `.env.local`) |
| 8.5 | No-cookie redirect | Visit `/admin`, `/admin/admins`, or `/admin/packages` with no admin session cookie | Server-side `redirect('/admin/login')` fires — doesn't need Supabase reachable | ✅ 2026-07-15 | assistant (Playwright/local) |
| 8.6 | Live admin login success | Log in with a real admin's credentials | `200 {admin}`, `aegis_admin_session` cookie set, redirected to `/admin` | ⚠️ not run yet | 🧑 manual only |
| 8.7 | Wrong password | Submit wrong password for a real admin email | `401 {errors:{password: "Invalid email or password."}}` | ⚠️ not run yet | 🧑 manual only |
| 8.8 | Admin logout | Click "Log out" in the admin nav | Session destroyed, redirected to `/admin/login` | ⚠️ not run yet | 🧑 manual only |

## 9. Admin role gating (master admin vs. admin)

`src/app/admin/(protected)/{layout,AdminNav}.tsx`,
`src/app/admin/(protected)/admins/page.tsx`, `src/lib/admin/guard.ts`
(`requireAdmin` / `requireMasterAdmin`). "Add admin" is restricted to
`master_admin` — regular `admin` accounts can view packages/users but not
manage other admins.

Verified locally using cryptographically real (`iron-session` `sealData`)
but hand-constructed session cookies for each role — this exercises the
actual cookie-decrypt + role-check code path without needing a real login
against the (network-blocked-from-this-sandbox) database.

| # | Test case | Steps | Expected result | Last verified | Verified by |
|---|---|---|---|---|---|
| 9.1 | Nav hides Admins tab for regular admin | Valid session, `role: 'admin'`, visit `/admin/users` | "Admins" link absent from nav | ✅ 2026-07-15 | assistant (forged session cookie, local) |
| 9.2 | Nav shows Admins tab for master admin | Valid session, `role: 'master_admin'`, visit `/admin/users` | "Admins" link present | ✅ 2026-07-15 | assistant (forged session cookie, local) |
| 9.3 | Page-level gate blocks regular admin | Valid session, `role: 'admin'`, visit `/admin/admins` directly (not via nav) | Shows "Master admin only" message, not the admin list/form — the API (`requireMasterAdmin`) would also reject it even if the page-level check were bypassed | ✅ 2026-07-15 | assistant (forged session cookie, local) |
| 9.4 | Page-level gate allows master admin | Valid session, `role: 'master_admin'`, visit `/admin/admins` | Renders the add-admin form + list (list itself fails to load here — DB unreachable from this sandbox, see §11) | ✅ 2026-07-15 | assistant (forged session cookie, local) |
| 9.5 | Live create-admin as master admin | A real master admin adds a new admin via the form | `200 {admin}`, new row appears in the list on reload | ⚠️ not run yet | 🧑 manual only |
| 9.6 | API rejects non-master-admin | An `admin`-role session calls `POST /api/admin/admins` directly (bypassing the UI) | `403 {error: "Master admin only."}` | ✅ 2026-07-15 | assistant (forged session cookie, local API call) |

## 10. Subscription packages (admin panel)

`src/app/admin/(protected)/packages/page.tsx`,
`GET|POST /api/admin/packages`, `PATCH /api/admin/packages/[id]`,
`src/lib/admin/packages.ts`. Structure only, per the original ask — tier
specifics (what free vs. advanced actually include) aren't decided yet.

| # | Test case | Steps | Expected result | Last verified | Verified by |
|---|---|---|---|---|---|
| 10.1 | List-load failure degrades gracefully | Load `/admin/packages` with the DB unreachable | Shows "Couldn't load packages" instead of hanging on "Loading…" forever or throwing an unhandled rejection | ✅ 2026-07-15 — this was a real bug found while testing: the API's generic-error path returned an empty body, and the client blindly called `res.json()` on it, causing an unhandled promise rejection. Fixed by having every admin API route return a JSON body even for unexpected errors, and having every admin list page track a `loadFailed` state instead of assuming success. | assistant (Playwright/local) |
| 10.2 | Empty-field validation | Submit "Add package" with blank name/tier and negative price | `errors.name`, `errors.tier`, `errors.priceCents` all shown | ✅ 2026-07-15 | assistant (forged session cookie, local API call) |
| 10.3 | Live create package | Add a package with real values | `200 {package}`, appears in the list | ⚠️ not run yet | 🧑 manual only |
| 10.4 | Toggle active/inactive | Click "Deactivate" / "Activate" on a package | `PATCH` flips `is_active`; badge updates; still listed (soft toggle, not deleted) | ⚠️ not run yet | 🧑 manual only |

## 11. Platform users (admin panel)

`src/app/admin/(protected)/users/page.tsx`, `GET /api/admin/users`,
`POST /api/admin/users/[id]/{block,unblock}`,
`src/lib/admin/platformUsers.ts`. Per the original ask: no email or name is
ever queried or displayed here — only enough to manage the account.

| # | Test case | Steps | Expected result | Last verified | Verified by |
|---|---|---|---|---|---|
| 11.1 | No PII in the response | Inspect the `GET /api/admin/users` payload | Only `id`, `createdAt`, `org`, `blocked`, `package` — no `email` or `name` field present anywhere | ✅ 2026-07-15 — verified by reading `listPlatformUsers()`'s `.select()` call and the `PlatformUserListItem` type directly; email/name are never selected from the DB in the first place, so there's no field to accidentally leak | assistant (code review, not a live query) |
| 11.2 | List-load failure degrades gracefully | Load `/admin/users` with the DB unreachable | Same graceful "Couldn't load users" pattern as §10.1 | ✅ 2026-07-15 | assistant (Playwright/local) |
| 11.3 | Live list renders | Load `/admin/users` against a real DB with existing signups | Each row shows org, signup date, package badge, blocked/active badge | ⚠️ not run yet | 🧑 manual only |
| 11.4 | Block a user | Click "Block" on an active user | `POST .../block` → `200 {ok:true}`; badge flips to "Blocked"; see §6.3/§6.4 for the session/login consequences | ⚠️ not run yet | 🧑 manual only |
| 11.5 | Unblock a user | Click "Unblock" on a blocked user | `POST .../unblock` → `200 {ok:true}`; badge flips to "Active"; user can log in again | ⚠️ not run yet | 🧑 manual only |

## Known gaps

No automated component-test (Vitest/Testing Library) or E2E (Playwright
config) framework exists in this repo yet — this document is a checklist
substitute, not a replacement for one. Revisit once the component count or
auth surface grows enough to justify the setup cost.

The entire admin panel's *data-backed* behavior (§8.6–8.8, §9.5,
§10.3–10.4, §11.3–11.5) has never been exercised against a real database or
a real login — every ✅ in §8–11 covers routing/validation/role-gate logic
that's provable without live data (cookie decryption, guard checks,
graceful degradation), not the underlying database operations themselves.
Whoever runs the 🧑 manual-only rows first should treat this as the actual
first real test of `src/lib/admin/{admins,packages,platformUsers}.ts` — not
a formality.
