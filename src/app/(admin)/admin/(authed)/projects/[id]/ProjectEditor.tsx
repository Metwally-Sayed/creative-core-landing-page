"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { GripVertical, Pencil, Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ImageField from "@/components/admin/ImageField";
import { updateProject } from "../actions";
import type {
  ProjectFullDb,
  ProjectSummaryDb,
  ProjectFullInput,
  ProjectSectionDb,
  ProjectGalleryDb,
  ProjectFactDb,
} from "@/lib/project-data";

// ─── Editor item types ────────────────────────────────────────────────────────

interface EditorSection extends ProjectSectionDb { _id: string }
interface EditorGallery extends ProjectGalleryDb { _id: string }
interface EditorFact extends ProjectFactDb { _id: string }

function factId(): string {
  return typeof crypto !== "undefined" ? crypto.randomUUID() : String(Math.random());
}

function toSlug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

// ─── Layout helpers ───────────────────────────────────────────────────────────

function Section({ title, children, ar }: { title: string; children: React.ReactNode; ar?: boolean }) {
  return (
    <div className={`rounded-lg border bg-[hsl(var(--admin-surface))] p-6 space-y-4 ${ar ? "border-amber-400/40 bg-amber-50/5" : "border-[hsl(var(--admin-border))]"}`}>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--admin-text-muted))] flex items-center gap-2">
        {title}
        {ar && <span className="text-xs font-normal text-amber-500 normal-case tracking-normal">العربية</span>}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
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

// ─── Language tabs ────────────────────────────────────────────────────────────

function LangTabs({ lang, onChange }: { lang: "en" | "ar"; onChange: (l: "en" | "ar") => void }) {
  return (
    <div className="flex gap-1 rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] p-1 w-fit">
      {(["en", "ar"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
            lang === l
              ? "bg-[hsl(var(--admin-surface))] text-[hsl(var(--admin-text))] shadow-sm"
              : "text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))]"
          }`}
        >
          {l === "en" ? "English" : "العربية"}
        </button>
      ))}
    </div>
  );
}

// ─── Generic sortable row ─────────────────────────────────────────────────────

function SortableChildRow({ id, label, onEdit, onDelete }: {
  id: string; label: string; onEdit: () => void; onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="flex items-center gap-3 rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-3 py-2"
    >
      <button {...attributes} {...listeners} className="cursor-grab touch-none text-[hsl(var(--admin-text-muted))]" aria-label="Drag to reorder">
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex-1 truncate text-sm text-[hsl(var(--admin-text))]">{label}</span>
      <button onClick={onEdit} className="rounded p-1 hover:bg-[hsl(var(--admin-surface))] text-[hsl(var(--admin-text-muted))]" aria-label="Edit">
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button onClick={onDelete} className="rounded p-1 hover:bg-[hsl(var(--admin-surface))] text-[hsl(var(--admin-text-muted))] hover:text-red-500" aria-label="Delete">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Fact editor (label + value + AR translations) ────────────────────────────

function FactListEditor({ items, onChange }: { items: EditorFact[]; onChange: (items: EditorFact[]) => void }) {
  const [editingItem, setEditingItem] = useState<EditorFact | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editValue, setEditValue] = useState("");
  const [editArLabel, setEditArLabel] = useState("");
  const [editArValue, setEditArValue] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldI = items.findIndex((i) => i._id === active.id);
    const newI = items.findIndex((i) => i._id === over.id);
    onChange(arrayMove(items, oldI, newI));
  }

  function openAdd() {
    setEditLabel(""); setEditValue(""); setEditArLabel(""); setEditArValue("");
    setEditingItem({ _id: factId(), id: "", project_id: "", label: "", value: "", sort_order: 0, translations: {} });
  }

  function openEdit(item: EditorFact) {
    setEditLabel(item.label);
    setEditValue(item.value);
    setEditArLabel(item.translations?.ar?.label ?? "");
    setEditArValue(item.translations?.ar?.value ?? "");
    setEditingItem(item);
  }

  function handleSave() {
    if (!editingItem) return;
    const updated: EditorFact = {
      ...editingItem,
      label: editLabel.trim(),
      value: editValue.trim(),
      translations: {
        ...editingItem.translations,
        ar: {
          label: editArLabel.trim() || undefined,
          value: editArValue.trim() || undefined,
        },
      },
    };
    if (items.find((i) => i._id === editingItem._id)) {
      onChange(items.map((i) => (i._id === editingItem._id ? updated : i)));
    } else {
      onChange([...items, updated]);
    }
    setEditingItem(null);
  }

  return (
    <div className="space-y-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i._id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableChildRow
              key={item._id} id={item._id}
              label={`${item.label}: ${item.value}`}
              onEdit={() => openEdit(item)}
              onDelete={() => onChange(items.filter((i) => i._id !== item._id))}
            />
          ))}
        </SortableContext>
      </DndContext>
      <Button type="button" variant="outline" size="sm" onClick={openAdd}>
        <Plus className="h-3.5 w-3.5 mr-1" /> Add row
      </Button>

      {editingItem && (
        <Dialog open onOpenChange={() => setEditingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{items.find((i) => i._id === editingItem._id) ? "Edit" : "Add"} row</DialogTitle>
              <DialogDescription className="sr-only">Edit label and value</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <Field label="Label">
                <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} placeholder="Client" />
              </Field>
              <Field label="Value">
                <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} placeholder="Google" />
              </Field>
              <ArDivider />
              <Field label="Label (AR)">
                <Input dir="rtl" value={editArLabel} onChange={(e) => setEditArLabel(e.target.value)} placeholder="العميل" />
              </Field>
              <Field label="Value (AR)">
                <Input dir="rtl" value={editArValue} onChange={(e) => setEditArValue(e.target.value)} placeholder="جوجل" />
              </Field>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── Gallery editor ───────────────────────────────────────────────────────────

function GalleryEditor({ items, onChange }: { items: EditorGallery[]; onChange: (items: EditorGallery[]) => void }) {
  const [editingItem, setEditingItem] = useState<EditorGallery | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editAlt, setEditAlt] = useState("");
  const [editLabel, setEditLabel] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldI = items.findIndex((i) => i._id === active.id);
    const newI = items.findIndex((i) => i._id === over.id);
    onChange(arrayMove(items, oldI, newI));
  }

  function openAdd() {
    const blank: EditorGallery = { _id: factId(), id: "", project_id: "", image_url: "", image_alt: "", image_label: "", sort_order: 0 };
    setEditUrl(""); setEditAlt(""); setEditLabel("");
    setEditingItem(blank);
  }

  function openEdit(item: EditorGallery) {
    setEditUrl(item.image_url); setEditAlt(item.image_alt); setEditLabel(item.image_label);
    setEditingItem(item);
  }

  function handleSave() {
    if (!editingItem) return;
    const updated = { ...editingItem, image_url: editUrl, image_alt: editAlt, image_label: editLabel };
    if (items.find((i) => i._id === editingItem._id)) {
      onChange(items.map((i) => (i._id === editingItem._id ? updated : i)));
    } else {
      onChange([...items, updated]);
    }
    setEditingItem(null);
  }

  return (
    <div className="space-y-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i._id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableChildRow
              key={item._id} id={item._id}
              label={item.image_label || item.image_alt || item.image_url || "(no label)"}
              onEdit={() => openEdit(item)}
              onDelete={() => onChange(items.filter((i) => i._id !== item._id))}
            />
          ))}
        </SortableContext>
      </DndContext>
      <Button type="button" variant="outline" size="sm" onClick={openAdd}>
        <Plus className="h-3.5 w-3.5 mr-1" /> Add image
      </Button>

      {editingItem && (
        <Dialog open onOpenChange={() => setEditingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{items.find((i) => i._id === editingItem._id) ? "Edit" : "Add"} gallery image</DialogTitle>
              <DialogDescription className="sr-only">Edit gallery image fields</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <Field label="Image">
                <ImageField value={editUrl} onChange={setEditUrl} label="Gallery" />
              </Field>
              <Field label="Alt text">
                <Input value={editAlt} onChange={(e) => setEditAlt(e.target.value)} />
              </Field>
              <Field label="Label">
                <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} placeholder="Frame 01" />
              </Field>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── Section editor (with AR fields in dialog) ───────────────────────────────

function SectionListEditor({ items, onChange }: { items: EditorSection[]; onChange: (items: EditorSection[]) => void }) {
  const [editingItem, setEditingItem] = useState<EditorSection | null>(null);
  const [form, setForm] = useState<Omit<EditorSection, "_id" | "id" | "project_id" | "sort_order" | "translations">>({
    eyebrow: "", title: "", body: [], image_url: "", image_alt: "", image_layout: "right", tone: "light",
  });
  const [bodyRaw, setBodyRaw] = useState("");
  const [arEyebrow, setArEyebrow] = useState("");
  const [arTitle, setArTitle] = useState("");
  const [arBodyRaw, setArBodyRaw] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldI = items.findIndex((i) => i._id === active.id);
    const newI = items.findIndex((i) => i._id === over.id);
    onChange(arrayMove(items, oldI, newI));
  }

  function openAdd() {
    const blank: EditorSection = { _id: factId(), id: "", project_id: "", eyebrow: "", title: "", body: [], image_url: "", image_alt: "", image_layout: "right", tone: "light", sort_order: 0, translations: {} };
    setForm({ eyebrow: "", title: "", body: [], image_url: "", image_alt: "", image_layout: "right", tone: "light" });
    setBodyRaw(""); setArEyebrow(""); setArTitle(""); setArBodyRaw("");
    setEditingItem(blank);
  }

  function openEdit(item: EditorSection) {
    setForm({ eyebrow: item.eyebrow, title: item.title, body: item.body, image_url: item.image_url, image_alt: item.image_alt, image_layout: item.image_layout, tone: item.tone });
    setBodyRaw(item.body.join("\n\n"));
    setArEyebrow(item.translations?.ar?.eyebrow ?? "");
    setArTitle(item.translations?.ar?.title ?? "");
    setArBodyRaw((item.translations?.ar?.body ?? []).join("\n\n"));
    setEditingItem(item);
  }

  function handleSave() {
    if (!editingItem) return;
    const updated: EditorSection = {
      ...editingItem,
      ...form,
      body: bodyRaw.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
      translations: {
        ...editingItem.translations,
        ar: {
          eyebrow: arEyebrow.trim() || undefined,
          title: arTitle.trim() || undefined,
          body: arBodyRaw.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean).length > 0
            ? arBodyRaw.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
            : undefined,
        },
      },
    };
    if (items.find((i) => i._id === editingItem._id)) {
      onChange(items.map((i) => (i._id === editingItem._id ? updated : i)));
    } else {
      onChange([...items, updated]);
    }
    setEditingItem(null);
  }

  return (
    <div className="space-y-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i._id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableChildRow
              key={item._id} id={item._id}
              label={`${item.eyebrow ? item.eyebrow + " — " : ""}${item.title || "(untitled)"}`}
              onEdit={() => openEdit(item)}
              onDelete={() => onChange(items.filter((i) => i._id !== item._id))}
            />
          ))}
        </SortableContext>
      </DndContext>
      <Button type="button" variant="outline" size="sm" onClick={openAdd}>
        <Plus className="h-3.5 w-3.5 mr-1" /> Add section
      </Button>

      {editingItem && (
        <Dialog open onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{items.find((i) => i._id === editingItem._id) ? "Edit" : "Add"} story section</DialogTitle>
              <DialogDescription className="sr-only">Edit section fields</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <Field label="Eyebrow">
                <Input value={form.eyebrow} onChange={(e) => setForm((f) => ({ ...f, eyebrow: e.target.value }))} placeholder="Challenge" />
              </Field>
              <Field label="Title">
                <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              </Field>
              <Field label="Body (blank line = new paragraph)">
                <Textarea value={bodyRaw} onChange={(e) => setBodyRaw(e.target.value)} rows={4} />
              </Field>
              <Field label="Image">
                <ImageField value={form.image_url} onChange={(url) => setForm((f) => ({ ...f, image_url: url }))} label="Section" />
              </Field>
              <Field label="Image Alt">
                <Input value={form.image_alt} onChange={(e) => setForm((f) => ({ ...f, image_alt: e.target.value }))} />
              </Field>
              <Field label="Image Layout">
                <select value={form.image_layout} onChange={(e) => setForm((f) => ({ ...f, image_layout: e.target.value as "left" | "right" }))}
                  className="w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] px-3 py-2 text-sm">
                  <option value="right">Right</option>
                  <option value="left">Left</option>
                </select>
              </Field>
              <Field label="Tone">
                <select value={form.tone} onChange={(e) => setForm((f) => ({ ...f, tone: e.target.value as "light" | "navy" }))}
                  className="w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] px-3 py-2 text-sm">
                  <option value="light">Light</option>
                  <option value="navy">Navy</option>
                </select>
              </Field>
              <ArDivider />
              <Field label="Eyebrow (AR)">
                <Input dir="rtl" value={arEyebrow} onChange={(e) => setArEyebrow(e.target.value)} placeholder="التحدي" />
              </Field>
              <Field label="Title (AR)">
                <Input dir="rtl" value={arTitle} onChange={(e) => setArTitle(e.target.value)} />
              </Field>
              <Field label="Body (AR — blank line = new paragraph)">
                <Textarea dir="rtl" value={arBodyRaw} onChange={(e) => setArBodyRaw(e.target.value)} rows={4} />
              </Field>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── Related Projects panel ───────────────────────────────────────────────────

function RelatedPanel({ currentId, allProjects, selectedIds, onChange }: {
  currentId: string; allProjects: ProjectSummaryDb[]; selectedIds: string[]; onChange: (ids: string[]) => void;
}) {
  const candidates = allProjects.filter((p) => p.id !== currentId);

  function toggle(id: string) {
    if (selectedIds.includes(id)) onChange(selectedIds.filter((i) => i !== id));
    else if (selectedIds.length < 3) onChange([...selectedIds, id]);
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-[hsl(var(--admin-text-muted))]">Select up to 3 related projects.</p>
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {candidates.map((p) => {
          const checked = selectedIds.includes(p.id);
          const disabled = !checked && selectedIds.length >= 3;
          return (
            <label key={p.id} className={`flex items-center gap-3 rounded px-3 py-2 cursor-pointer ${disabled ? "opacity-40" : "hover:bg-[hsl(var(--admin-bg))]"}`}>
              <input type="checkbox" checked={checked} disabled={disabled} onChange={() => toggle(p.id)} className="h-4 w-4" />
              <span className="text-sm text-[hsl(var(--admin-text))]">{p.title}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main editor ──────────────────────────────────────────────────────────────

interface Props {
  project: ProjectFullDb;
  allProjects: ProjectSummaryDb[];
}

export default function ProjectEditor({ project, allProjects }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState("");
  const [lang, setLang] = useState<"en" | "ar">("en");

  // ── English state ──────────────────────────────────────────────────────────
  const [title, setTitle] = useState(project.title);
  const [slug, setSlug] = useState(project.slug);
  const [tagsRaw, setTagsRaw] = useState(project.tags.join(", "));
  const [aspectRatio, setAspectRatio] = useState(project.aspect_ratio);
  const [coverImageUrl, setCoverImageUrl] = useState(project.cover_image_url);
  const [published, setPublished] = useState(project.published);

  const [heroLabel, setHeroLabel] = useState(project.hero_label);
  const [heroTitle, setHeroTitle] = useState(project.hero_title);
  const [heroSubtitle, setHeroSubtitle] = useState(project.hero_subtitle);
  const [heroSummary, setHeroSummary] = useState(project.hero_summary);
  const [heroImageUrl, setHeroImageUrl] = useState(project.hero_image_url);

  const [client, setClient] = useState(project.client);
  const [projectType, setProjectType] = useState(project.project_type);
  const [deliverables, setDeliverables] = useState(project.deliverables);
  const [launchLabel, setLaunchLabel] = useState(project.launch_label);
  const [launchUrl, setLaunchUrl] = useState(project.launch_url);

  const [introRaw, setIntroRaw] = useState(project.intro.join("\n\n"));

  const [showcaseImageUrl, setShowcaseImageUrl] = useState(project.showcase_image_url);
  const [showcaseAlt, setShowcaseAlt] = useState(project.showcase_alt);
  const [showcaseLabel, setShowcaseLabel] = useState(project.showcase_label);

  const [featureEyebrow, setFeatureEyebrow] = useState(project.feature_eyebrow);
  const [featureTitle, setFeatureTitle] = useState(project.feature_title);
  const [featureBody, setFeatureBody] = useState(project.feature_body);

  const [sections, setSections] = useState<EditorSection[]>(project.sections.map((s) => ({ ...s, _id: s.id || factId() })));
  const [gallery, setGallery] = useState<EditorGallery[]>(project.gallery.map((g) => ({ ...g, _id: g.id || factId() })));
  const [metrics, setMetrics] = useState<EditorFact[]>(project.metrics.map((m) => ({ ...m, _id: m.id || factId() })));
  const [credits, setCredits] = useState<EditorFact[]>(project.credits.map((c) => ({ ...c, _id: c.id || factId() })));
  const [overviewFacts, setOverviewFacts] = useState<EditorFact[]>(project.overview.map((o) => ({ ...o, _id: o.id || factId() })));
  const [relatedIds, setRelatedIds] = useState(project.related_ids);

  // ── Arabic translation state ───────────────────────────────────────────────
  const projectAr = project.translations?.ar ?? {};
  const [arTitle, setArTitle] = useState(projectAr.title ?? "");
  const [arHeroLabel, setArHeroLabel] = useState(projectAr.hero_label ?? "");
  const [arHeroTitle, setArHeroTitle] = useState(projectAr.hero_title ?? "");
  const [arHeroSubtitle, setArHeroSubtitle] = useState(projectAr.hero_subtitle ?? "");
  const [arHeroSummary, setArHeroSummary] = useState(projectAr.hero_summary ?? "");
  const [arClient, setArClient] = useState(projectAr.client ?? "");
  const [arProjectType, setArProjectType] = useState(projectAr.project_type ?? "");
  const [arDeliverables, setArDeliverables] = useState(projectAr.deliverables ?? "");
  const [arLaunchLabel, setArLaunchLabel] = useState(projectAr.launch_label ?? "");
  const [arIntroRaw, setArIntroRaw] = useState((projectAr.intro ?? []).join("\n\n"));
  const [arFeatureEyebrow, setArFeatureEyebrow] = useState(projectAr.feature_eyebrow ?? "");
  const [arFeatureTitle, setArFeatureTitle] = useState(projectAr.feature_title ?? "");
  const [arFeatureBody, setArFeatureBody] = useState(projectAr.feature_body ?? "");

  // ── Save ───────────────────────────────────────────────────────────────────
  function handleSave() {
    if (!title.trim()) { setSaveError("Title is required."); return; }
    setSaveError("");

    const input: ProjectFullInput = {
      title: title.trim(), slug: slug.trim(),
      tags: tagsRaw.split(",").map((t) => t.trim()).filter(Boolean),
      aspect_ratio: aspectRatio, cover_image_url: coverImageUrl, published,
      hero_label: heroLabel, hero_title: heroTitle, hero_subtitle: heroSubtitle,
      hero_summary: heroSummary, hero_image_url: heroImageUrl,
      client, project_type: projectType, deliverables,
      launch_label: launchLabel, launch_url: launchUrl,
      intro: introRaw.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
      showcase_image_url: showcaseImageUrl, showcase_alt: showcaseAlt, showcase_label: showcaseLabel,
      feature_eyebrow: featureEyebrow, feature_title: featureTitle, feature_body: featureBody,
      sections: sections.map(({ eyebrow, title: st, body, image_url, image_alt, image_layout, tone, translations }) => ({
        eyebrow, title: st, body, image_url, image_alt, image_layout, tone, translations,
      })),
      gallery: gallery.map(({ image_url, image_alt, image_label }) => ({ image_url, image_alt, image_label })),
      metrics: metrics.map(({ label, value, translations }) => ({ label, value, translations })),
      credits: credits.map(({ label, value, translations }) => ({ label, value, translations })),
      overview: overviewFacts.map(({ label, value, translations }) => ({ label, value, translations })),
      process: [],
      related_ids: relatedIds,
      translations: {
        ar: {
          title: arTitle.trim() || undefined,
          hero_label: arHeroLabel.trim() || undefined,
          hero_title: arHeroTitle.trim() || undefined,
          hero_subtitle: arHeroSubtitle.trim() || undefined,
          hero_summary: arHeroSummary.trim() || undefined,
          client: arClient.trim() || undefined,
          project_type: arProjectType.trim() || undefined,
          deliverables: arDeliverables.trim() || undefined,
          launch_label: arLaunchLabel.trim() || undefined,
          intro: arIntroRaw.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean).length > 0
            ? arIntroRaw.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
            : undefined,
          feature_eyebrow: arFeatureEyebrow.trim() || undefined,
          feature_title: arFeatureTitle.trim() || undefined,
          feature_body: arFeatureBody.trim() || undefined,
          sections: sections.map((s) => ({
            eyebrow: s.translations?.ar?.eyebrow,
            title: s.translations?.ar?.title,
            body: s.translations?.ar?.body,
          })),
          metrics: metrics.map((m) => ({
            label: m.translations?.ar?.label,
            value: m.translations?.ar?.value,
          })),
          credits: credits.map((c) => ({
            label: c.translations?.ar?.label,
            value: c.translations?.ar?.value,
          })),
          overview: overviewFacts.map((o) => ({
            label: o.translations?.ar?.label,
            value: o.translations?.ar?.value,
          })),
        },
      },
    };

    startTransition(async () => {
      try {
        await updateProject(project.id, input);
        router.refresh();
      } catch (e) {
        setSaveError(e instanceof Error ? e.message : "Save failed.");
      }
    });
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-8 py-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/projects" className="text-sm text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))]">
            ← Projects
          </Link>
          <h1 className="text-lg font-semibold text-[hsl(var(--admin-text))] truncate max-w-sm">
            {title || "Untitled"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {saveError && <p className="text-sm text-red-600">{saveError}</p>}
          <Button onClick={handleSave} disabled={isPending || !title.trim()}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6 max-w-3xl">
        {/* Language tabs */}
        <LangTabs lang={lang} onChange={setLang} />

        {/* ═══════════════ ENGLISH ═══════════════ */}
        {lang === "en" && (
          <>
            <Section title="Basic Info">
              <Field label="Title *">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </Field>
              <Field label="Slug *">
                <Input value={slug} onChange={(e) => setSlug(toSlug(e.target.value))} />
                <p className="text-xs text-[hsl(var(--admin-text-muted))]">/projects/{slug || "…"}</p>
              </Field>
              <Field label="Tags (comma-separated)">
                <Input value={tagsRaw} onChange={(e) => setTagsRaw(e.target.value)} placeholder="Experiences, Branding" />
              </Field>
              <Field label="Aspect Ratio">
                <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as typeof aspectRatio)}
                  className="w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] px-3 py-2 text-sm">
                  <option value="landscape">Landscape</option>
                  <option value="portrait">Portrait</option>
                  <option value="square">Square</option>
                </select>
              </Field>
              <Field label="Cover Image">
                <ImageField value={coverImageUrl} onChange={setCoverImageUrl} label="Cover" />
              </Field>
              <div className="flex items-center gap-3">
                <input id="published" type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4" />
                <Label htmlFor="published">Published (visible on public site)</Label>
              </div>
            </Section>

            <Section title="Hero">
              <Field label="Label (eyebrow)">
                <Input value={heroLabel} onChange={(e) => setHeroLabel(e.target.value)} placeholder="Case Study" />
              </Field>
              <Field label="Hero Title">
                <Input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
              </Field>
              <Field label="Hero Subtitle">
                <Input value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} />
              </Field>
              <Field label="Hero Summary">
                <Textarea value={heroSummary} onChange={(e) => setHeroSummary(e.target.value)} rows={3} />
              </Field>
              <Field label="Hero Image">
                <ImageField value={heroImageUrl} onChange={setHeroImageUrl} label="Hero" />
              </Field>
            </Section>

            <Section title="Overview Bar">
              <Field label="Client">
                <Input value={client} onChange={(e) => setClient(e.target.value)} />
              </Field>
              <Field label="Project Type">
                <Input value={projectType} onChange={(e) => setProjectType(e.target.value)} />
              </Field>
              <Field label="Deliverables">
                <Input value={deliverables} onChange={(e) => setDeliverables(e.target.value)} />
              </Field>
              <Field label="Launch Label">
                <Input value={launchLabel} onChange={(e) => setLaunchLabel(e.target.value)} placeholder="Launch project" />
              </Field>
              <Field label="Launch URL">
                <Input value={launchUrl} onChange={(e) => setLaunchUrl(e.target.value)} placeholder="https://…" />
              </Field>
            </Section>

            <Section title="Intro Paragraphs">
              <p className="text-xs text-[hsl(var(--admin-text-muted))]">Separate paragraphs with a blank line.</p>
              <Textarea value={introRaw} onChange={(e) => setIntroRaw(e.target.value)} rows={8} placeholder={"First paragraph.\n\nSecond paragraph."} />
            </Section>

            <Section title="Overview Facts">
              <FactListEditor items={overviewFacts} onChange={setOverviewFacts} />
            </Section>

            <Section title="Primary Showcase">
              <Field label="Image">
                <ImageField value={showcaseImageUrl} onChange={setShowcaseImageUrl} label="Showcase" />
              </Field>
              <Field label="Alt Text">
                <Input value={showcaseAlt} onChange={(e) => setShowcaseAlt(e.target.value)} />
              </Field>
              <Field label="Label">
                <Input value={showcaseLabel} onChange={(e) => setShowcaseLabel(e.target.value)} placeholder="Primary showcase" />
              </Field>
            </Section>

            <Section title="Feature Block">
              <Field label="Eyebrow">
                <Input value={featureEyebrow} onChange={(e) => setFeatureEyebrow(e.target.value)} placeholder="Experience frame" />
              </Field>
              <Field label="Title">
                <Input value={featureTitle} onChange={(e) => setFeatureTitle(e.target.value)} />
              </Field>
              <Field label="Body">
                <Textarea value={featureBody} onChange={(e) => setFeatureBody(e.target.value)} rows={3} />
              </Field>
            </Section>

            <Section title="Story Sections">
              <SectionListEditor items={sections} onChange={setSections} />
            </Section>

            <Section title="Gallery">
              <GalleryEditor items={gallery} onChange={setGallery} />
            </Section>

            <Section title="Impact Metrics">
              <FactListEditor items={metrics} onChange={setMetrics} />
            </Section>

            <Section title="Credits">
              <FactListEditor items={credits} onChange={setCredits} />
            </Section>

            <Section title="Related Projects">
              <RelatedPanel currentId={project.id} allProjects={allProjects} selectedIds={relatedIds} onChange={setRelatedIds} />
            </Section>
          </>
        )}

        {/* ═══════════════ ARABIC ═══════════════ */}
        {lang === "ar" && (
          <>
            <p className="text-sm text-[hsl(var(--admin-text-muted))]">
              Fill in Arabic translations for all text fields. Images, URLs, and structural fields are shared across languages.
              For story sections, overview facts, metrics, and credits — open each row&apos;s edit dialog to set Arabic content.
            </p>

            <Section title="Basic Info" ar>
              <Field label="Title (AR)">
                <Input dir="rtl" value={arTitle} onChange={(e) => setArTitle(e.target.value)} placeholder="عنوان المشروع" />
              </Field>
            </Section>

            <Section title="Hero" ar>
              <Field label="Label / Eyebrow (AR)">
                <Input dir="rtl" value={arHeroLabel} onChange={(e) => setArHeroLabel(e.target.value)} placeholder="دراسة حالة" />
              </Field>
              <Field label="Hero Title (AR)">
                <Input dir="rtl" value={arHeroTitle} onChange={(e) => setArHeroTitle(e.target.value)} />
              </Field>
              <Field label="Hero Subtitle (AR)">
                <Input dir="rtl" value={arHeroSubtitle} onChange={(e) => setArHeroSubtitle(e.target.value)} />
              </Field>
              <Field label="Hero Summary (AR)">
                <Textarea dir="rtl" value={arHeroSummary} onChange={(e) => setArHeroSummary(e.target.value)} rows={3} />
              </Field>
            </Section>

            <Section title="Overview Bar" ar>
              <Field label="Client (AR)">
                <Input dir="rtl" value={arClient} onChange={(e) => setArClient(e.target.value)} />
              </Field>
              <Field label="Project Type (AR)">
                <Input dir="rtl" value={arProjectType} onChange={(e) => setArProjectType(e.target.value)} />
              </Field>
              <Field label="Deliverables (AR)">
                <Input dir="rtl" value={arDeliverables} onChange={(e) => setArDeliverables(e.target.value)} />
              </Field>
              <Field label="Launch Label (AR)">
                <Input dir="rtl" value={arLaunchLabel} onChange={(e) => setArLaunchLabel(e.target.value)} placeholder="إطلاق المشروع" />
              </Field>
            </Section>

            <Section title="Intro Paragraphs" ar>
              <p className="text-xs text-[hsl(var(--admin-text-muted))]">Separate paragraphs with a blank line.</p>
              <Textarea dir="rtl" value={arIntroRaw} onChange={(e) => setArIntroRaw(e.target.value)} rows={8} placeholder={"الفقرة الأولى.\n\nالفقرة الثانية."} />
            </Section>

            <Section title="Overview Facts" ar>
              <p className="text-xs text-[hsl(var(--admin-text-muted))]">Switch to English tab → open each row to edit Arabic content.</p>
              {overviewFacts.length > 0 ? (
                <div className="space-y-1">
                  {overviewFacts.map((f) => (
                    <div key={f._id} className="flex items-center justify-between rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-3 py-2 text-sm">
                      <span className="text-[hsl(var(--admin-text-muted))]">{f.label}: {f.value}</span>
                      <span dir="rtl" className="text-[hsl(var(--admin-text))]">
                        {f.translations?.ar?.label || f.translations?.ar?.value
                          ? `${f.translations.ar.label ?? ""}: ${f.translations.ar.value ?? ""}`
                          : <span className="text-amber-500 text-xs">No AR</span>}
                      </span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-[hsl(var(--admin-text-muted))]">No facts added yet.</p>}
            </Section>

            <Section title="Feature Block" ar>
              <Field label="Eyebrow (AR)">
                <Input dir="rtl" value={arFeatureEyebrow} onChange={(e) => setArFeatureEyebrow(e.target.value)} />
              </Field>
              <Field label="Title (AR)">
                <Input dir="rtl" value={arFeatureTitle} onChange={(e) => setArFeatureTitle(e.target.value)} />
              </Field>
              <Field label="Body (AR)">
                <Textarea dir="rtl" value={arFeatureBody} onChange={(e) => setArFeatureBody(e.target.value)} rows={3} />
              </Field>
            </Section>

            <Section title="Story Sections" ar>
              <p className="text-xs text-[hsl(var(--admin-text-muted))]">Switch to English tab → open each section to edit Arabic content.</p>
              {sections.length > 0 ? (
                <div className="space-y-1">
                  {sections.map((s) => (
                    <div key={s._id} className="flex items-center justify-between rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-3 py-2 text-sm">
                      <span className="text-[hsl(var(--admin-text-muted))] truncate max-w-[40%]">{s.eyebrow ? `${s.eyebrow} — ` : ""}{s.title || "(untitled)"}</span>
                      <span dir="rtl" className="truncate max-w-[40%] text-[hsl(var(--admin-text))]">
                        {s.translations?.ar?.title
                          ? s.translations.ar.title
                          : <span className="text-amber-500 text-xs">No AR</span>}
                      </span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-[hsl(var(--admin-text-muted))]">No sections added yet.</p>}
            </Section>

            <Section title="Impact Metrics" ar>
              <p className="text-xs text-[hsl(var(--admin-text-muted))]">Switch to English tab → open each metric to edit Arabic content.</p>
              {metrics.length > 0 ? (
                <div className="space-y-1">
                  {metrics.map((m) => (
                    <div key={m._id} className="flex items-center justify-between rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-3 py-2 text-sm">
                      <span className="text-[hsl(var(--admin-text-muted))]">{m.label}: {m.value}</span>
                      <span dir="rtl" className="text-[hsl(var(--admin-text))]">
                        {m.translations?.ar?.label
                          ? `${m.translations.ar.label}: ${m.translations.ar.value ?? ""}`
                          : <span className="text-amber-500 text-xs">No AR</span>}
                      </span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-[hsl(var(--admin-text-muted))]">No metrics added yet.</p>}
            </Section>

            <Section title="Credits" ar>
              <p className="text-xs text-[hsl(var(--admin-text-muted))]">Switch to English tab → open each credit to edit Arabic content.</p>
              {credits.length > 0 ? (
                <div className="space-y-1">
                  {credits.map((c) => (
                    <div key={c._id} className="flex items-center justify-between rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] px-3 py-2 text-sm">
                      <span className="text-[hsl(var(--admin-text-muted))]">{c.label}: {c.value}</span>
                      <span dir="rtl" className="text-[hsl(var(--admin-text))]">
                        {c.translations?.ar?.label
                          ? `${c.translations.ar.label}: ${c.translations.ar.value ?? ""}`
                          : <span className="text-amber-500 text-xs">No AR</span>}
                      </span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-[hsl(var(--admin-text-muted))]">No credits added yet.</p>}
            </Section>
          </>
        )}
      </div>
    </div>
  );
}
