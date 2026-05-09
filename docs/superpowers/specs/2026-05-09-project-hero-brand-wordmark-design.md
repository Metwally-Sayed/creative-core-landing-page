# Project Hero — Brand-Wordmark Redesign

**Date:** 2026-05-09
**Scope:** `ProjectCinematicHero` inside `src/components/projects/ProjectDetailView.tsx`
**Routes affected:** `/[lang]/projects/[slug]` — all projects
**Status:** Approved for implementation

---

## 1. Goal

Replace the current photo-background cinematic hero with a wordmark-on-gradient hero that matches the supplied reference. The brand's white wordmark becomes the visual centerpiece, sitting as a giant ghosted shape on a vertical brand-color gradient. The editorial column (eyebrow, project name, summary, tags, meta) reads on top of the lower, darker portion of the gradient.

Two outcomes:
1. Hero renders the white wordmark + brand-color gradient instead of a photo background.
2. Project name on `/ar/projects/lima` reads **ليما** (Arabic translation seeded in DB).

---

## 2. Data Sources

| Visual element | Field | Notes |
|---|---|---|
| Giant white wordmark (centerpiece) | `project.heroImage` | Field semantically repurposed. The CMS "Hero Image" upload is now expected to be a transparent-PNG/SVG of the brand wordmark in white. |
| Eyebrow above project name | `project.heroLabel` | Already i18n via `translations.ar.hero_label`. |
| Project name (small, beside wordmark) | `project.heroTitle` | Already i18n. AR seeded as **ليما** for the lima project as part of this task. |
| Subtitle | `project.heroSubtitle` | Existing. |
| Summary | `project.heroSummary` | Existing — already mapped through `dbFullToLegacy`. |
| Tag chips | `project.tags[]` | Existing. |
| Meta (client, category) | `project.introMeta.client`, `project.introMeta.type` | Existing. |
| Background gradient — top color | `hsl(var(--background))` | Set by `buildProjectThemeTokens()` from `theme_palette.background`. |
| Background gradient — bottom color | `hsl(var(--accent))` | Set by `buildProjectThemeTokens()` from `theme_palette.accent`. |

**No DB schema change. No new fields.**

---

## 3. Layout

```
┌────────────────────────────────────────────────────────────────────────┐
│ ← back                                                       scroll → │
│                                                                        │
│                                                                        │
│                       ░░░░░░░░░░░░░░░░░░░░                           │
│                       ░  W O R D M A R K  ░░                           │
│                       ░░░░░░░░░░░░░░░░░░░░░░                           │
│                       (huge, white, ~25% alpha, centered, behind text) │
│                                                                        │
│                                                ─── eyebrow            │
│                                                project name            │
│                                                subtitle line           │
│                                                summary paragraph       │
│                                                                        │
│  meta col            ──────────────────       [tag] [tag] [tag]        │
│  (client/category)                                                     │
│────────────────────────────────────────────────────────────────────────│
```

**Section box:** `position: relative; height: 100svh; min-height: 640px; overflow: hidden`.

**Layer 1 — gradient background (single div, absolute inset 0):**

```css
background: linear-gradient(
  to bottom,
  hsl(var(--background)) 0%,
  hsl(var(--background)) 18%,
  hsl(var(--accent))     100%
);
```

**Layer 2 — wordmark (absolute, centered):**
- `top: 30%; left: 50%; transform: translate(-50%, -50%)` (centered slightly above optical center)
- `width: min(78vw, 1100px); height: auto`
- `<Image>` with `object-contain`, `priority`
- Wrapping div: `mix-blend-mode: overlay; opacity: 0.28`. The `mix-blend-overlay` causes the white logo to read as a soft watermark that picks up gradient color, matching the reference.
- If `heroImage` is empty: render nothing in this layer.

**Layer 3 — top bar (absolute, top, full width):**
- Back link (logical-end-of-start: `start-0` in LTR, mirrored in RTL via `dir`)
- "Scroll" hint on the opposite side, hidden < 768
- All text `text-white/70`

**Layer 4 — editorial content (absolute, bottom):**
- Two-column grid on `lg+`: `grid-cols-[auto_1fr]` so meta sits start-edge, editorial sits end-edge
- Stacked on mobile
- Editorial column is **end-aligned** (`text-end`, `items-end`) — so in EN it pulls right, in AR it pulls left, matching the reference layout
- All text uses `text-white` and `text-white/70` against the dark bottom of the gradient
- Bottom rule: 1px white/15 line, scaleX reveal, `transformOrigin` flips with `dir`

**Mobile (< 768):**
- Wordmark width `92vw`, opacity wrapper at `0.18`, scroll parallax disabled
- Editorial column: single column, end-aligned, padding `1.25rem`
- Title typography clamps smaller

---

## 4. Animation — GSAP

### 4a. Dependencies

Install:
- `gsap` (free core; covers Tween, Timeline, ScrollTrigger as of GSAP 3.13)
- `@gsap/react` (provides `useGSAP` hook with strict-mode-safe cleanup)

```bash
npm i gsap @gsap/react
```

### 4b. Mount timeline

Run via `useGSAP(() => { ... }, { scope: heroRef })` so cleanup is automatic. Element targets resolved via refs (no string selectors) to keep it strict-mode and HMR safe.

```ts
const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
tl
  .from(gradientRef.current,  { autoAlpha: 0, duration: 0.6 })
  .from(wordmarkRef.current,  { autoAlpha: 0, scale: 1.06, y: 24, duration: 1.4 }, 0.15)
  .from(eyebrowRef.current,   { autoAlpha: 0, x: dir * -20, duration: 0.5 }, 0.7)
  .from(titleCharsRef.current, { autoAlpha: 0, yPercent: 100, stagger: 0.04, duration: 0.7, ease: "power4.out" }, 0.8)
  .from(subtitleRef.current,  { autoAlpha: 0, y: 14, duration: 0.55 }, 1.05)
  .from(summaryRef.current,   { autoAlpha: 0, y: 10, duration: 0.5 }, 1.2)
  .from(tagsRef.current.children, { autoAlpha: 0, x: dir * -10, stagger: 0.07, duration: 0.4 }, 1.3)
  .from(metaRef.current,      { autoAlpha: 0, x: dir * 24, duration: 0.55 }, 0.95)
  .from(ruleRef.current,      { scaleX: 0, transformOrigin: dir > 0 ? "left" : "right", duration: 1.0 }, 1.1);
```

`dir` is `1` for LTR, `-1` for RTL. Title characters are produced by splitting the project name into per-char `<span>` elements (Latin titles) or treated as a single block (Arabic — same per-char split would break ligatures).

### 4c. Scroll parallax (ScrollTrigger)

Skipped on mobile (`window.matchMedia("(max-width: 767px)").matches`).

```ts
gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.create({
  trigger: heroRef.current,
  start: "top top",
  end: "bottom top",
  scrub: 0.6,
  animation: gsap.timeline()
    .to(wordmarkRef.current, { y: -80, scale: 1.04, ease: "none" }, 0)
    .to(editorialRef.current, { y: -32, ease: "none" }, 0)
    .to(gradientRef.current, { filter: "brightness(0.92)", ease: "none" }, 0),
});
```

### 4d. `prefers-reduced-motion`

Wrap timeline construction in:
```ts
gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => { /* timeline + ScrollTrigger here */ });
```
With reduced motion the elements render in their final visible state with no animation.

---

## 5. Component Structure

Existing function `ProjectCinematicHero` in `ProjectDetailView.tsx` is rewritten in place. Same call site, same name, same props (`{ project, isMobile, isRtl }`). The internals shift from:
- Framer-Motion-driven photo background → GSAP-driven gradient + wordmark.

New refs: `heroRef`, `gradientRef`, `wordmarkRef`, `editorialRef`, `eyebrowRef`, `titleCharsRef` (array), `subtitleRef`, `summaryRef`, `tagsRef`, `metaRef`, `ruleRef`.

**Imports added:**
```ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(useGSAP, ScrollTrigger);
```

**Imports removed from this component only** (Framer Motion stays for the rest of the file): the `useScroll`/`useTransform` imports that were used only by `ProjectCinematicHero` and the `motion` wrappers around hero internals. The `motion`/`useScroll` imports remain at the top of the file — they're still used by other components below the hero (`Preloader`, `MarqueeTicker`, `StoryChapter`, etc.).

---

## 6. RTL / i18n

- All directional spacing uses logical properties (`ps-`, `pe-`, `ms-`, `me-`, `start-`, `end-`)
- `dir = isRtl ? -1 : 1` controls GSAP X-direction motion
- Back-arrow flip: `${isRtl ? "rotate-[315deg]" : "rotate-[225deg]"}` (already in current code, preserved)
- Bottom rule `transformOrigin` flips per `dir` so the line draws from the start edge in either direction
- The wordmark itself is locale-agnostic — it's an image asset

---

## 7. Lima AR Data Fix

One-off DB write:

```sql
UPDATE projects
SET translations = jsonb_set(
  jsonb_set(
    COALESCE(translations, '{}'::jsonb),
    '{ar,title}', '"ليما"'::jsonb, true),
  '{ar,hero_title}', '"ليما"'::jsonb, true)
WHERE slug = 'lima';
```

Performed via Supabase MCP. No code change beyond the spec — `dbFullToLegacy` already prefers `translations.ar.hero_title` when locale is `ar`.

---

## 8. Fallbacks

| Condition | Behavior |
|---|---|
| `heroImage` empty | Wordmark layer not rendered. Gradient + editorial column still ship. |
| `theme_palette` missing accent/background | `--accent`/`--background` keep their site-wide defaults; gradient still works. |
| `prefers-reduced-motion: reduce` | All elements render in final state, no GSAP animation runs. |
| Mobile (< 768) | No ScrollTrigger; mount timeline still runs; smaller wordmark and lower opacity. |

---

## 9. Success Criteria

- [ ] `/ar/projects/lima` shows white "LIMA" wordmark large/centered, gradient cream-pink → burgundy, project name reads **ليما**
- [ ] `/en/projects/lima` shows the same shape with project name "lima"
- [ ] No photo background remains on the project hero
- [ ] Mount timeline plays once on load; subsequent navigation re-triggers it
- [ ] Scroll parallax is smooth on desktop, absent on mobile
- [ ] RTL layout mirrors correctly
- [ ] No console errors; no layout shift
- [ ] Lighthouse performance does not regress vs. current hero

---

## 10. What is NOT changing

- DB schema, CMS forms, types, Supabase queries
- Anything below the hero (overview bar, showcase, marquee, color palette, story chapters, related projects)
- Other locales beyond English/Arabic
- Other pages or layouts
- Theme inheritance plumbing (`buildProjectThemeTokens`, `COLOR_TOKENS`)
