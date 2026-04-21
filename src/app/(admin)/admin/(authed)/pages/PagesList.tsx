"use client";

import { useState, useTransition } from "react";
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
import { GripVertical, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
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
import { deletePage, reorderPages, togglePublished } from "./actions";
import type { PageSummaryDb } from "@/lib/page-data";

function SortableRow({
  page,
  onDelete,
  onToggle,
}: {
  page: PageSummaryDb;
  onDelete: (p: PageSummaryDb) => void;
  onToggle: (p: PageSummaryDb) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: page.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
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
        <span className="font-medium text-[hsl(var(--admin-text))] truncate block">
          {page.title}
        </span>
        <span className="text-xs text-[hsl(var(--admin-text-muted))]">
          /{page.slug}
        </span>
      </div>

      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
          page.published
            ? "bg-green-100 text-green-700"
            : "bg-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))]"
        }`}
      >
        {page.published ? "Published" : "Draft"}
      </span>

      <button
        onClick={() => onToggle(page)}
        className="rounded p-1.5 text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-hover))] hover:text-[hsl(var(--admin-text))]"
        aria-label={page.published ? "Unpublish" : "Publish"}
      >
        {page.published ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="h-4 w-4" />
        )}
      </button>

      <Link
        href={`/admin/pages/${page.id}`}
        className="rounded p-1.5 text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-hover))] hover:text-[hsl(var(--admin-text))]"
        aria-label="Edit"
      >
        <Pencil className="h-4 w-4" />
      </Link>

      <button
        onClick={() => onDelete(page)}
        className="rounded p-1.5 text-[hsl(var(--admin-text-muted))] hover:bg-red-50 hover:text-red-600"
        aria-label="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function PagesList({
  initialPages,
}: {
  initialPages: PageSummaryDb[];
}) {
  const [pages, setPages] = useState(initialPages);
  const [toDelete, setToDelete] = useState<PageSummaryDb | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = pages.findIndex((p) => p.id === active.id);
    const newIndex = pages.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(pages, oldIndex, newIndex);
    setPages(reordered);
    startTransition(() => {
      reorderPages(reordered.map((p) => p.id));
    });
  };

  const handleToggle = (page: PageSummaryDb) => {
    const updated = pages.map((p) =>
      p.id === page.id ? { ...p, published: !p.published } : p
    );
    setPages(updated);
    startTransition(() => {
      togglePublished(page.id, !page.published);
    });
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setPages((prev) => prev.filter((p) => p.id !== toDelete.id));
    await deletePage(toDelete.id);
    setToDelete(null);
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={pages.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {pages.map((page) => (
              <SortableRow
                key={page.id}
                page={page}
                onDelete={setToDelete}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <AlertDialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete page?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &ldquo;{toDelete?.title}&rdquo; and all its sections. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
