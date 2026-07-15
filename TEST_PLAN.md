# Test Plan

**Last updated:** 2026-07-15, verified against commit `b0b9357`

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

The `users` table must exist before any signup/login row below can pass —
run `db/migrations/001_users.sql` once via the Supabase SQL Editor (dashboard
→ SQL Editor → paste → Run). PostgREST can't execute DDL, so this can't be
automated from the app.

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

`src/app/dashboard/page.tsx`.

| # | Test case | Steps | Expected result | Last verified | Verified by |
|---|---|---|---|---|---|
| 6.1 | No-cookie redirect | Visit `/dashboard` with no session cookie (works even without Supabase reachable — `dashboard/page.tsx` only calls `getSession()`, never touches Supabase directly) | Server-side `redirect('/login')` fires | ✅ 2026-07-15 | assistant (Playwright/local) |
| 6.2 | Authenticated render | Visit `/dashboard` with a valid session cookie | Renders "Welcome, {name}" / "{org} · {email}" from the real user | ⚠️ not run yet | 🧑 manual only |

## 7. Deployment / build health

| # | Test case | Steps | Expected result | Last verified | Verified by |
|---|---|---|---|---|---|
| 7.1 | `npm run verify` passes | Run locally after any change | Typecheck, lint, and build (with zero env vars set) all pass | ✅ 2026-07-15 | assistant (local) |
| 7.2 | Vercel env vars set | Check Vercel project settings | `SESSION_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` all present | ⚠️ not run yet | 🧑 manual only |
| 7.3 | `users` table migration applied | Check Supabase dashboard | `db/migrations/001_users.sql` has been run | ⚠️ not run yet | 🧑 manual only |
| 7.4 | Live deployment smoke test | Visit the deployed `*.vercel.app` URL, run through signup → dashboard → logout → login | All steps succeed against the real deployment | ⚠️ not run yet | 🧑 manual only |

## Known gaps

No automated component-test (Vitest/Testing Library) or E2E (Playwright
config) framework exists in this repo yet — this document is a checklist
substitute, not a replacement for one. Revisit once the component count or
auth surface grows enough to justify the setup cost.
