# Cinematic Hero Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current abstract-gradient hero on project detail pages with a full-bleed cinematic layout that uses the brand's inherited palette, surfaces all DB fields, and runs a polished entrance + scroll-parallax animation.

**Architecture:** A new `ProjectCinematicHero` sub-component is added at the top of `ProjectDetailView.tsx` and replaces the existing hero JSX (lines 792–899). Hero-specific scroll motion values move into the sub-component so the parent is lighter. A `heroImage` field is added to `ProjectDetail` and wired through `dbFullToLegacy()` so the background image comes from the DB.

**Tech Stack:** React (hooks), Framer Motion (`useScroll`, `useTransform`, `motion`), Next.js `Image`, Tailwind CSS, existing CSS variable theming via `buildProjectThemeTokens()`.

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `src/lib/project-catalog.ts` | Modify | Add `heroImage?: string` to `ProjectDetail` |
| `src/lib/project-data.ts` | Modify | Map `hero_image_url` → `heroImage` in `dbFullToLegacy()` |
| `src/components/projects/ProjectDetailView.tsx` | Modify | Add `ProjectCinematicHero`, remove old hero JSX + stale scroll vars |

---

## Task 1: Add `heroImage` field to the `ProjectDetail` type

**Files:**
- Modify: `src/lib/project-catalog.ts` — line 80, inside `ProjectDetail`
- Modify: `src/lib/project-data.ts` — inside `dbFullToLegacy()`, after the `heroSummary` mapping (line ~344)

### Context

`ProjectDetail` (in `project-catalog.ts`) is the legacy view-model used throughout `ProjectDetailView.tsx`. It currently has `heroLabel`, `heroTitle`, `heroSubtitle`, `heroSummary` — but no `heroImage`. The raw DB row (`ProjectFullDb`) has `hero_image_url: string`. The `dbFullToLegacy()` function in `project-data.ts` maps DB fields to `ProjectDetail`.

### Steps

- [ ] **Step 1: Add `heroImage` to the type**

Open `src/lib/project-catalog.ts`. Find this block (around line 63):

```ts
export type ProjectDetail = ProjectSummary & {
  heroLabel: string;
  heroTitle: string;
  heroSubtitle: string;
  heroSummary: string;
  inheritThemeFromPalette: boolean;
```

Add `heroImage?: string;` after `heroSummary`:

```ts
export type ProjectDetail = ProjectSummary & {
  heroLabel: string;
  heroTitle: string;
  heroSubtitle: string;
  heroSummary: string;
  heroImage?: string;
  inheritThemeFromPalette: boolean;
```

- [ ] **Step 2: Map `hero_image_url` in the DB-to-legacy mapper**

Open `src/lib/project-data.ts`. Inside `dbFullToLegacy()`, find the `heroSummary` mapping (line ~344):

```ts
    heroSummary: ar.hero_summary || db.hero_summary,
```

Add `heroImage` directly after it:

```ts
    heroSummary: ar.hero_summary || db.hero_summary,
    heroImage: db.hero_image_url || db.cover_image_url || undefined,
```

The fallback to `cover_image_url` ensures projects without a dedicated hero image still get a background.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd "/Users/metwally/Desktop/Kimi_Agent_Clone Hello Monday Site 2/nextjs-app"
npm run lint 2>&1 | grep -E "error|heroImage"
```

Expected: no errors mentioning `heroImage`. (Lint warnings about other pre-existing issues are fine.)

- [ ] **Step 4: Commit**

```bash
cd "/Users/metwally/Desktop/Kimi_Agent_Clone Hello Monday Site 2/nextjs-app"
git add src/lib/project-catalog.ts src/lib/project-data.ts
git commit -m "feat(project-data): expose hero_image_url as heroImage on ProjectDetail"
```

---

## Task 2: Replace the hero section with `ProjectCinematicHero`

**Files:**
- Modify: `src/components/projects/ProjectDetailView.tsx`
  - Add `ProjectCinematicHero` function (~line 693, before `export default function ProjectDetailView`)
  - Remove stale hero scroll values from `ProjectDetailView` body (~lines 742–748)
  - Replace hero JSX (~lines 792–899) with `<ProjectCinematicHero />`

### Context

The current hero (lines 792–899) uses an abstract gradient background + a small portrait card. The scroll parallax values driving it (`heroRef`, `heroTextY`, `heroArtworkY`, `heroLayer1Y`, `heroLayer2Y`, `heroOpacity`) are defined in the parent at lines 742–748. All of these are unused after the replacement, so they get deleted from the parent.

The new component:
- Takes a full-viewport `<section>` (`height: 90svh`)
- Fills it with the hero image + brand-colored gradient overlay (via CSS `--accent` variable, set by `buildProjectThemeTokens()`)
- Anchors text content at the bottom in a two-column grid
- Runs staggered entrance animations via Framer Motion
- Applies scroll parallax to the image and text on desktop

All imports the new component needs (`useRef`, `motion`, `useScroll`, `useTransform`, `Image`, `Link`, `ArrowUpRight`, `transitionEase`) are already present in `ProjectDetailView.tsx`. No new imports required.

### Steps

- [ ] **Step 1: Add `ProjectCinematicHero` sub-component**

Open `src/components/projects/ProjectDetailView.tsx`. Find the comment at line ~694:

```tsx
// -------------------------------------------------------------
// Main Component
// -------------------------------------------------------------
```

Insert the following complete function **immediately before** that comment block:

```tsx
// -------------------------------------------------------------
// Cinematic Full-Bleed Hero
// -------------------------------------------------------------

function ProjectCinematicHero({
  project,
  isMobile,
  isRtl,
}: {
  project: ProjectDetail;
  isMobile: boolean;
  isRtl: boolean;
}) {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(heroScroll, [0, 1], ["0%", "15%"]);
  const textY = useTransform(heroScroll, [0, 1], ["0%", "20%"]);

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden"
      style={{ height: "90svh", minHeight: "560px" }}
    >
      {/* Background image — Ken Burns on mount, scroll parallax on desktop */}
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={isMobile ? undefined : { y: imageY }}
        initial={{ scale: 1.06 }}
        animate={{ scale: 1.0 }}
        transition={{ duration: 8, ease: "linear" }}
      >
        {project.heroImage ? (
          <Image
            src={project.heroImage}
            alt={project.heroTitle}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-[hsl(var(--accent))]" />
        )}
      </motion.div>

      {/* Brand-colored gradient overlay — color from inherited CSS var */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, hsl(var(--accent) / 0.88) 0%, hsl(var(--accent) / 0.55) 35%, hsl(var(--accent) / 0.18) 60%, transparent 80%)",
        }}
      />

      {/* Top bar — back link + scroll hint */}
      <motion.div
        className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 pt-8 lg:px-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: isMobile ? 0.1 : 2.3, ease: transitionEase }}
      >
        <Link
          href="/projects"
          className="flex items-center gap-2 text-white/70 transition-colors hover:text-white"
        >
          <ArrowUpRight
            className={`size-4 ${isRtl ? "-rotate-[315deg]" : "rotate-[225deg]"}`}
          />
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.32em]">
            {isRtl ? "العودة" : "Back"}
          </span>
        </Link>
        {!isMobile && (
          <div className="flex items-center gap-2 text-white/35">
            <span className="font-mono text-[0.58rem] uppercase tracking-[0.38em]">
              {isRtl ? "مرّر" : "Scroll"}
            </span>
            <div className="h-7 w-px bg-white/20" />
          </div>
        )}
      </motion.div>

      {/* Bottom content panel — parallax on desktop */}
      <motion.div
        className="absolute inset-x-0 bottom-0 z-20 px-5 pb-10 lg:px-20 lg:pb-14"
        style={isMobile ? undefined : { y: textY }}
      >
        <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[1fr_auto] lg:items-end lg:gap-20">

          {/* ── Left column: eyebrow → title → subtitle → summary → tags ── */}
          <div className="space-y-4">

            {/* Eyebrow label */}
            {project.heroLabel && (
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: isMobile ? 0.2 : 2.45, ease: transitionEase }}
              >
                <div className="h-px w-6 bg-white/40" />
                <span className="font-mono text-[0.68rem] uppercase tracking-[0.38em] text-white/60">
                  {project.heroLabel}
                </span>
              </motion.div>
            )}

            {/* Title — clipped reveal */}
            <div className="overflow-hidden">
              <motion.h1
                className="font-serif leading-[0.92] tracking-[-0.04em] text-white"
                style={{ fontSize: "clamp(2.8rem, 7.5vw, 5.75rem)" }}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: isMobile ? 0.25 : 2.6, ease: transitionEase }}
              >
                {project.heroTitle}
              </motion.h1>
            </div>

            {/* Subtitle */}
            {project.heroSubtitle && (
              <motion.p
                className="max-w-xl text-[1rem] font-light leading-relaxed text-white/70 md:text-[1.15rem]"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: isMobile ? 0.35 : 2.9, ease: transitionEase }}
              >
                {project.heroSubtitle}
              </motion.p>
            )}

            {/* Summary — desktop only */}
            {project.heroSummary && (
              <motion.p
                className="hidden max-w-xl text-[0.88rem] leading-relaxed text-white/45 md:block md:text-[0.95rem]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: isMobile ? 0.4 : 3.05, ease: transitionEase }}
              >
                {project.heroSummary}
              </motion.p>
            )}

            {/* Tags */}
            {project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, i) => (
                  <motion.span
                    key={tag}
                    className="rounded-full border border-white/20 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-white/60"
                    initial={{ opacity: 0, x: isRtl ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: (isMobile ? 0.45 : 3.15) + i * 0.08,
                      ease: transitionEase,
                    }}
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            )}
          </div>

          {/* ── Right column: meta (client + category) ── */}
          {(project.introMeta.client || project.introMeta.type) && (
            <motion.div
              className="flex flex-row gap-6 lg:flex-col lg:items-end lg:text-end"
              initial={{ opacity: 0, x: isRtl ? -24 : 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: isMobile ? 0.3 : 2.7, ease: transitionEase }}
            >
              {project.introMeta.client && (
                <div className="space-y-1">
                  <p className="font-mono text-[0.58rem] uppercase tracking-[0.35em] text-white/35">
                    {isRtl ? "العميل" : "Client"}
                  </p>
                  <p className="text-sm font-medium text-white/80">{project.introMeta.client}</p>
                </div>
              )}
              {project.introMeta.type && (
                <div className="space-y-1">
                  <p className="font-mono text-[0.58rem] uppercase tracking-[0.35em] text-white/35">
                    {isRtl ? "التصنيف" : "Category"}
                  </p>
                  <p className="text-sm font-medium text-white/80">{project.introMeta.type}</p>
                </div>
              )}
            </motion.div>
          )}

        </div>

        {/* Bottom rule — scaleX reveal, respects RTL origin */}
        <motion.div
          className="mt-6 h-px bg-white/15"
          style={{ transformOrigin: isRtl ? "right" : "left" }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: isMobile ? 0.5 : 3.0, ease: transitionEase }}
        />
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 2: Remove the stale hero scroll values from the parent**

In `ProjectDetailView`, find and delete these 7 lines (~lines 742–748):

```tsx
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroTextY = useTransform(heroScroll, [0, 1], ["0%", "45%"]);
  const heroArtworkY = useTransform(heroScroll, [0, 1], ["0%", "85%"]);
  const heroLayer1Y = useTransform(heroScroll, [0, 1], ["0%", "60%"]);
  const heroLayer2Y = useTransform(heroScroll, [0, 1], ["0%", "120%"]);
  const heroOpacity = useTransform(heroScroll, [0, 0.7], [1, 0]);
```

> Note: `useTransform` and `useScroll` stay imported — they are still used for `horizontalX` (the horizontal gallery) and `scrollYProgress` (the progress bar).

- [ ] **Step 3: Replace the old hero JSX with the new component**

In `ProjectDetailView`'s return, find the hero section starting with:

```tsx
        {/* 1. Cinematic Layered Parallax Hero */}
        <section ref={heroRef} className="relative flex flex-col items-center justify-center overflow-hidden pt-32 pb-2 md:pt-48 md:pb-40 text-white min-h-[90vh]">
```

…and ending with the closing `</section>` tag before the comment `{/* 2. Overview Bar */}` (around line 899).

Replace the **entire section block** (from `{/* 1. Cinematic... */}` through the closing `</section>`) with:

```tsx
        {/* 1. Cinematic Full-Bleed Hero */}
        <ProjectCinematicHero
          project={project}
          isMobile={isMobile}
          isRtl={isRtl}
        />
```

- [ ] **Step 4: Check for TypeScript errors**

```bash
cd "/Users/metwally/Desktop/Kimi_Agent_Clone Hello Monday Site 2/nextjs-app"
npm run lint 2>&1 | grep -E "error TS|heroRef|heroTextY|heroArtworkY|heroLayer|heroOpacity"
```

Expected: no results (the removed variables should produce no lingering references).

- [ ] **Step 5: Verify in the browser**

The dev server should already be running. Open **http://localhost:3000/ar/projects/burgito** and check:

1. The hero fills ~90 % of the viewport — the project photo covers the full width
2. The gradient overlay is Burgito Red (not navy) — a deep crimson fading up from the bottom
3. Text enters with stagger: label → title rises from clip → subtitle fades in → summary → tags → meta
4. Scrolling into the page causes the background image to drift upward slightly (parallax)
5. The back-link reads "العودة" in Arabic, rotated correctly
6. Open **http://localhost:3000/en/projects/burgito** — overlay should still be brand red, text in English, back-link reads "Back" pointing left

- [ ] **Step 6: Check mobile at 375 px**

In browser devtools, toggle to mobile view (375 px width) and confirm:

1. Hero still fills the screen
2. Meta column sits above the title (horizontal flex row, not grid)
3. No horizontal overflow
4. Parallax and heavy effects are disabled (the `isMobile` gate ensures this)

- [ ] **Step 7: Commit**

```bash
cd "/Users/metwally/Desktop/Kimi_Agent_Clone Hello Monday Site 2/nextjs-app"
git add src/components/projects/ProjectDetailView.tsx
git commit -m "feat(hero): cinematic full-bleed hero with brand palette + scroll parallax"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task covering it |
|---|---|
| Full-viewport hero (90svh) | Task 2, Step 1 — `height: 90svh` on `<section>` |
| hero_image_url as background | Task 1 (adds heroImage field) + Task 2 Step 1 (uses it) |
| Brand overlay via `var(--accent)` | Task 2 Step 1 — gradient uses `hsl(var(--accent) / ...)` |
| heroLabel rendered | Task 2 Step 1 — eyebrow block |
| heroTitle rendered | Task 2 Step 1 — h1 with clip reveal |
| heroSubtitle rendered | Task 2 Step 1 — conditional paragraph |
| heroSummary rendered (desktop) | Task 2 Step 1 — `hidden md:block` paragraph |
| tags[] rendered | Task 2 Step 1 — staggered tag pills |
| introMeta.client + type rendered | Task 2 Step 1 — right meta column |
| Entrance animation sequence | Task 2 Step 1 — staggered Framer Motion delays |
| Scroll parallax (image + text) | Task 2 Step 1 — `imageY`, `textY` via `useTransform` |
| RTL mirroring | Task 2 Step 1 — `isRtl` gates on x direction, origin, text |
| Mobile responsive | Task 2 Step 1 — `isMobile` disables parallax; grid → flex column |
| Fallback when heroImage empty | Task 2 Step 1 — `{project.heroImage ? <Image> : <div bg-accent>}` |
| Fallback when optional fields empty | Task 2 Step 1 — every field wrapped in `{field && ...}` |

**Placeholder scan:** No TBDs, no "implement later" stubs. Every conditional and animation value is explicit. ✅

**Type consistency:** `project.heroImage` added in Task 1 and consumed in Task 2. `project.heroLabel`, `project.heroTitle`, `project.heroSubtitle`, `project.heroSummary`, `project.tags`, `project.introMeta` — all from existing `ProjectDetail` fields. ✅
