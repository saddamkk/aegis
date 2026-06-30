/**
 * AEGIS design tokens — source of truth, mirrored in `src/app/globals.css`.
 * Values transcribed from `project/AEGIS Design System.dc.html` (the built,
 * screenshot-verified artifact) and `AEGIS_Design_System_v1.docx` (the spec).
 */

export const brandColors = {
  navyPrimary: { hex: '#142259', use: 'Nav · CTAs · borders' },
  navyMid: { hex: '#1E3280', use: 'Hover states · icons' },
  navyTint: { hex: '#EEF2FF', use: 'Active bg · badges' },
  accentBlue: { hex: '#2563EB', use: 'Interactive elements' },
} as const;

export const lightSurfaces = {
  canvas: { hex: '#F4F6FB', use: 'Page background' },
  surface: { hex: '#FFFFFF', use: 'Cards · panels' },
  surface2: { hex: '#F7F9FC', use: 'Input fields' },
  border: { hex: '#E3E7EF', use: 'Card borders' },
} as const;

export const darkSurfaces = {
  canvas: { hex: '#0E1117', use: 'Page background' },
  surface: { hex: '#161B27', use: 'Cards · panels' },
  surface2: { hex: '#1C2333', use: 'Input fields' },
  border: { hex: 'rgba(255,255,255,0.07)', use: 'Card borders' },
} as const;

export const textColors = {
  light: { text1: '#0D1526', text2: '#4A5270', text3: '#96A0BB' },
  dark: { text1: '#F0F2F8', text2: '#8B92AD', text3: '#4E5470' },
} as const;

/** Accent shifts navy → bright blue in dark mode for legibility. */
export const accent = {
  light: { accent: '#142259', accentTint: '#EEF2FF' },
  dark: { accent: '#4B7BF5', accentTint: 'rgba(75,123,245,0.14)' },
} as const;

/**
 * Classification status colors — semantic & fixed across themes (per spec).
 * Tint backgrounds shift from an opaque light tint to a translucent overlay
 * in dark mode; alpha values are transcribed from the built component.
 */
export const classificationTones = {
  action: { color: '#DC2626', lightBg: '#FEF2F2', darkBg: 'rgba(220,38,38,0.16)' },
  blocker: { color: '#EA580C', lightBg: '#FFF7ED', darkBg: 'rgba(234,88,12,0.16)' },
  decision: { color: '#1D4ED8', lightBg: '#EFF6FF', darkBg: 'rgba(29,78,216,0.18)' },
  risk: { color: '#D97706', lightBg: '#FFFBEB', darkBg: 'rgba(217,119,6,0.16)' },
  fyi: { color: '#9CA3AF', lightBg: '#F3F4F6', darkBg: 'rgba(156,163,175,0.16)' },
  approved: { color: '#059669', lightBg: '#ECFDF5', darkBg: 'rgba(5,150,105,0.18)' },
  pending: {
    lightColor: '#2563EB',
    darkColor: '#7AA2FF',
    lightBg: '#EFF4FF',
    darkBg: 'rgba(37,99,235,0.16)',
  },
  neutral: { color: '#D1D5DB', lightBg: '#F9FAFB', darkBg: 'rgba(255,255,255,0.06)' },
} as const;

export type ClassificationTone = keyof typeof classificationTones;

/**
 * Status pill tones used on the email-card status badge (separate from
 * classification): "Draft ready" reuses the theme accent, "Pending" reuses
 * the classification pending tone, "Sent" is muted text-3 on a neutral tint.
 */
export const statusPillTones = {
  draftReady: { use: 'Accent-tinted · sparkle icon · draft awaiting review' },
  pending: { use: 'Blue · awaiting grounding or verification' },
  sent: { use: 'Muted text-3 · already sent, no action needed' },
} as const;

export const typography = {
  uiFontStack: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  monoFontStack: "'SF Mono', 'Fira Code', Consolas, monospace",
  scale: {
    display: { fontSize: '22px', fontWeight: 700, letterSpacing: '-0.01em', use: 'Page titles · section headers' },
    heading1: { fontSize: '18px', fontWeight: 700, use: 'Card group labels · modal titles' },
    heading2: { fontSize: '16px', fontWeight: 600, use: 'Email subject lines · card titles' },
    body: { fontSize: '14px', fontWeight: 400, lineHeight: 1.7, use: 'Draft text · summaries · descriptions' },
    meta: { fontSize: '12px', fontWeight: 400, use: 'Sender name · from address · timestamps' },
    label: { fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', use: 'Section labels · badge text · field labels' },
    caption: { fontSize: '11px', fontWeight: 400, use: 'Provenance tags · footnotes · helper text' },
  },
  weights: {
    bold700: { use: 'Brand name · page titles · approve button label only' },
    semibold600: { use: 'Email subject lines · card titles · section headings · sender name' },
    medium500: { use: 'Nav items · secondary labels · filter chips · badge text' },
    regular400: { use: 'Body copy · metadata · draft text · all descriptions' },
  },
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '28px',
  '3xl': '48px',
} as const;

export const radius = {
  xs: '4px',
  sm: '6px',
  md: '8px',
  lg: '10px',
  xl: '13px',
  pill: '100px',
} as const;

export const motion = {
  micro: { value: '80ms', easing: 'ease-out', use: 'Badge appear · connection dot state change' },
  quick: { value: '150ms', easing: 'ease-out', use: 'Button hover · hover bg transitions' },
  standard: { value: '200ms', easing: 'ease-in-out', use: 'Card expand · filter chip toggle' },
  deliberate: { value: '300ms', easing: 'ease-in-out', use: 'Modal open · page transition · approval pulse' },
  slow: { value: '500ms', easing: 'ease-out', use: 'Draft stream-in — the signature motion' },
} as const;
