# Hero Sphere Media CRM Control — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let admins add/remove image and video items for the hero sphere from the CRM page editor, with EN + AR alt text per item.

**Architecture:** Three files change. `MediaPickerModal` gets a `fileType` prop so it can list videos. `SectionEditor` gets a new inline `SphereMediaEditor` sub-component under the hero case. `SectionRenderer` maps `section.content.media_items` to `CreativeHeroConfig.media.items` at render time. No changes to `CreativeHero` or `ImageSphere`.

**Tech Stack:** React (client components), Next.js App Router, existing `MediaPickerModal`, existing `listMediaAssets` server action.

---

## File Map

| File | Change |
|---|---|
| `src/components/admin/MediaPickerModal.tsx` | Add `fileType?: "image" \| "video"` prop; pass to `listMediaAssets` + file `accept` |
| `src/app/(admin)/admin/(authed)/pages/[id]/SectionEditor.tsx` | Add `SphereMediaEditor` inline component; wire into hero EN + AR cases |
| `src/components/builder/SectionRenderer.tsx` | Map `section.content.media_items` → `CreativeHeroConfig.media.items` in hero case |

No other files need to change. `CreativeHero`, `ImageSphere`, `hero-types.ts` are all untouched.

---

## Task 1: Extend MediaPickerModal to support video file type

**Files:**
- Modify: `src/components/admin/MediaPickerModal.tsx`

The modal currently hardcodes `fileType: "image"` in two places and `accept="image/*"` on the hidden file input. Adding a `fileType` prop (default `"image"`) makes it reusable for video picking.

- [ ] **Step 1: Update Props interface**

Open `src/components/admin/MediaPickerModal.tsx`. Find the `Props` interface (line 14):

```ts
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  fileType?: "image" | "video";
}
```

- [ ] **Step 2: Destructure the new prop with default**

Find the function signature (line 73):

```ts
export default function MediaPickerModal({ isOpen, onClose, onSelect, fileType = "image" }: Props) {
```

- [ ] **Step 3: Pass fileType to loadFirstPage**

Find `loadFirstPage` (line 97). Replace the hardcoded `"image"`:

```ts
const loadFirstPage = useCallback(async (q: string) => {
  setIsLoadingFirst(true);
  try {
    const data = await listMediaAssets({ fileType, page: 1, search: q });
    setAssets(data);
    setPage(1);
    setHasMore(data.length === MEDIA_PAGE_SIZE);
  } finally {
    setIsLoadingFirst(false);
  }
}, [fileType]);
```

- [ ] **Step 4: Pass fileType to loadNextPage**

Find `loadNextPage` (line 109). Replace the hardcoded `"image"`:

```ts
const loadNextPage = useCallback(async (currentPage: number, q: string) => {
  if (isLoadingMore) return;
  setIsLoadingMore(true);
  try {
    const nextPage = currentPage + 1;
    const data = await listMediaAssets({ fileType, page: nextPage, search: q });
    if (data.length > 0) {
      setAssets((prev) => [...prev, ...data]);
      setPage(nextPage);
    }
    setHasMore(data.length === MEDIA_PAGE_SIZE);
  } finally {
    setIsLoadingMore(false);
  }
}, [isLoadingMore, fileType]);
```

- [ ] **Step 5: Add fileType to the loadFirstPage useEffect dependency**

Find the "Load on open" effect (line 126):

```ts
useEffect(() => {
  if (isOpen) loadFirstPage(search);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isOpen, fileType]);
```

- [ ] **Step 6: Update file input accept attribute and upload filter**

Find the hidden `<input type="file"` (around line 263). Update `accept`:

```tsx
<input
  ref={fileInputRef}
  type="file"
  accept={fileType === "video" ? "video/*" : "image/*"}
  multiple
  className="hidden"
  onChange={(e) => { if (e.target.files) handleFiles(Array.from(e.target.files)); e.target.value = ""; }}
/>
```

Also find `handleFiles` (line 172). Update the filter so videos are allowed when `fileType === "video"`:

```ts
const handleFiles = async (files: File[]) => {
  const allowed = files.filter((f) =>
    fileType === "video" ? f.type.startsWith("video/") : f.type.startsWith("image/")
  );
  if (!allowed.length) return;
  // rest of the function uses `allowed` instead of `imageFiles`
  const items: UploadingFile[] = allowed.map((f) => ({
    id: crypto.randomUUID(), name: f.name, progress: 0,
  }));
  setUploading((prev) => [...items, ...prev]);

  await Promise.allSettled(
    allowed.map(async (file, i) => {
      const id = items[i].id;
      const update = (patch: Partial<UploadingFile>) =>
        setUploading((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
      try {
        const { signedUrl, storagePath, publicUrl } = await getSignedUploadUrl(file.name, file.type);
        await uploadViaXhr(signedUrl, file, (pct) => update({ progress: pct }));
        const saved = await saveMediaAsset({
          storage_path: storagePath, public_url: publicUrl,
          mime_type: file.type, size_bytes: file.size, title: file.name,
        });
        update({ done: true, progress: 100 });
        setAssets((prev) => [saved, ...prev]);
        if (i === 0) setSelected(saved.public_url);
      } catch (err) {
        update({ error: err instanceof Error ? err.message : "Upload failed" });
      }
    })
  );
  setTimeout(() => setUploading((prev) => prev.filter((u) => !u.done)), 1800);
};
```

- [ ] **Step 7: Update search placeholder and empty state label**

Find the search `<input>` placeholder (line 277):
```tsx
placeholder={fileType === "video" ? "Search videos…" : "Search images…"}
```

Find the empty state upload button label (line 322):
```tsx
<Upload className="h-3 w-3" /> {fileType === "video" ? "Upload a video" : "Upload an image"}
```

Find the footer count label (line 378):
```tsx
{selected ? "1 item selected" : `${assets.length} ${fileType === "video" ? "videos" : "images"} · drag & drop to upload`}
```

Find the "Use Image" footer button (line 387):
```tsx
{fileType === "video" ? "Use Video" : "Use Image"}
```

Find the modal title (line 255 — inside the header `<h2>`):
```tsx
<h2 className="text-sm font-semibold text-[hsl(var(--admin-text))]">
  {fileType === "video" ? "Video Library" : "Media Library"}
</h2>
```

- [ ] **Step 8: Verify the page still works**

Run `npm run dev` and open any admin page editor. Open the media picker — it should behave exactly as before (defaults to image). No visual change expected.

- [ ] **Step 9: Commit**

```bash
git add src/components/admin/MediaPickerModal.tsx
git commit -m "feat: add fileType prop to MediaPickerModal for video support"
```

---

## Task 2: Add SphereMediaEditor to SectionEditor (EN tab)

**Files:**
- Modify: `src/app/(admin)/admin/(authed)/pages/[id]/SectionEditor.tsx`

Add a `SphereMediaEditor` inline component and wire it into the existing `"hero"` EN case.

### Data shape

Each item in `section.content.media_items`:
```ts
type SphereItem = {
  type: "image" | "video";
  url: string;
  posterUrl?: string;
  alt: string;
};
```

The editor reads/writes `section.content.media_items: SphereItem[]`.

- [ ] **Step 1: Add imports**

At the top of `SectionEditor.tsx`, add:

```ts
import { useState, useCallback } from "react";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
```

- [ ] **Step 2: Define SphereItem type and SphereMediaEditor component**

Add this block right before the `export default function SectionEditor` line:

```tsx
type SphereItem = {
  type: "image" | "video";
  url: string;
  posterUrl?: string;
  alt: string;
};

function SphereMediaEditor({
  items,
  onChange,
}: {
  items: SphereItem[];
  onChange: (items: SphereItem[]) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<{
    index: number;
    field: "url" | "posterUrl";
    fileType: "image" | "video";
  } | null>(null);

  const openPicker = useCallback(
    (index: number, field: "url" | "posterUrl", fileType: "image" | "video") => {
      setPickerTarget({ index, field, fileType });
      setPickerOpen(true);
    },
    []
  );

  const handleSelect = useCallback(
    (url: string) => {
      if (!pickerTarget) return;
      const updated = items.map((item, i) =>
        i === pickerTarget.index
          ? { ...item, [pickerTarget.field]: url }
          : item
      );
      onChange(updated);
    },
    [items, onChange, pickerTarget]
  );

  const setField = (index: number, field: keyof SphereItem, value: string) => {
    onChange(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const setType = (index: number, type: "image" | "video") => {
    onChange(
      items.map((item, i) =>
        i === index ? { ...item, type, url: "", posterUrl: undefined } : item
      )
    );
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const addItem = () => {
    onChange([...items, { type: "image", url: "", alt: "" }]);
  };

  const inputCls =
    "w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-3 py-2 text-sm text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">
          Sphere Media
        </span>
        <span className="text-[0.65rem] text-[hsl(var(--admin-text-muted))]">
          Max 8 shown (padded with defaults)
        </span>
      </div>

      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-[hsl(var(--admin-border))] px-3 py-3 text-center text-xs text-[hsl(var(--admin-text-muted))]">
          No media added — defaults will show in the sphere.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface,var(--admin-bg)))] p-3 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                {/* Thumbnail */}
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))]">
                  {item.type === "image" && item.url ? (
                    <img src={item.url} alt="" className="h-full w-full object-cover" />
                  ) : item.type === "video" && item.posterUrl ? (
                    <img src={item.posterUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[hsl(var(--admin-text-muted))]">
                      <span className="text-[0.6rem]">{item.type === "video" ? "VID" : "IMG"}</span>
                    </div>
                  )}
                </div>

                {/* Type toggle */}
                <select
                  className="rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-2 py-1.5 text-xs text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]"
                  value={item.type}
                  onChange={(e) => setType(index, e.target.value as "image" | "video")}
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="ml-auto rounded-md border border-[hsl(var(--admin-border))] px-2 py-1 text-xs text-[hsl(var(--admin-text-muted))] hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>

              {/* Media URL picker */}
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  className={`${inputCls} flex-1`}
                  placeholder={item.type === "video" ? "Video URL" : "Image URL"}
                  value={item.url}
                  onChange={(e) => setField(index, "url", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => openPicker(index, "url", item.type)}
                  className="shrink-0 rounded-md border border-[hsl(var(--admin-border))] px-2.5 py-2 text-xs font-medium text-[hsl(var(--admin-text))] hover:bg-[hsl(var(--admin-surface,var(--admin-bg)))] transition-colors"
                >
                  Pick
                </button>
              </div>

              {/* Poster URL (video only) */}
              {item.type === "video" ? (
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    className={`${inputCls} flex-1`}
                    placeholder="Poster image URL (optional)"
                    value={item.posterUrl ?? ""}
                    onChange={(e) => setField(index, "posterUrl", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => openPicker(index, "posterUrl", "image")}
                    className="shrink-0 rounded-md border border-[hsl(var(--admin-border))] px-2.5 py-2 text-xs font-medium text-[hsl(var(--admin-text))] hover:bg-[hsl(var(--admin-surface,var(--admin-bg)))] transition-colors"
                  >
                    Pick
                  </button>
                </div>
              ) : null}

              {/* Alt text (EN) */}
              <input
                type="text"
                className={inputCls}
                placeholder="Alt text (EN)"
                value={item.alt}
                onChange={(e) => setField(index, "alt", e.target.value)}
              />
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addItem}
        className="w-full rounded-md border border-dashed border-[hsl(var(--admin-border))] py-2 text-xs font-medium text-[hsl(var(--admin-text-muted))] hover:border-[hsl(var(--admin-accent))] hover:text-[hsl(var(--admin-accent))] transition-colors"
      >
        + Add media
      </button>

      <MediaPickerModal
        isOpen={pickerOpen}
        onClose={() => { setPickerOpen(false); setPickerTarget(null); }}
        onSelect={handleSelect}
        fileType={pickerTarget?.fileType ?? "image"}
      />
    </div>
  );
}
```

- [ ] **Step 3: Wire SphereMediaEditor into the hero EN case**

Find the `case "hero":` EN block (around line 302). Replace it:

```tsx
case "hero":
  return (
    <div className="space-y-3">
      <Field label="Headline" value={c(section, "headline")} onChange={(v) => set("headline", v)} type="textarea" />
      <Field label="Highlight word" value={c(section, "highlight")} onChange={(v) => set("highlight", v)} />
      <Field label="Body text" value={c(section, "body")} onChange={(v) => set("body", v)} type="textarea" />
      <Field label="CTA Label" value={c(section, "cta_label")} onChange={(v) => set("cta_label", v)} />
      <Field label="CTA URL" value={c(section, "cta_url")} onChange={(v) => set("cta_url", v)} type="url" />
      <div className="border-t border-[hsl(var(--admin-border))] pt-3">
        <SphereMediaEditor
          items={(section.content.media_items as SphereItem[] | undefined) ?? []}
          onChange={(items) => set("media_items", items)}
        />
      </div>
    </div>
  );
```

- [ ] **Step 4: Verify in the browser**

Start `npm run dev`. Open admin → Pages → any page with a hero section. The hero editor should now show the "Sphere Media" section at the bottom with "+ Add media". Add one image item, pick from library, save. Verify no JS errors in console.

- [ ] **Step 5: Commit**

```bash
git add src/app/(admin)/admin/(authed)/pages/[id]/SectionEditor.tsx
git commit -m "feat: add SphereMediaEditor to hero section in admin CRM"
```

---

## Task 3: Add AR alt text editor for sphere media

**Files:**
- Modify: `src/app/(admin)/admin/(authed)/pages/[id]/SectionEditor.tsx`

Add a read-only media list (thumbnails) + editable AR alt text fields in the hero AR tab.

- [ ] **Step 1: Update the hero AR case**

Find `case "hero":` in the AR switch block (around line 81). Replace it:

```tsx
case "hero": {
  const mediaItems = (section.content.media_items as SphereItem[] | undefined) ?? [];
  const arAlts = ((section.translations?.ar as Record<string, unknown> | undefined)?.media_items_alts ?? []) as string[];
  return (
    <div className="space-y-3">
      <p className="text-xs text-[hsl(var(--admin-text-muted))]">
        Translate the text fields. CTA URL is shared across languages.
      </p>
      <Field label="Headline (AR)" dir="rtl" value={ar(section, "headline")} onChange={(v) => setAr("headline", v)} type="textarea" />
      <Field label="Highlight word (AR)" dir="rtl" value={ar(section, "highlight")} onChange={(v) => setAr("highlight", v)} />
      <Field label="Body text (AR)" dir="rtl" value={ar(section, "body")} onChange={(v) => setAr("body", v)} type="textarea" />
      <Field label="CTA Label (AR)" dir="rtl" value={ar(section, "cta_label")} onChange={(v) => setAr("cta_label", v)} />

      {mediaItems.length > 0 ? (
        <div className="border-t border-[hsl(var(--admin-border))] pt-3 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">
            Sphere Media — Alt Text (AR)
          </span>
          {mediaItems.map((item, index) => {
            const thumbSrc = item.type === "image" ? item.url : item.posterUrl;
            return (
              <div key={index} className="flex items-center gap-2">
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded border border-[hsl(var(--admin-border))]">
                  {thumbSrc ? (
                    <img src={thumbSrc} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[hsl(var(--admin-bg))]">
                      <span className="text-[0.5rem] text-[hsl(var(--admin-text-muted))]">
                        {item.type === "video" ? "VID" : "IMG"}
                      </span>
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  dir="rtl"
                  className="w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-3 py-2 text-sm text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]"
                  placeholder={item.alt || "Alt text (AR)"}
                  value={arAlts[index] ?? ""}
                  onChange={(e) => {
                    const updated = [...arAlts];
                    updated[index] = e.target.value;
                    setAr("media_items_alts", updated);
                  }}
                />
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: Verify AR tab**

In the admin, switch the language tab to AR on a hero section that has media items added. You should see thumbnails + editable AR alt text fields below the regular AR fields.

- [ ] **Step 3: Commit**

```bash
git add src/app/(admin)/admin/(authed)/pages/[id]/SectionEditor.tsx
git commit -m "feat: add AR alt text editor for hero sphere media items"
```

---

## Task 4: Wire media_items into SectionRenderer

**Files:**
- Modify: `src/components/builder/SectionRenderer.tsx`

Map `section.content.media_items` → `CreativeHeroConfig.media.items` with locale-aware alt text.

- [ ] **Step 1: Update the hero case in SectionRenderer**

Find `case "hero":` (around line 67). Replace:

```tsx
case "hero": {
  const rawItems = Array.isArray(section.content.media_items)
    ? (section.content.media_items as Array<{ type: "image" | "video"; url: string; posterUrl?: string; alt: string }>)
    : [];
  const arAlts = isAr
    ? ((section.translations?.ar as Record<string, unknown> | undefined)?.media_items_alts ?? []) as string[]
    : [];

  const config: CreativeHeroConfig = {
    headline: String(c.headline ?? ""),
    highlight: String(c.highlight ?? ""),
    body: String(c.body ?? ""),
    primaryCta: c.cta_label
      ? { label: String(c.cta_label), href: String(c.cta_url ?? "#") }
      : undefined,
    media: rawItems.length > 0
      ? {
          items: rawItems.map((item, i) => ({
            type: item.type,
            url: item.url,
            posterUrl: item.posterUrl,
            alt: isAr ? (arAlts[i] || item.alt) : item.alt,
          })),
        }
      : undefined,
  };
  return <CreativeHero key={section.id} config={config} />;
}
```

- [ ] **Step 2: Verify end-to-end**

1. Run `npm run dev`.
2. In admin, add 2–3 images to a hero section's Sphere Media, save.
3. Visit `localhost:3001/en` — confirm your images appear in the sphere alongside the default placeholder images.
4. Visit `localhost:3001/ar` — confirm the sphere still renders (AR alts fall back to EN if not set).
5. Add AR alt text for one item in the AR tab, save. Visit `/ar` — verify (check browser DevTools → Elements for the `alt` attribute on the sphere image).

- [ ] **Step 3: Commit**

```bash
git add src/components/builder/SectionRenderer.tsx
git commit -m "feat: wire hero sphere media_items from CRM into CreativeHeroConfig"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** fileType prop (Task 1), media picker UI (Task 2), AR alts (Task 3), rendering wiring (Task 4) — all spec sections covered.
- [x] **No placeholders:** All steps have concrete code.
- [x] **Type consistency:** `SphereItem` defined in Task 2 and reused in Task 3 (same file). `SphereItem` matches `HeroMediaItem` shape in `hero-types.ts`. `rawItems` in Task 4 uses an inline type that matches `SphereItem`.
- [x] **MediaPickerModal `fileType` default:** Defaults to `"image"` — all existing usages unaffected.
- [x] **`resolveContent` interaction:** Task 4 reads `media_items` directly from `section.content` (not `c`) to avoid `resolveContent` accidentally overwriting it with an AR version that doesn't exist. AR alts are read separately from `section.translations.ar.media_items_alts`. This is correct.
