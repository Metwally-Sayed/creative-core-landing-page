# Hero Sphere Media — CRM Control

**Date:** 2026-04-22  
**Status:** Approved  

## Problem

The `CreativeHero` component renders a 3D floating-image sphere via `ImageSphere`. The sphere items are hardcoded in `DEFAULT_SPHERE_MEDIA` inside `CreativeHero.tsx`. Admins cannot add, remove, or update these images/videos from the CRM.

## Goal

Let admins control the sphere media (images and videos) from the page editor in the admin CRM, with EN/AR alt-text per item, using the existing Media Library picker.

---

## Data Model

### Section content (EN)

`section.content.media_items` — stored as a JSON array on the `hero` page section:

```ts
type SphereMediaItemInput = {
  type: "image" | "video";
  url: string;
  posterUrl?: string; // video only — thumbnail shown in sphere bubble
  alt: string;        // EN alt text
};
```

### Section translations (AR)

`section.translations.ar.media_items_alts` — a string array, ordered to match `media_items` by index:

```ts
string[] // e.g. ["Arabic alt for item 0", "Arabic alt for item 1", ...]
```

If an AR alt is missing for an index, falls back to the EN alt.

---

## Admin UI (SectionEditor — `"hero"` case)

Added below the existing headline/body/CTA fields.

### EN tab — "Sphere Media" editor

- Section heading: **"Sphere Media"** with a helper note: *"Max 8 shown (padded with defaults if fewer than 8)."*
- Repeatable item rows. Each row:
  - **Thumbnail preview** — 48×48px, rounded, shows the image or a video-icon placeholder.
  - **Type toggle** — "Image" / "Video" (segmented control or select).
  - **"Pick from library" button** — opens the existing `MediaPicker` modal, sets `url` (and clears `posterUrl` if type changed).
  - **Poster picker** (video only) — same MediaPicker, optional. Label: *"Poster (thumbnail)"*.
  - **Alt text** — text input, EN.
  - **Delete** — removes the row.
- **"+ Add media"** button below the list — appends an empty row.
- **Empty state** — *"No media added — defaults will show in the sphere."*
- No drag reorder in v1; use add/delete to manage order.

### AR tab — "Sphere Media" section

- Same rows (read-only thumbnail + type), same order as EN.
- Only **Alt text (AR)** is editable per row (`dir="rtl"`).
- Writes to `translations.ar.media_items_alts[i]`.

---

## Rendering / Wiring

In the page server component (home `page.tsx`), where the `hero` section config is built for `CreativeHero`:

```ts
const mediaItems = (section.content.media_items ?? []) as SphereMediaItemInput[];
const arAlts = (section.translations?.ar?.media_items_alts ?? []) as string[];

const resolvedItems = mediaItems.map((item, i) => ({
  type: item.type,
  url: item.url,
  posterUrl: item.posterUrl,
  alt: lang === "ar" ? (arAlts[i] || item.alt) : item.alt,
}));

// passes into CreativeHeroConfig.media.items
```

### CreativeHero — no logic change

`CreativeHero` already does:
```ts
const cmsMedia = (config.media?.items ?? []).filter(item => item.url && item.alt);
const combinedMedia = [...cmsMedia, ...DEFAULT_SPHERE_MEDIA].slice(0, 8);
```

This stays unchanged. CMS items populate the front of the array; defaults pad to 8.

### ImageSphere — no change

Already handles `type: "image" | "video"` with poster + lightbox.

---

## Scope Boundaries

| In scope | Out of scope |
|---|---|
| Image and video items | Per-item `href` links |
| EN + AR alt text | Per-language image sets |
| MediaPicker for asset picking | Drag-to-reorder |
| Video poster picker | Raising the 8-item cap |

---

## Files Affected

| File | Change |
|---|---|
| `src/app/(admin)/admin/(authed)/pages/[id]/SectionEditor.tsx` | Add sphere media editor to `"hero"` case (EN + AR) |
| `src/app/[lang]/page.tsx` | Wire `section.content.media_items` → `CreativeHeroConfig.media.items` |
| `src/components/sections/CreativeHero.tsx` | No change |
| `src/components/ui/image-sphere.tsx` | No change |
| `src/lib/hero-types.ts` | No change |
