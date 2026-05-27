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
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TagDb } from "@/lib/tags-data";
import {
  createTag,
  updateTag,
  deleteTag,
  reorderTags,
  type TagInput,
} from "./actions";

function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Sortable row ─────────────────────────────────────────────────────────────

function SortableRow({
  tag,
  onEdit,
  onDelete,
}: {
  tag: TagDb;
  onEdit: (tag: TagDb) => void;
  onDelete: (tag: TagDb) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: tag.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="flex items-center gap-3 rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] px-4 py-3"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))]"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-[hsl(var(--admin-text))]">{tag.title_en}</span>
          {tag.title_ar && (
            <span dir="rtl" className="text-sm text-amber-500">{tag.title_ar}</span>
          )}
          <span className="text-[11px] text-[hsl(var(--admin-text-muted))] font-mono bg-[hsl(var(--admin-bg))] px-1.5 py-0.5 rounded">
            {tag.slug}
          </span>
        </div>
      </div>

      <button
        onClick={() => onEdit(tag)}
        className="rounded p-1 text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-bg))] hover:text-[hsl(var(--admin-text))]"
        aria-label="Edit tag"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={() => onDelete(tag)}
        className="rounded p-1 text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-bg))] hover:text-red-500"
        aria-label="Delete tag"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Tag modal ────────────────────────────────────────────────────────────────

function TagModal({
  tag,
  onClose,
  onSaved,
}: {
  tag: TagDb | null;
  onClose: () => void;
  onSaved: (tag: TagDb) => void;
}) {
  const isEdit = tag !== null;
  const [titleEn, setTitleEn] = useState(tag?.title_en ?? "");
  const [titleAr, setTitleAr] = useState(tag?.title_ar ?? "");
  const [slug, setSlug] = useState(tag?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(isEdit);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleTitleEnChange(value: string) {
    setTitleEn(value);
    if (!slugEdited) setSlug(toSlug(value));
  }

  function handleSlugChange(value: string) {
    setSlug(toSlug(value));
    setSlugEdited(true);
  }

  function handleSave() {
    if (!titleEn.trim()) {
      setError("English title is required.");
      return;
    }
    if (!slug.trim()) {
      setError("Slug is required.");
      return;
    }
    setError("");

    const input: TagInput = {
      slug: slug.trim(),
      title_en: titleEn.trim(),
      title_ar: titleAr.trim(),
    };

    startTransition(async () => {
      try {
        const saved = isEdit
          ? await updateTag(tag.id, input)
          : await createTag(input);
        onSaved(saved);
        onClose();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "";
        setError(msg.includes("duplicate") ? "That slug is already in use." : "Failed to save. Please try again.");
      }
    });
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Tag" : "Add Tag"}</DialogTitle>
          <DialogDescription className="sr-only">
            {isEdit ? "Edit the tag." : "Add a new filterable tag."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-4">
          <div className="space-y-1">
            <Label htmlFor="tag-title-en">English Title *</Label>
            <Input
              id="tag-title-en"
              value={titleEn}
              onChange={(e) => handleTitleEnChange(e.target.value)}
              placeholder="Branding"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="tag-title-ar">Arabic Title</Label>
            <Input
              id="tag-title-ar"
              dir="rtl"
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
              placeholder="براندينج"
              className="border-amber-400/40"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="tag-slug">Slug *</Label>
            <Input
              id="tag-slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="branding"
              className="font-mono text-sm"
            />
            <p className="text-xs text-[hsl(var(--admin-text-muted))]">
              Used for filtering. Auto-generated from English title.
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main list ────────────────────────────────────────────────────────────────

interface Props {
  initialTags: TagDb[];
}

export default function TagsList({ initialTags }: Props) {
  const [tags, setTags] = useState<TagDb[]>(initialTags);
  const [editingTag, setEditingTag] = useState<TagDb | "new" | null>(null);
  const [deletingTag, setDeletingTag] = useState<TagDb | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, startDeleteTransition] = useTransition();
  const [, startReorderTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = tags.findIndex((t) => t.id === active.id);
    const newIndex = tags.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(tags, oldIndex, newIndex);
    setTags(reordered);
    startReorderTransition(() => reorderTags(reordered.map((t) => t.id)));
  }

  function handleSaved(tag: TagDb) {
    setTags((prev) => {
      const exists = prev.find((t) => t.id === tag.id);
      return exists ? prev.map((t) => (t.id === tag.id ? tag : t)) : [...prev, tag];
    });
  }

  function confirmDelete(tag: TagDb) {
    setDeleteError("");
    startDeleteTransition(async () => {
      try {
        await deleteTag(tag.id);
        setTags((prev) => prev.filter((t) => t.id !== tag.id));
        setDeletingTag(null);
      } catch {
        setDeleteError("Delete failed. Please try again.");
      }
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tags</h1>
          <p className="text-sm text-[hsl(var(--admin-text-muted))] mt-1">
            Used for filtering projects on the frontend. Drag to reorder.
          </p>
        </div>
        <Button onClick={() => setEditingTag("new")}>+ Add Tag</Button>
      </div>

      {tags.length === 0 ? (
        <p className="py-16 text-center text-sm text-[hsl(var(--admin-text-muted))]">
          No tags yet. Click + Add Tag to create the first one.
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={tags.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {tags.map((tag) => (
                <SortableRow
                  key={tag.id}
                  tag={tag}
                  onEdit={setEditingTag}
                  onDelete={setDeletingTag}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {editingTag !== null && (
        <TagModal
          key={editingTag === "new" ? "new" : editingTag.id}
          tag={editingTag === "new" ? null : editingTag}
          onClose={() => setEditingTag(null)}
          onSaved={handleSaved}
        />
      )}

      {deletingTag && (
        <AlertDialog
          open
          onOpenChange={() => {
            setDeletingTag(null);
            setDeleteError("");
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete tag &ldquo;{deletingTag.title_en}&rdquo;?</AlertDialogTitle>
              <AlertDialogDescription>
                This tag will be permanently removed. Projects that use this tag will no longer show it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {deleteError && <p className="px-1 text-sm text-red-600">{deleteError}</p>}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => confirmDelete(deletingTag)} disabled={isDeleting}>
                {isDeleting ? "Deleting…" : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
