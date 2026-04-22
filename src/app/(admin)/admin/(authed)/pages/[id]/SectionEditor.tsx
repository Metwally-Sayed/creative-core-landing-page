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
      <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">العربية (Arabic)</span>
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
      <label className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">
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
        case "hero":
          return (
            <div className="space-y-3">
              <p className="text-xs text-[hsl(var(--admin-text-muted))]">
                Translate the text fields. CTA URL is shared across languages.
              </p>
              <Field label="Headline (AR)" dir="rtl" value={ar(section, "headline")} onChange={(v) => setAr("headline", v)} type="textarea" />
              <Field label="Highlight word (AR)" dir="rtl" value={ar(section, "highlight")} onChange={(v) => setAr("highlight", v)} />
              <Field label="Body text (AR)" dir="rtl" value={ar(section, "body")} onChange={(v) => setAr("body", v)} type="textarea" />
              <Field label="CTA Label (AR)" dir="rtl" value={ar(section, "cta_label")} onChange={(v) => setAr("cta_label", v)} />
            </div>
          );
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
                <label className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">
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
              <label className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">
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
        case "what_we_do":
          return (
            <div className="space-y-3">
              <p className="text-xs text-[hsl(var(--admin-text-muted))]">
                Translate text fields. Items JSON must mirror the EN structure.
              </p>
              <Field label="Eyebrow (AR)" dir="rtl" value={ar(section, "eyebrow")} onChange={(v) => setAr("eyebrow", v)} />
              <Field label="Title (AR)" dir="rtl" value={ar(section, "title")} onChange={(v) => setAr("title", v)} />
              <Field label="Body (AR)" dir="rtl" value={ar(section, "body")} onChange={(v) => setAr("body", v)} type="textarea" />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">
                  Items (AR — JSON: [{`{ "title": "...", "description": "..." }`}, ...])
                </label>
                <textarea
                  dir="rtl"
                  rows={6}
                  className="w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-3 py-2 text-sm font-mono text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]"
                  value={JSON.stringify(
                    ((section.translations?.ar as Record<string, unknown> | undefined)?.items ?? section.content.items ?? []),
                    null, 2
                  )}
                  onChange={(e) => {
                    try { setAr("items", JSON.parse(e.target.value)); } catch { /* ignore invalid JSON mid-edit */ }
                  }}
                />
              </div>
            </div>
          );
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
                <label className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">
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
                <label className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">
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
                <label className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">
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
              <label className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">Image Layout</label>
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
              <label className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">
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
            <label className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">
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
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">
                Items (JSON array)
              </label>
              <p className="text-xs text-[hsl(var(--admin-text-muted))]">
                Each item: <code className="bg-[hsl(var(--admin-border)/0.4)] px-1 rounded">{`{ "icon": "palette", "title": "...", "description": "..." }`}</code>.{" "}
                Icons: palette, zap, layout, file_text, camera, globe, star, layers, megaphone, bar_chart, code, sparkles, pen_tool, video, shopping_bag, lightbulb.
              </p>
              <textarea
                rows={8}
                className="w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-3 py-2 text-sm font-mono text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]"
                value={JSON.stringify(section.content.items ?? [], null, 2)}
                onChange={(e) => {
                  try { set("items", JSON.parse(e.target.value)); } catch { /* ignore invalid JSON mid-edit */ }
                }}
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
              <label className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">
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
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">
                Cards (JSON — [{`{ "title": "...", "subtitle": "...", "image_url": "...", "slug": "..." }`}, ...])
              </label>
              <textarea rows={10}
                className="w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-3 py-2 text-sm font-mono text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]"
                value={JSON.stringify(section.content.cards ?? [], null, 2)}
                onChange={(e) => { try { set("cards", JSON.parse(e.target.value)); } catch { /**/ } }}
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
              <label className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">
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
        <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--admin-text-muted))]">
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
