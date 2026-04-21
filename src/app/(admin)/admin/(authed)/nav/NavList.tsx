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
import { GripVertical, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
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
import {
  createNavLink,
  updateNavLink,
  deleteNavLink,
  reorderNavLinks,
  type NavLink,
  type NavLinkInput,
} from "./actions";

// ─── Sortable row ─────────────────────────────────────────────────────────────

function SortableRow({
  item,
  onEdit,
  onDelete,
  onToggle,
}: {
  item: NavLink;
  onEdit: (item: NavLink) => void;
  onDelete: (item: NavLink) => void;
  onToggle: (item: NavLink) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className={`flex items-center gap-3 rounded-lg border bg-[hsl(var(--admin-surface))] px-4 py-3 ${
        item.enabled
          ? "border-[hsl(var(--admin-border))]"
          : "border-dashed border-[hsl(var(--admin-border))] opacity-60"
      }`}
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
        <p className="truncate text-sm font-medium text-[hsl(var(--admin-text))]">
          {item.label_en}
          <span className="ms-2 text-xs text-[hsl(var(--admin-text-muted))]">{item.href}</span>
        </p>
        {item.label_ar && (
          <p dir="rtl" className="truncate text-xs text-amber-500 mt-0.5">
            {item.label_ar}
          </p>
        )}
      </div>

      {/* Toggle enabled */}
      <button
        onClick={() => onToggle(item)}
        className="rounded p-1 text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-bg))] hover:text-[hsl(var(--admin-text))]"
        aria-label={item.enabled ? "Hide link" : "Show link"}
        title={item.enabled ? "Visible — click to hide" : "Hidden — click to show"}
      >
        {item.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </button>

      <button
        onClick={() => onEdit(item)}
        className="rounded p-1 text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-bg))] hover:text-[hsl(var(--admin-text))]"
        aria-label="Edit nav link"
      >
        <Pencil className="h-4 w-4" />
      </button>

      <button
        onClick={() => onDelete(item)}
        className="rounded p-1 text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-bg))] hover:text-red-500"
        aria-label="Delete nav link"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Edit / Add modal ─────────────────────────────────────────────────────────

function NavModal({
  item,
  onClose,
  onSaved,
}: {
  item: NavLink | null;
  onClose: () => void;
  onSaved: (item: NavLink) => void;
}) {
  const isEdit = item !== null;
  const [labelEn, setLabelEn] = useState(item?.label_en ?? "");
  const [labelAr, setLabelAr] = useState(item?.label_ar ?? "");
  const [href, setHref] = useState(item?.href ?? "/");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    if (!labelEn.trim()) {
      setError("English label is required.");
      return;
    }
    if (!href.trim()) {
      setError("URL / path is required.");
      return;
    }
    setError("");

    const input: NavLinkInput = {
      label_en: labelEn.trim(),
      label_ar: labelAr.trim(),
      href: href.trim(),
    };

    startTransition(async () => {
      try {
        const saved = isEdit
          ? await updateNavLink(item.id, input)
          : await createNavLink(input);
        onSaved(saved);
        onClose();
      } catch {
        setError("Failed to save. Please try again.");
      }
    });
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit nav link" : "Add nav link"}</DialogTitle>
          <DialogDescription className="sr-only">
            {isEdit ? "Edit navigation link details." : "Add a new navigation link."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-4">
          <div className="space-y-1">
            <Label htmlFor="nav-label-en">Label (English) *</Label>
            <Input
              id="nav-label-en"
              value={labelEn}
              onChange={(e) => setLabelEn(e.target.value)}
              placeholder="Work"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="nav-label-ar">Label (Arabic)</Label>
            <Input
              id="nav-label-ar"
              dir="rtl"
              value={labelAr}
              onChange={(e) => setLabelAr(e.target.value)}
              placeholder="أعمالنا"
              className="border-amber-400/40"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="nav-href">URL / Path *</Label>
            <Input
              id="nav-href"
              value={href}
              onChange={(e) => setHref(e.target.value)}
              placeholder="/work"
            />
            <p className="text-xs text-[hsl(var(--admin-text-muted))]">
              Use a path like <code>/work</code> for internal pages, or a full URL for external links.
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
  initialItems: NavLink[];
}

export default function NavList({ initialItems }: Props) {
  const [items, setItems] = useState<NavLink[]>(initialItems);
  const [editingItem, setEditingItem] = useState<NavLink | "new" | null>(null);
  const [deletingItem, setDeletingItem] = useState<NavLink | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, startDeleteTransition] = useTransition();
  const [, startReorderTransition] = useTransition();
  const [, startToggleTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    startReorderTransition(() => reorderNavLinks(reordered.map((i) => i.id)));
  }

  function handleSaved(item: NavLink) {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      return exists ? prev.map((i) => (i.id === item.id ? item : i)) : [...prev, item];
    });
  }

  function handleToggle(item: NavLink) {
    const updated = { ...item, enabled: !item.enabled };
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    startToggleTransition(() => updateNavLink(item.id, { enabled: !item.enabled }));
  }

  function confirmDelete(item: NavLink) {
    setDeleteError("");
    startDeleteTransition(async () => {
      try {
        await deleteNavLink(item.id);
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        setDeletingItem(null);
      } catch {
        setDeleteError("Delete failed. Please try again.");
      }
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Navigation</h1>
          <p className="mt-1 text-sm text-[hsl(var(--admin-text-muted))]">
            Drag to reorder · toggle the eye to show/hide · edit labels and paths.
          </p>
        </div>
        <Button onClick={() => setEditingItem("new")}>+ Add link</Button>
      </div>

      {items.length === 0 ? (
        <p className="py-16 text-center text-sm text-[hsl(var(--admin-text-muted))]">
          No nav links yet. Click + Add link to create the first one.
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item) => (
                <SortableRow
                  key={item.id}
                  item={item}
                  onEdit={setEditingItem}
                  onDelete={setDeletingItem}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {editingItem !== null && (
        <NavModal
          key={editingItem === "new" ? "new" : editingItem.id}
          item={editingItem === "new" ? null : editingItem}
          onClose={() => setEditingItem(null)}
          onSaved={handleSaved}
        />
      )}

      {deletingItem && (
        <AlertDialog
          open
          onOpenChange={() => {
            setDeletingItem(null);
            setDeleteError("");
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete &ldquo;{deletingItem.label_en}&rdquo;?</AlertDialogTitle>
              <AlertDialogDescription>
                This link will be permanently removed from the navigation menu.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {deleteError && <p className="px-1 text-sm text-red-600">{deleteError}</p>}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => confirmDelete(deletingItem)}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
