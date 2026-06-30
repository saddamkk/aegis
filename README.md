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
  pills), `StatCard`, `PipelineBar`, `DraftBlock`, `EmailCard`,
  `ThemeToggle`, and the icon set, all exported from `index.ts`.

## Development

```bash
npm run dev      # http://localhost:3000
npm run build
npm run lint
```
