# Seed AR `hero_title` for All Projects

**Date:** 2026-05-09
**Scope:** `projects.translations.ar.hero_title` for 7 projects (lima already seeded)
**Status:** Approved

## Goal

Every project's hero on `/ar/projects/[slug]` should render the brand name in Arabic. EN already works (base `hero_title` is Latin). The 7 projects below currently show their Latin name on AR pages because `translations.ar.hero_title` is the Latin form.

## Values

| slug | new `translations.ar.hero_title` |
|---|---|
| burgito | بورغيتو |
| mazaq | مذاق |
| emboss-burger | إمبوس برغر |
| qpasta | كيو باستا |
| wahed-makhlout | واحد مخلوط |
| neamah | نعمة |
| come-true | كوم ترو |

For 6 of these the value matches the existing `translations.ar.title`. **burgito** is the exception: its `translations.ar.title` is a long phrase with a tagline ("بورغيتو - لقيمات لذيذة، مزاج سعيد"); the hero gets just the brand portion to fit a single-word display.

## Mechanics

- One-off seed via Supabase service-role key (same pattern as `seed-lima-ar-title.ts`).
- For each row, read `translations`, deep-merge `ar.hero_title` with the new value, write back.
- Idempotent: re-running yields the same final state.
- No code change. No schema change. No CMS change.

## Success criteria

- `/ar/projects/burgito` h1 reads "بورغيتو", and the same for the other 6 slugs.
- `/en/projects/[slug]` is unchanged.
- `lima` is untouched (already correct).
