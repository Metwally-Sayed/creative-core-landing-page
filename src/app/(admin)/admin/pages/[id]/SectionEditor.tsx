"use client";

import type { SectionType, PageSectionInput } from "@/lib/page-data";

interface Props {
  section: PageSectionInput & { id: string };
  onChange: (updated: PageSectionInput & { id: string }) => void;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "textarea" | "url";
}) {
  const cls =
    "w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-3 py-2 text-sm text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]";
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">
        {label}
      </label>
      {type === "textarea" ? (
        <textarea rows={4} className={cls} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type={type} className={cls} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

function c(section: PageSectionInput, key: string): string {
  return String(section.content[key] ?? "");
}

export default function SectionEditor({ section, onChange }: Props) {
  const set = (key: string, value: unknown) =>
    onChange({ ...section, content: { ...section.content, [key]: value } });

  const renderFields = () => {
    switch (section.type) {
      case "hero":
        return (
          <div className="space-y-3">
            <Field label="Headline" value={c(section, "headline")} onChange={(v) => set("headline", v)} type="textarea" />
            <Field label="Highlight word" value={c(section, "highlight")} onChange={(v) => set("highlight", v)} />
            <Field label="Body text" value={c(section, "body")} onChange={(v) => set("body", v)} type="textarea" />
            <Field label="CTA Label" value={c(section, "cta_label")} onChange={(v) => set("cta_label", v)} />
            <Field label="CTA URL" value={c(section, "cta_url")} onChange={(v) => set("cta_url", v)} type="url" />
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
      default:
        return <p className="text-xs text-[hsl(var(--admin-text-muted))]">Unknown section type.</p>;
    }
  };

  return (
    <div className="rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[hsl(var(--admin-text-muted))]">
        {section.type.replace(/_/g, " ")}
      </p>
      {renderFields()}
    </div>
  );
}
