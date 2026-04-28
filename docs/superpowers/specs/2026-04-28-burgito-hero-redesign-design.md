# Project Hero Redesign — Full-Bleed Cinematic (Approach B)

**Date:** 2026-04-28  
**Scope:** `ProjectDetailView.tsx` hero section (currently lines ~792–920)  
**Routes affected:** `/[lang]/projects/[slug]` — all projects, not burgito-only  
**Status:** Approved for implementation

---

## 1. Goal

Replace the current cramped, navy-boxed hero with a full-viewport cinematic layout that:

- Uses the **brand-inherited theme palette** via CSS variables (no hardcoded colors)
- Surfaces all available DB hero fields, including `heroSummary` (currently unused)
- Runs a polished entrance animation sequence on mount
- Responds correctly to both LTR (English) and RTL (Arabic) layouts
- Is fully responsive from 375 px mobile to 1920 px desktop

---

## 2. Data Sources (all from DB — nothing hardcoded)

| Visual element | DB field | Where resolved |
|---|---|---|
| Eyebrow / label above title | `project.heroLabel` | `dbFullToLegacy()` |
| Main headline | `project.heroTitle` | `dbFullToLegacy()` |
| Subtitle / tagline | `project.heroSubtitle` | `dbFullToLegacy()` |
| Body paragraph | `project.heroSummary` | `dbFullToLegacy()` (currently unused — add to legacy mapper) |
| Tags row | `project.tags[]` | direct |
| Background image | `project.hero_image_url` | direct |
| Overlay gradient color | `var(--accent)` CSS variable | Set by `buildProjectThemeTokens()` from `theme_palette.accent` |
| Right-panel meta — launch date | `project.introMeta.launchLabel` | `dbFullToLegacy()` |
| Right-panel meta — category | `project.tags[0]` | direct |
| Right-panel meta — client | `project.introMeta.clientLabel` (if present) | `dbFullToLegacy()` |

### 2a. Fix: Expose `heroSummary` in `dbFullToLegacy()`

`src/lib/project-data.ts` → `dbFullToLegacy()` currently does not map `heroSummary`. Add:

```ts
heroSummary: ar?.hero_summary ?? row.hero_summary ?? undefined,
```

Also add `heroSummary?: string` to the `ProjectDetail` interface.

---

## 3. Layout — Full-Bleed Cinematic

```
┌─────────────────────────────────────────────────────────────────┐
│  ← back link (top-left, absolute)          scroll hint (top-right) │
│                                                                   │
│  [full-viewport hero image — covers 100% width, ~90vh height]   │
│                                                                   │
│  ████████████████████████████ gradient from brand accent ██████  │
│                                                                   │
│  [EYEBROW TAG]                                [meta column]       │
│  ╔═══════════════════════════════════╗        Year / 2024        │
│  ║  HERO TITLE — large serif         ║        Category           │
│  ║  spanning 2–3 lines               ║        Client             │
│  ╚═══════════════════════════════════╝                           │
│                                                                   │
│  Subtitle line                         ─────────────────          │
│  Hero summary paragraph (2–3 lines)                              │
│                                                                   │
│  [tag pill] [tag pill] [tag pill]                                │
│─────────────────────────────────────────────────────────────────│
└─────────────────────────────────────────────────────────────────┘
```

**Key layout rules:**
- Section: `position: relative; height: 90svh; min-height: 560px`
- Image: `position: absolute; inset: 0; object-fit: cover; width: 100%; height: 100%`
- Overlay: `position: absolute; inset: 0; background: linear-gradient(to top, var(--accent)/82%, var(--accent)/45%, transparent 65%)`
- Content: `position: absolute; bottom: 0; left: 0; right: 0; padding: 2.5rem 5rem`
- Two-column bottom area on `lg+`: `grid-cols-[1fr_auto]`; stacked on mobile
- All text on the overlay uses `text-white` (always readable regardless of brand)

### Mobile (< 768 px)

- Meta column moves above the title
- Title font: `clamp(2.4rem, 10vw, 5.5rem)`
- Padding: `1.25rem`
- Scroll hint hidden

---

## 4. Animation Sequence (Framer Motion — no new dependencies)

> GSAP `mapRange` / `clamp` utilities are used for scroll math only (pure JS, no DOM import needed).

### 4a. Entrance (mount, staggered)

| Element | Animation | Delay |
|---|---|---|
| Hero image | Ken Burns scale `1.0 → 1.06`, duration 8s | 0s |
| Overlay gradient | opacity `0 → 1`, duration 1s | 0.1s |
| Top bar (back link + scroll hint) | `y: -20 → 0`, opacity `0 → 1`, duration 0.6s | 0.2s |
| Eyebrow tag | `x: -16 → 0`, opacity `0 → 1`, duration 0.5s | 0.45s |
| Title words | clip-path `inset(0 0 100% 0) → inset(0 0 0% 0)`, stagger 0.06s per word | 0.6s |
| Subtitle | `y: 14 → 0`, opacity `0 → 1`, duration 0.55s | 0.9s |
| Hero summary | `y: 10 → 0`, opacity `0 → 1`, duration 0.5s | 1.05s |
| Tags | stagger `x: 10 → 0`, opacity `0 → 1`, 0.08s each | 1.15s |
| Right meta column | `x: 24 → 0`, opacity `0 → 1`, duration 0.6s | 0.7s |
| Bottom rule | scaleX `0 → 1`, duration 1.2s | 1.0s |

### 4b. Scroll Parallax (Framer Motion `useScroll` + `useTransform`)

Attach `useScroll` to the hero section element. Map `scrollYProgress [0, 1]` to:

- **Image Y translate:** `mapRange(0, 1, 0, -80)` px — subtle upward drift
- **Image brightness:** `mapRange(0, 0.5, 1, 0.75)` — dims as you scroll away
- **Title Y translate:** `mapRange(0, 1, 0, -40)` px — slower than image (parallax depth)
- **Overlay opacity multiplier:** `mapRange(0, 0.3, 1, 1.3)` — strengthens slightly

`mapRange` is from `gsap/utils` (already installed via the gsap-utils skill). Import from `@/lib/gsap-utils` or equivalent re-export path.

---

## 5. Component Architecture

### Existing file to modify

**`src/components/projects/ProjectDetailView.tsx`**

The hero block (currently ~lines 792–920) is extracted into a named local component `ProjectCinematicHero` at the top of the same file. This keeps the change self-contained and avoids creating a new shared component that has no other consumer yet.

```tsx
function ProjectCinematicHero({ project, dir }: { project: ProjectDetail; dir: 1 | -1 }) {
  // useScroll, useTransform, motion values
  // Returns the <section> with all the layers
}
```

### Imports needed

```ts
import { motion, useScroll, useTransform, useSpring, useMotionTemplate } from 'framer-motion';
// mapRange/clamp are pure math — inline them directly in the component file:
// const mapRange = (in_min, in_max, out_min, out_max) => (value) =>
//   ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
// const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
// NOTE: GSAP is NOT installed and not needed — we only use the math concepts,
// not the GSAP DOM animation engine.
```

---

## 6. RTL / i18n

- All directional spacing uses logical properties: `ps-`, `pe-`, `ms-`, `me-` (already used site-wide)
- Back-link arrow flips via `dir === -1 ? 'rotate-180' : ''`
- `dir` prop passed down from the existing `useDirection()` call in `ProjectDetailView`
- Tags and meta always LTR (numbers, brand names) — wrap in `dir="ltr"` spans where needed

---

## 7. Fallbacks

| Condition | Behavior |
|---|---|
| `hero_image_url` empty | Show solid `bg-accent` background, no `<img>` |
| `heroLabel` empty | Hide eyebrow row |
| `heroSubtitle` empty | Hide subtitle line |
| `heroSummary` empty | Hide summary paragraph |
| `introMeta` empty | Hide right meta column entirely |
| `tags[]` empty | Hide tags row |

---

## 8. Responsive Breakpoints

| Viewport | Changes |
|---|---|
| `< 768px` | Single column; meta above title; padding 1.25rem; title ~`clamp(2rem, 9vw, 3.5rem)`; summary hidden to save space |
| `768px – 1024px` | Two columns appear; meta right-aligned; padding 2.5rem |
| `> 1024px` | Full layout; `clamp(3.5rem, 6vw, 5.5rem)` title; padding `2.5rem 5rem` |

---

## 9. What is NOT changing

- The content below the hero (overview grid, showcase, process tabs, etc.) stays untouched
- No new npm dependencies (Framer Motion + GSAP utils already installed)
- No changes to DB schema or Supabase queries
- No changes to other project pages or layouts

---

## 10. Success Criteria

- [ ] Hero fills ~90 % of the viewport on desktop
- [ ] Overlay gradient color matches the project's `theme_palette.accent` (not navy)
- [ ] All 8 DB fields are rendered (no hardcoded strings in the component)
- [ ] Entrance animations run once on page load in the correct stagger order
- [ ] Scroll parallax is smooth (no jank, `will-change: transform` applied to moving layers)
- [ ] Passes responsive visual check at 375, 768, 1280, 1920 px
- [ ] RTL layout mirrors correctly for `/ar/...` routes
- [ ] Graceful fallback when any optional field is empty
