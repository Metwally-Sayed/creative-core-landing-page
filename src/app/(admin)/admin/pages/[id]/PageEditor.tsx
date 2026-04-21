"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { updatePage } from "./actions";
import SectionEditor from "./SectionEditor";
import type { PageFullDb, PageSectionInput, SectionType } from "@/lib/page-data";

const SECTION_TYPES: SectionType[] = [
  "hero",
  "text_image",
  "projects_grid",
  "faq",
  "product_feature",
  "metrics",
  "rich_text",
];

function SortableSection({
  section,
  expanded,
  onToggle,
  onChange,
  onRemove,
}: {
  section: PageSectionInput & { id: string };
  expanded: boolean;
  onToggle: () => void;
  onChange: (s: PageSectionInput & { id: string }) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))]"
    >
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))]"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="flex-1 text-sm font-medium text-[hsl(var(--admin-text))]">
          {section.type.replace(/_/g, " ")}
        </span>
        <button
          onClick={onRemove}
          className="rounded p-1 text-[hsl(var(--admin-text-muted))] hover:text-red-600"
          aria-label="Remove section"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <button
          onClick={onToggle}
          className="rounded p-1 text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))]"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>
      {expanded && (
        <div className="border-t border-[hsl(var(--admin-border))] p-4">
          <SectionEditor section={section} onChange={onChange} />
        </div>
      )}
    </div>
  );
}

export default function PageEditor({ page }: { page: PageFullDb }) {
  const [tab, setTab] = useState<"meta" | "sections">("meta");
  const [title, setTitle] = useState(page.title);
  const [metaTitle, setMetaTitle] = useState(page.meta_title);
  const [metaDescription, setMetaDescription] = useState(page.meta_description);
  const [ogImageUrl, setOgImageUrl] = useState(page.og_image_url);
  const [published, setPublished] = useState(page.published);
  const [sections, setSections] = useState<Array<PageSectionInput & { id: string }>>(
    page.sections.map((s) => ({ id: s.id, type: s.type, content: s.content }))
  );
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = sections.findIndex((s) => s.id === active.id);
    const newIdx = sections.findIndex((s) => s.id === over.id);
    setSections(arrayMove(sections, oldIdx, newIdx));
  };

  const addSection = (type: SectionType) => {
    const id = crypto.randomUUID();
    setSections((prev) => [...prev, { id, type, content: {} }]);
    setExpanded(id);
  };

  const handleSave = () => {
    startTransition(async () => {
      await updatePage(page.id, {
        title,
        slug: page.slug,
        meta_title: metaTitle,
        meta_description: metaDescription,
        og_image_url: ogImageUrl,
        published,
        sections: sections.map(({ type, content }) => ({ type, content })),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const inputCls =
    "w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] px-3 py-2 text-sm text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]";

  return (
    <div>
      <div className="sticky top-0 z-10 mb-6 flex items-center gap-4 border-b border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] pb-4 pt-1">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] px-3 py-2 text-base font-semibold text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]"
          placeholder="Page title"
        />
        <button
          onClick={handleSave}
          disabled={isPending}
          className="rounded-md bg-[hsl(var(--admin-accent))] px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isPending ? "Saving\u2026" : saved ? "Saved \u2713" : "Save"}
        </button>
      </div>

      <div className="mb-6 flex gap-1">
        {(["meta", "sections"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? "bg-[hsl(var(--admin-accent))] text-white"
                : "text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-hover))]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "meta" && (
        <div className="max-w-xl space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">Slug (read-only)</label>
            <input type="text" readOnly value={page.slug} className={`${inputCls} opacity-60`} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">Meta Title</label>
            <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">Meta Description</label>
            <textarea rows={3} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">OG Image URL</label>
            <input type="url" value={ogImageUrl} onChange={(e) => setOgImageUrl(e.target.value)} className={inputCls} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 rounded border-[hsl(var(--admin-border))] accent-[hsl(var(--admin-accent))]"
            />
            <span className="text-sm text-[hsl(var(--admin-text))]">Published</span>
          </label>
        </div>
      )}

      {tab === "sections" && (
        <div className="space-y-4">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-3">
                {sections.map((section) => (
                  <SortableSection
                    key={section.id}
                    section={section}
                    expanded={expanded === section.id}
                    onToggle={() => setExpanded(expanded === section.id ? null : section.id)}
                    onChange={(updated) =>
                      setSections((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
                    }
                    onRemove={() =>
                      setSections((prev) => prev.filter((s) => s.id !== section.id))
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="flex flex-wrap gap-2 pt-2">
            {SECTION_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => addSection(type)}
                className="rounded-md border border-dashed border-[hsl(var(--admin-border))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--admin-text-muted))] hover:border-[hsl(var(--admin-accent))] hover:text-[hsl(var(--admin-accent))] transition-colors"
              >
                + {type.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
