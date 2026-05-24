"use client";

import { useState, useCallback } from "react";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import type { PageSectionInput } from "@/lib/page-data";

interface Props {
  section: PageSectionInput & { id: string };
  onChange: (updated: PageSectionInput & { id: string }) => void;
  lang: "en" | "ar";
}

function ArDivider() {
  return (
    <div className="flex items-center gap-2 pt-1">
      <div className="flex-1 border-t border-amber-400/30" />
      <span className="text-xs font-semibold text-amber-500 uppercase r">العربية (Arabic)</span>
      <div className="flex-1 border-t border-amber-400/30" />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  dir,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "textarea" | "url";
  dir?: "ltr" | "rtl";
}) {
  const cls =
    "w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-3 py-2 text-sm text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]";
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium uppercase  text-[hsl(var(--admin-text-muted))]">
        {label}
      </label>
      {type === "textarea" ? (
        <textarea rows={4} dir={dir} className={cls} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type={type} dir={dir} className={cls} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

// Read from content (EN)
function c(section: PageSectionInput, key: string): string {
  return String(section.content[key] ?? "");
}

// Read from translations.ar (AR)
function ar(section: PageSectionInput, key: string): string {
  const arObj = (section.translations?.ar ?? {}) as Record<string, unknown>;
  return String(arObj[key] ?? "");
}

// ─── WhatWeDo item editor ─────────────────────────────────────────────────────

const WHAT_WE_DO_ICONS = [
  "palette", "zap", "layout", "file_text", "camera", "globe", "star",
  "layers", "megaphone", "bar_chart", "code", "sparkles", "pen_tool",
  "video", "shopping_bag", "lightbulb",
] as const;

type ShowcaseImage = { url: string; alt: string };
type WhatWeDoItem = { icon?: string; title: string; description: string };

function WhatWeDoItemEditor({
  items,
  onChange,
  dir,
  showIcon = true,
}: {
  items: WhatWeDoItem[];
  onChange: (items: WhatWeDoItem[]) => void;
  dir?: "ltr" | "rtl";
  showIcon?: boolean;
}) {
  const inputCls =
    "w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-3 py-2 text-sm text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]";

  const setField = (index: number, field: keyof WhatWeDoItem, value: string) =>
    onChange(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));

  const removeItem = (index: number) => onChange(items.filter((_, i) => i !== index));

  const addItem = () =>
    onChange([...items, { icon: "sparkles", title: "", description: "" }]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase  text-[hsl(var(--admin-text-muted))]">
          Items
        </span>
        <span className="text-[0.65rem] text-[hsl(var(--admin-text-muted))]">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-[hsl(var(--admin-border))] px-3 py-3 text-center text-xs text-[hsl(var(--admin-text-muted))]">
          No items yet. Click "+ Add item" to start.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface,var(--admin-bg)))] p-3 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-[hsl(var(--admin-text-muted))]">
                  Item {index + 1}
                </span>
                {showIcon && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="rounded-md border border-[hsl(var(--admin-border))] px-2 py-1 text-xs text-[hsl(var(--admin-text-muted))] hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              {showIcon && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[hsl(var(--admin-text-muted))]">Icon</label>
                  <select
                    className="rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-3 py-2 text-sm text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]"
                    value={item.icon ?? ""}
                    onChange={(e) => setField(index, "icon", e.target.value)}
                  >
                    <option value="">— no icon —</option>
                    {WHAT_WE_DO_ICONS.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[hsl(var(--admin-text-muted))]">Title</label>
                <input
                  type="text"
                  dir={dir}
                  className={inputCls}
                  placeholder="Title"
                  value={item.title}
                  onChange={(e) => setField(index, "title", e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[hsl(var(--admin-text-muted))]">Description</label>
                <textarea
                  rows={2}
                  dir={dir}
                  className={inputCls}
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => setField(index, "description", e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {showIcon && (
        <button
          type="button"
          onClick={addItem}
          className="w-full rounded-md border border-dashed border-[hsl(var(--admin-border))] py-2 text-xs font-medium text-[hsl(var(--admin-text-muted))] hover:border-[hsl(var(--admin-accent))] hover:text-[hsl(var(--admin-accent))] transition-colors"
        >
          + Add item
        </button>
      )}
    </div>
  );
}

// ─── Sphere media editor ──────────────────────────────────────────────────────

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
        <span className="text-xs font-semibold uppercase  text-[hsl(var(--admin-text-muted))]">
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

                <select
                  className="rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-2 py-1.5 text-xs text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]"
                  value={item.type}
                  onChange={(e) => setType(index, e.target.value as "image" | "video")}
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>

                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="ml-auto rounded-md border border-[hsl(var(--admin-border))] px-2 py-1 text-xs text-[hsl(var(--admin-text-muted))] hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>

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

// ─── Standalone showcase image list editor ────────────────────────────────────

function ShowcaseImagesEditor({
  images,
  onChange,
  dir,
}: {
  images: ShowcaseImage[];
  onChange: (images: ShowcaseImage[]) => void;
  dir?: "ltr" | "rtl";
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const inputCls =
    "w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-3 py-2 text-sm text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]";

  const setAlt = (i: number, alt: string) =>
    onChange(images.map((img, j) => (j === i ? { ...img, alt } : img)));

  const remove = (i: number) => onChange(images.filter((_, j) => j !== i));

  return (
    <div className="space-y-1.5">
      {images.length === 0 ? (
        <p className="text-[0.65rem] text-[hsl(var(--admin-text-muted))]">No showcase images yet.</p>
      ) : (
        <div className="space-y-1.5">
          {images.map((img, i) => (
            <div key={i} className="flex items-center gap-2">
              {img.url ? (
                <img src={img.url} alt="" className="h-10 w-10 shrink-0 rounded-md border border-[hsl(var(--admin-border))] object-cover" />
              ) : (
                <div className="h-10 w-10 shrink-0 rounded-md border border-dashed border-[hsl(var(--admin-border))]" />
              )}
              <input
                type="text"
                dir={dir}
                className={`${inputCls} flex-1 text-xs`}
                placeholder="Alt text"
                value={img.alt ?? ""}
                onChange={(e) => setAlt(i, e.target.value)}
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="shrink-0 rounded-md border border-[hsl(var(--admin-border))] px-2 py-1 text-xs text-[hsl(var(--admin-text-muted))] hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="w-full rounded-md border border-dashed border-[hsl(var(--admin-border))] py-1.5 text-xs font-medium text-[hsl(var(--admin-text-muted))] hover:border-[hsl(var(--admin-accent))] hover:text-[hsl(var(--admin-accent))] transition-colors"
      >
        + Add image
      </button>
      <MediaPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => { onChange([...images, { url, alt: "" }]); setPickerOpen(false); }}
        fileType="image"
      />
    </div>
  );
}

// ─── Service card editor ──────────────────────────────────────────────────────

type ServiceCardLocal = { title: string; subtitle: string; image_url: string; slug: string };

function ServiceCardEditor({
  cards,
  onChange,
}: {
  cards: ServiceCardLocal[];
  onChange: (cards: ServiceCardLocal[]) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<number | null>(null);

  const inputCls =
    "w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-3 py-2 text-sm text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]";

  const setField = (i: number, field: keyof ServiceCardLocal, value: string) =>
    onChange(cards.map((card, j) => (j === i ? { ...card, [field]: value } : card)));

  const remove = (i: number) => onChange(cards.filter((_, j) => j !== i));

  const addCard = () =>
    onChange([...cards, { title: "", subtitle: "", image_url: "", slug: "" }]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase  text-[hsl(var(--admin-text-muted))]">
          Cards
        </span>
        <span className="text-[0.65rem] text-[hsl(var(--admin-text-muted))]">
          {cards.length} card{cards.length !== 1 ? "s" : ""}
        </span>
      </div>

      {cards.length === 0 ? (
        <p className="rounded-md border border-dashed border-[hsl(var(--admin-border))] px-3 py-3 text-center text-xs text-[hsl(var(--admin-text-muted))]">
          No cards yet. Click "+ Add card" to start.
        </p>
      ) : (
        <div className="space-y-3">
          {cards.map((card, i) => (
            <div
              key={i}
              className="rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface,var(--admin-bg)))] p-3 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-[hsl(var(--admin-text-muted))]">
                  Card {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="rounded-md border border-[hsl(var(--admin-border))] px-2 py-1 text-xs text-[hsl(var(--admin-text-muted))] hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>

              <div className="flex items-center gap-2">
                {card.image_url ? (
                  <img
                    src={card.image_url}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-md border border-[hsl(var(--admin-border))] object-cover"
                  />
                ) : (
                  <div className="h-14 w-14 shrink-0 rounded-md border border-dashed border-[hsl(var(--admin-border))] flex items-center justify-center text-[0.6rem] text-[hsl(var(--admin-text-muted))]">
                    No img
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => { setPickerTarget(i); setPickerOpen(true); }}
                  className="rounded-md border border-[hsl(var(--admin-border))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--admin-text-muted))] hover:border-[hsl(var(--admin-accent))] hover:text-[hsl(var(--admin-accent))] transition-colors"
                >
                  {card.image_url ? "Change image" : "Pick image"}
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[hsl(var(--admin-text-muted))]">Title</label>
                <input type="text" className={inputCls} placeholder="Card title" value={card.title}
                  onChange={(e) => setField(i, "title", e.target.value)} />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[hsl(var(--admin-text-muted))]">Subtitle</label>
                <input type="text" className={inputCls} placeholder="e.g. Brand Identity" value={card.subtitle}
                  onChange={(e) => setField(i, "subtitle", e.target.value)} />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[hsl(var(--admin-text-muted))]">Slug (project link)</label>
                <input type="text" className={inputCls} placeholder="e.g. mazaq" value={card.slug}
                  onChange={(e) => setField(i, "slug", e.target.value)} />
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addCard}
        className="w-full rounded-md border border-dashed border-[hsl(var(--admin-border))] py-1.5 text-xs font-medium text-[hsl(var(--admin-text-muted))] hover:border-[hsl(var(--admin-accent))] hover:text-[hsl(var(--admin-accent))] transition-colors"
      >
        + Add card
      </button>

      <MediaPickerModal
        isOpen={pickerOpen}
        onClose={() => { setPickerOpen(false); setPickerTarget(null); }}
        onSelect={(url) => {
          if (pickerTarget !== null) setField(pickerTarget, "image_url", url);
          setPickerOpen(false);
          setPickerTarget(null);
        }}
        fileType="image"
      />
    </div>
  );
}

export default function SectionEditor({ section, onChange, lang }: Props) {
  // Update EN content
  const set = (key: string, value: unknown) =>
    onChange({ ...section, content: { ...section.content, [key]: value } });

  // Update AR translations
  const setAr = (key: string, value: unknown) => {
    const existing = (section.translations?.ar ?? {}) as Record<string, unknown>;
    onChange({
      ...section,
      translations: {
        ...section.translations,
        ar: { ...existing, [key]: value },
      },
    });
  };

  const renderFields = () => {
    if (lang === "ar") {
      switch (section.type) {
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
                  <span className="text-xs font-semibold uppercase  text-[hsl(var(--admin-text-muted))]">
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
        case "text_image":
          return (
            <div className="space-y-3">
              <p className="text-xs text-[hsl(var(--admin-text-muted))]">
                Translate text fields. Image URL and layout are shared.
              </p>
              <Field label="Eyebrow (AR)" dir="rtl" value={ar(section, "eyebrow")} onChange={(v) => setAr("eyebrow", v)} />
              <Field label="Title (AR)" dir="rtl" value={ar(section, "title")} onChange={(v) => setAr("title", v)} />
              <Field
                label="Body paragraph 1 (AR)"
                dir="rtl"
                type="textarea"
                value={Array.isArray((section.translations?.ar as Record<string, unknown> | undefined)?.body)
                  ? String(((section.translations?.ar as Record<string, unknown>).body as string[])[0] ?? "")
                  : ""}
                onChange={(v) => {
                  const existing = ((section.translations?.ar as Record<string, unknown> | undefined)?.body ?? []) as string[];
                  setAr("body", [v, existing[1] ?? ""].filter(Boolean));
                }}
              />
              <Field
                label="Body paragraph 2 (AR, optional)"
                dir="rtl"
                type="textarea"
                value={Array.isArray((section.translations?.ar as Record<string, unknown> | undefined)?.body)
                  ? String(((section.translations?.ar as Record<string, unknown>).body as string[])[1] ?? "")
                  : ""}
                onChange={(v) => {
                  const existing = ((section.translations?.ar as Record<string, unknown> | undefined)?.body ?? []) as string[];
                  setAr("body", [existing[0] ?? "", v].filter(Boolean));
                }}
              />
            </div>
          );
        case "projects_grid":
          return (
            <div className="space-y-3">
              <Field label="Eyebrow (AR)" dir="rtl" value={ar(section, "eyebrow")} onChange={(v) => setAr("eyebrow", v)} />
              <Field label="Heading (AR)" dir="rtl" value={ar(section, "heading")} onChange={(v) => setAr("heading", v)} />
            </div>
          );
        case "faq":
          return (
            <div className="space-y-3">
              <Field label="Eyebrow (AR)" dir="rtl" value={ar(section, "eyebrow")} onChange={(v) => setAr("eyebrow", v)} />
              <Field label="Heading (AR)" dir="rtl" value={ar(section, "heading")} onChange={(v) => setAr("heading", v)} />
            </div>
          );
        case "product_feature":
          return (
            <div className="space-y-3">
              <Field label="Eyebrow (AR)" dir="rtl" value={ar(section, "eyebrow")} onChange={(v) => setAr("eyebrow", v)} />
              <Field label="Title (AR)" dir="rtl" value={ar(section, "title")} onChange={(v) => setAr("title", v)} />
              <Field label="Body (AR)" dir="rtl" value={ar(section, "body")} onChange={(v) => setAr("body", v)} type="textarea" />
              <Field label="CTA Label (AR)" dir="rtl" value={ar(section, "cta_label")} onChange={(v) => setAr("cta_label", v)} />
            </div>
          );
        case "metrics":
          return (
            <div className="space-y-3">
              <Field label="Heading (AR)" dir="rtl" value={ar(section, "heading")} onChange={(v) => setAr("heading", v)} />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium uppercase  text-[hsl(var(--admin-text-muted))]">
                  Items (AR — JSON array with label/value)
                </label>
                <textarea
                  dir="rtl"
                  rows={5}
                  className="w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-3 py-2 text-sm font-mono text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]"
                  value={JSON.stringify(
                    ((section.translations?.ar as Record<string, unknown> | undefined)?.items ?? section.content.items ?? []),
                    null,
                    2
                  )}
                  onChange={(e) => {
                    try { setAr("items", JSON.parse(e.target.value)); } catch { /* ignore invalid JSON mid-edit */ }
                  }}
                />
              </div>
            </div>
          );
        case "rich_text":
          return (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase  text-[hsl(var(--admin-text-muted))]">
                HTML (AR — allowed: p, h2–h4, a, strong, em, ul, ol, li, blockquote)
              </label>
              <textarea
                dir="rtl"
                rows={10}
                className="w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-3 py-2 text-sm font-mono text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]"
                value={ar(section, "html")}
                onChange={(e) => setAr("html", e.target.value)}
              />
            </div>
          );
        case "what_we_do": {
          const arItems = (((section.translations?.ar as Record<string, unknown> | undefined)?.items ?? section.content.items ?? []) as WhatWeDoItem[]);
          return (
            <div className="space-y-3">
              <p className="text-xs text-[hsl(var(--admin-text-muted))]">
                Translate text fields. Icons are shared with English.
              </p>
              <Field label="Eyebrow (AR)" dir="rtl" value={ar(section, "eyebrow")} onChange={(v) => setAr("eyebrow", v)} />
              <Field label="Title (AR)" dir="rtl" value={ar(section, "title")} onChange={(v) => setAr("title", v)} />
              <Field label="Body (AR)" dir="rtl" value={ar(section, "body")} onChange={(v) => setAr("body", v)} type="textarea" />
              <div className="border-t border-[hsl(var(--admin-border))] pt-3">
                <WhatWeDoItemEditor
                  items={arItems}
                  onChange={(items) => setAr("items", items)}
                  dir="rtl"
                  showIcon={false}
                />
              </div>
            </div>
          );
        }
        case "about_hero":
        case "services_hero":
          return (
            <div className="space-y-3">
              <Field label="Title (AR)" dir="rtl" value={ar(section, "title")} onChange={(v) => setAr("title", v)} type="textarea" />
              <Field label="Body (AR)" dir="rtl" value={ar(section, "body")} onChange={(v) => setAr("body", v)} type="textarea" />
            </div>
          );
        case "about_content":
          return (
            <div className="space-y-3">
              <Field label="Eyebrow (AR)" dir="rtl" value={ar(section, "eyebrow")} onChange={(v) => setAr("eyebrow", v)} />
              <Field label="Title (AR)" dir="rtl" value={ar(section, "title")} onChange={(v) => setAr("title", v)} type="textarea" />
              <Field label="Body (AR)" dir="rtl" value={ar(section, "body")} onChange={(v) => setAr("body", v)} type="textarea" />
            </div>
          );
        case "about_mission":
          return (
            <div className="space-y-3">
              <Field label="Eyebrow (AR)" dir="rtl" value={ar(section, "eyebrow")} onChange={(v) => setAr("eyebrow", v)} />
              <Field label="Quote (AR)" dir="rtl" value={ar(section, "quote")} onChange={(v) => setAr("quote", v)} type="textarea" />
            </div>
          );
        case "about_process":
          return (
            <div className="space-y-3">
              <Field label="Eyebrow (AR)" dir="rtl" value={ar(section, "eyebrow")} onChange={(v) => setAr("eyebrow", v)} />
              <Field label="Title (AR)" dir="rtl" value={ar(section, "title")} onChange={(v) => setAr("title", v)} type="textarea" />
              <Field label="Body (AR)" dir="rtl" value={ar(section, "body")} onChange={(v) => setAr("body", v)} type="textarea" />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium uppercase  text-[hsl(var(--admin-text-muted))]">
                  Steps (AR — JSON: [{`{ "num": "01", "title": "...", "body": "..." }`}, ...])
                </label>
                <textarea dir="rtl" rows={8}
                  className="w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-3 py-2 text-sm font-mono text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]"
                  value={JSON.stringify(((section.translations?.ar as Record<string, unknown> | undefined)?.steps ?? section.content.steps ?? []), null, 2)}
                  onChange={(e) => { try { setAr("steps", JSON.parse(e.target.value)); } catch { /**/ } }}
                />
              </div>
            </div>
          );
        case "services_section":
          return (
            <div className="space-y-3">
              <Field label="Eyebrow (AR)" dir="rtl" value={ar(section, "eyebrow")} onChange={(v) => setAr("eyebrow", v)} />
              <Field label="Title (AR)" dir="rtl" value={ar(section, "title")} onChange={(v) => setAr("title", v)} type="textarea" />
              <Field label="Body (AR)" dir="rtl" value={ar(section, "body")} onChange={(v) => setAr("body", v)} type="textarea" />
              <Field label="Link Label (AR)" dir="rtl" value={ar(section, "link_label")} onChange={(v) => setAr("link_label", v)} />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium uppercase  text-[hsl(var(--admin-text-muted))]">
                  Cards (AR — JSON: [{`{ "title": "...", "subtitle": "...", "image_url": "...", "slug": "..." }`}, ...])
                </label>
                <textarea dir="rtl" rows={8}
                  className="w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-3 py-2 text-sm font-mono text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]"
                  value={JSON.stringify(((section.translations?.ar as Record<string, unknown> | undefined)?.cards ?? section.content.cards ?? []), null, 2)}
                  onChange={(e) => { try { setAr("cards", JSON.parse(e.target.value)); } catch { /**/ } }}
                />
              </div>
            </div>
          );
        case "services_credentials":
          return (
            <div className="space-y-3">
              <Field label="Eyebrow (AR)" dir="rtl" value={ar(section, "eyebrow")} onChange={(v) => setAr("eyebrow", v)} />
              <Field label="Title (AR)" dir="rtl" value={ar(section, "title")} onChange={(v) => setAr("title", v)} type="textarea" />
              <Field label="Body (AR)" dir="rtl" value={ar(section, "body")} onChange={(v) => setAr("body", v)} type="textarea" />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium uppercase  text-[hsl(var(--admin-text-muted))]">
                  Stats (AR — JSON: [{`{ "label": "...", "value": "120+" }`}, ...])
                </label>
                <textarea dir="rtl" rows={6}
                  className="w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-3 py-2 text-sm font-mono text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]"
                  value={JSON.stringify(((section.translations?.ar as Record<string, unknown> | undefined)?.stats ?? section.content.stats ?? []), null, 2)}
                  onChange={(e) => { try { setAr("stats", JSON.parse(e.target.value)); } catch { /**/ } }}
                />
              </div>
            </div>
          );
        default:
          return <p className="text-xs text-[hsl(var(--admin-text-muted))]">Unknown section type.</p>;
      }
    }

    // ── English (default) ────────────────────────────────────────────────────
    switch (section.type) {
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
      case "text_image":
        return (
          <div className="space-y-3">
            <Field label="Eyebrow" value={c(section, "eyebrow")} onChange={(v) => set("eyebrow", v)} />
            <Field label="Title" value={c(section, "title")} onChange={(v) => set("title", v)} />
            <Field label="Body paragraph 1" value={Array.isArray(section.content.body) ? String((section.content.body as string[])[0] ?? "") : ""} onChange={(v) => {
              const arr = [v, Array.isArray(section.content.body) ? String((section.content.body as string[])[1] ?? "") : ""].filter(Boolean);
              set("body", arr);
            }} type="textarea" />
            <Field label="Body paragraph 2 (optional)" value={Array.isArray(section.content.body) ? String((section.content.body as string[])[1] ?? "") : ""} onChange={(v) => {
              const arr = [Array.isArray(section.content.body) ? String((section.content.body as string[])[0] ?? "") : "", v].filter(Boolean);
              set("body", arr);
            }} type="textarea" />
            <Field label="Image URL" value={c(section, "image_url")} onChange={(v) => set("image_url", v)} type="url" />
            <Field label="Image Alt" value={c(section, "image_alt")} onChange={(v) => set("image_alt", v)} />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase  text-[hsl(var(--admin-text-muted))]">Image Layout</label>
              <select
                className="rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-3 py-2 text-sm"
                value={c(section, "image_layout") || "right"}
                onChange={(e) => set("image_layout", e.target.value)}
              >
                <option value="right">Right</option>
                <option value="left">Left</option>
              </select>
            </div>
          </div>
        );
      case "projects_grid":
        return (
          <div className="space-y-3">
            <Field label="Eyebrow" value={c(section, "eyebrow")} onChange={(v) => set("eyebrow", v)} />
            <Field label="Heading" value={c(section, "heading")} onChange={(v) => set("heading", v)} />
            <p className="text-xs text-[hsl(var(--admin-text-muted))]">Shows live project data from the Projects collection.</p>
          </div>
        );
      case "faq":
        return (
          <div className="space-y-3">
            <Field label="Eyebrow" value={c(section, "eyebrow")} onChange={(v) => set("eyebrow", v)} />
            <Field label="Heading" value={c(section, "heading")} onChange={(v) => set("heading", v)} />
            <p className="text-xs text-[hsl(var(--admin-text-muted))]">Shows live FAQ data from the FAQ collection.</p>
          </div>
        );
      case "product_feature":
        return (
          <div className="space-y-3">
            <Field label="Eyebrow" value={c(section, "eyebrow")} onChange={(v) => set("eyebrow", v)} />
            <Field label="Title" value={c(section, "title")} onChange={(v) => set("title", v)} />
            <Field label="Body" value={c(section, "body")} onChange={(v) => set("body", v)} type="textarea" />
            <Field label="Image URL" value={c(section, "image_url")} onChange={(v) => set("image_url", v)} type="url" />
            <Field label="CTA Label" value={c(section, "cta_label")} onChange={(v) => set("cta_label", v)} />
            <Field label="CTA URL" value={c(section, "cta_url")} onChange={(v) => set("cta_url", v)} type="url" />
          </div>
        );
      case "metrics":
        return (
          <div className="space-y-3">
            <Field label="Heading" value={c(section, "heading")} onChange={(v) => set("heading", v)} />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase  text-[hsl(var(--admin-text-muted))]">
                Items (JSON array)
              </label>
              <textarea
                rows={5}
                className="w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-3 py-2 text-sm font-mono text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]"
                value={JSON.stringify(section.content.items ?? [], null, 2)}
                onChange={(e) => {
                  try { set("items", JSON.parse(e.target.value)); } catch { /* ignore invalid JSON mid-edit */ }
                }}
              />
            </div>
          </div>
        );
      case "rich_text":
        return (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium uppercase  text-[hsl(var(--admin-text-muted))]">
              HTML (allowed: p, h2–h4, a, strong, em, ul, ol, li, blockquote)
            </label>
            <textarea
              rows={10}
              className="w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-3 py-2 text-sm font-mono text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]"
              value={c(section, "html")}
              onChange={(e) => set("html", e.target.value)}
            />
          </div>
        );
      case "what_we_do":
        return (
          <div className="space-y-3">
            <Field label="Eyebrow" value={c(section, "eyebrow")} onChange={(v) => set("eyebrow", v)} />
            <Field label="Title" value={c(section, "title")} onChange={(v) => set("title", v)} />
            <Field label="Body" value={c(section, "body")} onChange={(v) => set("body", v)} type="textarea" />
            <div className="border-t border-[hsl(var(--admin-border))] pt-3">
              <WhatWeDoItemEditor
                items={(section.content.items as WhatWeDoItem[] | undefined) ?? []}
                onChange={(items) => set("items", items)}
                showIcon
              />
            </div>
          </div>
        );
      case "about_hero":
      case "services_hero":
        return (
          <div className="space-y-3">
            <Field label="Title" value={c(section, "title")} onChange={(v) => set("title", v)} type="textarea" />
            <Field label="Body" value={c(section, "body")} onChange={(v) => set("body", v)} type="textarea" />
          </div>
        );
      case "about_content":
        return (
          <div className="space-y-3">
            <Field label="Section ID (anchor)" value={c(section, "section_id")} onChange={(v) => set("section_id", v)} />
            <Field label="Eyebrow" value={c(section, "eyebrow")} onChange={(v) => set("eyebrow", v)} />
            <Field label="Title" value={c(section, "title")} onChange={(v) => set("title", v)} type="textarea" />
            <Field label="Body" value={c(section, "body")} onChange={(v) => set("body", v)} type="textarea" />
          </div>
        );
      case "about_mission":
        return (
          <div className="space-y-3">
            <Field label="Eyebrow" value={c(section, "eyebrow")} onChange={(v) => set("eyebrow", v)} />
            <Field label="Quote" value={c(section, "quote")} onChange={(v) => set("quote", v)} type="textarea" />
          </div>
        );
      case "about_process":
        return (
          <div className="space-y-3">
            <Field label="Eyebrow" value={c(section, "eyebrow")} onChange={(v) => set("eyebrow", v)} />
            <Field label="Title" value={c(section, "title")} onChange={(v) => set("title", v)} type="textarea" />
            <Field label="Body" value={c(section, "body")} onChange={(v) => set("body", v)} type="textarea" />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase  text-[hsl(var(--admin-text-muted))]">
                Steps (JSON — [{`{ "num": "01", "title": "...", "body": "..." }`}, ...])
              </label>
              <textarea rows={10}
                className="w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-3 py-2 text-sm font-mono text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]"
                value={JSON.stringify(section.content.steps ?? [], null, 2)}
                onChange={(e) => { try { set("steps", JSON.parse(e.target.value)); } catch { /**/ } }}
              />
            </div>
          </div>
        );
      case "services_section":
        return (
          <div className="space-y-3">
            <Field label="Section ID (anchor)" value={c(section, "section_id")} onChange={(v) => set("section_id", v)} />
            <Field label="Eyebrow" value={c(section, "eyebrow")} onChange={(v) => set("eyebrow", v)} />
            <Field label="Title" value={c(section, "title")} onChange={(v) => set("title", v)} type="textarea" />
            <Field label="Body" value={c(section, "body")} onChange={(v) => set("body", v)} type="textarea" />
            <Field label="Link Label" value={c(section, "link_label")} onChange={(v) => set("link_label", v)} />
            <div className="border-t border-[hsl(var(--admin-border))] pt-3">
              <ServiceCardEditor
                cards={(section.content.cards as ServiceCardLocal[] | undefined) ?? []}
                onChange={(cards) => set("cards", cards)}
              />
            </div>
            <div className="border-t border-[hsl(var(--admin-border))] pt-3 space-y-1.5">
              <label className="text-xs font-semibold uppercase  text-[hsl(var(--admin-text-muted))]">
                Showcase Images (slider shown when no project cards)
              </label>
              <ShowcaseImagesEditor
                images={(section.content.showcase_images as ShowcaseImage[] | undefined) ?? []}
                onChange={(imgs) => set("showcase_images", imgs)}
              />
            </div>
          </div>
        );
      case "services_credentials":
        return (
          <div className="space-y-3">
            <Field label="Eyebrow" value={c(section, "eyebrow")} onChange={(v) => set("eyebrow", v)} />
            <Field label="Title" value={c(section, "title")} onChange={(v) => set("title", v)} type="textarea" />
            <Field label="Body" value={c(section, "body")} onChange={(v) => set("body", v)} type="textarea" />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase  text-[hsl(var(--admin-text-muted))]">
                Stats (JSON — [{`{ "label": "Happy Clients", "value": "120+" }`}, ...])
              </label>
              <textarea rows={8}
                className="w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-3 py-2 text-sm font-mono text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]"
                value={JSON.stringify(section.content.stats ?? [], null, 2)}
                onChange={(e) => { try { set("stats", JSON.parse(e.target.value)); } catch { /**/ } }}
              />
            </div>
          </div>
        );
      default:
        return <p className="text-xs text-[hsl(var(--admin-text-muted))]">Unknown section type.</p>;
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${lang === "ar" ? "border-amber-400/40 bg-amber-50/5" : "border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))]"}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase st text-[hsl(var(--admin-text-muted))]">
          {section.type.replace(/_/g, " ")}
        </p>
        {lang === "ar" && <span className="text-xs font-normal text-amber-500">العربية</span>}
      </div>
      {lang === "ar" && <ArDivider />}
      <div className={lang === "ar" ? "mt-3" : ""}>
        {renderFields()}
      </div>
    </div>
  );
}
