# Maximalist Motion Pass

Add rich, "wow"-tier animation and visual detailing across the whole app — not just the HR Training Center.

## 1. Global motion primitives (new)

Build a small set of reusable atoms in `src/components/magic/`:

- `PageTransition.tsx` — wraps `<Outlet />` content with a framer-motion fade + slide on route change.
- `MagneticButton.tsx` — pointer-following micro-tilt for primary CTAs.
- `AnimatedCounter.tsx` — already exists as `NumberTicker`, reuse.
- Reuse existing `AuroraBackground`, `Meteors`, `BorderBeam`, `CursorSpotlight`, `AnimatedGridPattern`, `SpotlightCard`, `LiveDot`.

Add 3 new keyframes to `src/styles.css`: `shimmer-x`, `float-y`, `gradient-pan` (some may exist — reuse).

## 2. App shell (`AppShell`, `AppHeader`, `AppSidebar`)

- Header: animated gradient underline, live `LiveDot` next to the brand, subtle shimmer sweep on hover of nav items.
- Sidebar: active item gets a `BorderBeam` ring + soft glow; nav items animate in on mount with staggered fade.
- Global: cursor spotlight overlay on desktop (already built — wire it in).
- Wrap main content area in `PageTransition` for route-change motion.

## 3. Dashboard (`/_app.dashboard`)

- Hero header card with `AuroraBackground` + floating orbs + animated gradient title.
- StatCards: animated counters (`NumberTicker`), per-card hover lift, mini sparkline pulse, staggered entry.
- Add a `Meteors` accent in one feature card.
- Charts: add a soft `BorderBeam` + gradient fill animation.

## 4. HR page (`/_app.departments.hr`) — all tabs

- Tabs trigger: animated underline indicator that slides between tabs.
- Overview StatCards: same animated counters + staggered entry as dashboard.
- Records / Employees tables: row hover slide-in highlight, animated row entry.
- Attendance: status badges get pulsing `LiveDot` for "Present".
- Overtime: animated status pill transitions.
- Hiring: kanban columns fade in stagger; cards lift on hover with shadow grow.
- Training: existing Training Center already maxed; add aurora header to the simpler "Training sessions" card.

## 5. Polish details everywhere

- All `Card`s: hover lift + subtle gradient border on hover via a shared utility class.
- All primary buttons: shimmer sweep on hover.
- Toasts: existing sonner — bump to richer variant with icons.
- Loading skeletons: replace with shimmer gradient.

## Technical notes

- Framer Motion (`motion/react`) is already installed via `NumberTicker`.
- All animations respect `prefers-reduced-motion` via a small CSS guard.
- No backend changes. No new packages required (everything in place).
- Files touched (approx): `styles.css`, `AppShell.tsx`, `AppHeader.tsx`, `AppSidebar.tsx`, `_app.dashboard.tsx`, `_app.departments.hr.tsx`, `common/StatCard.tsx`, `common/PageHeader.tsx`, plus 2 new `magic/` files.

## Out of scope

- New features / data / routes
- Backend, auth, DB changes
- Restyling color palette or typography (motion + detail only)
