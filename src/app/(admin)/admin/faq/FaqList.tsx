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
import { Textarea } from "@/components/ui/textarea";
import {
  createFaqItem,
  updateFaqItem,
  deleteFaqItem,
  reorderFaqItems,
  type FaqItem,
  type FaqItemInput,
} from "./actions";

function SortableRow({
  item,
  onEdit,
  onDelete,
}: {
  item: FaqItem;
  onEdit: (item: FaqItem) => void;
  onDelete: (item: FaqItem) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

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
      <p className="flex-1 truncate text-sm text-[hsl(var(--admin-text))]">
        {item.question}
      </p>
      <button
        onClick={() => onEdit(item)}
        className="rounded p-1 text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-bg))] hover:text-[hsl(var(--admin-text))]"
        aria-label="Edit FAQ item"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={() => onDelete(item)}
        className="rounded p-1 text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-bg))] hover:text-red-500"
        aria-label="Delete FAQ item"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function FaqModal({
  item,
  onClose,
  onSaved,
}: {
  item: FaqItem | null;
  onClose: () => void;
  onSaved: (item: FaqItem) => void;
}) {
  const isEdit = item !== null;
  const [question, setQuestion] = useState(item?.question ?? "");
  const [answer, setAnswer] = useState(item?.answer ?? "");
  const [preview, setPreview] = useState(item?.preview ?? "");
  const [deliverables, setDeliverables] = useState(
    (item?.deliverables ?? []).join(", ")
  );
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    if (!question.trim() || !answer.trim()) {
      setError("Question and Answer are required.");
      return;
    }
    setError("");
    const input: FaqItemInput = {
      question: question.trim(),
      answer: answer.trim(),
      preview: preview.trim(),
      deliverables: deliverables
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean),
    };
    startTransition(async () => {
      try {
        const saved = isEdit
          ? await updateFaqItem(item.id, input)
          : await createFaqItem(input);
        onSaved(saved);
        onClose();
      } catch {
        setError("Failed to save. Please try again.");
      }
    });
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit FAQ item" : "Add FAQ item"}</DialogTitle>
          <DialogDescription className="sr-only">
            {isEdit
              ? "Edit the FAQ question and answer."
              : "Add a new FAQ question and answer."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="faq-question">Question *</Label>
            <Input
              id="faq-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What does a typical engagement look like?"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="faq-answer">Answer *</Label>
            <Textarea
              id="faq-answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Most projects begin with a focused discovery sprint…"
              rows={4}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="faq-preview">Preview (short teaser)</Label>
            <Input
              id="faq-preview"
              value={preview}
              onChange={(e) => setPreview(e.target.value)}
              placeholder="A short discovery sprint, then production…"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="faq-deliverables">
              Deliverables (comma-separated)
            </Label>
            <Input
              id="faq-deliverables"
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
              placeholder="Discovery Notes, Roadmap, Weekly Review Rhythm"
            />
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

interface Props {
  initialItems: FaqItem[];
}

export default function FaqList({ initialItems }: Props) {
  const [items, setItems] = useState<FaqItem[]>(initialItems);
  const [editingItem, setEditingItem] = useState<FaqItem | "new" | null>(null);
  const [deletingItem, setDeletingItem] = useState<FaqItem | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    startTransition(() => reorderFaqItems(reordered.map((i) => i.id)));
  }

  function handleSaved(item: FaqItem) {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      return exists
        ? prev.map((i) => (i.id === item.id ? item : i))
        : [...prev, item];
    });
  }

  function confirmDelete(item: FaqItem) {
    setDeleteError("");
    startTransition(async () => {
      try {
        await deleteFaqItem(item.id);
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
        <h1 className="text-2xl font-semibold">FAQ</h1>
        <Button onClick={() => setEditingItem("new")}>+ Add</Button>
      </div>

      {items.length === 0 ? (
        <p className="py-16 text-center text-sm text-[hsl(var(--admin-text-muted))]">
          No FAQ items yet. Click + Add to create the first one.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {items.map((item) => (
                <SortableRow
                  key={item.id}
                  item={item}
                  onEdit={setEditingItem}
                  onDelete={setDeletingItem}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {editingItem !== null && (
        <FaqModal
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
              <AlertDialogTitle>Delete FAQ item?</AlertDialogTitle>
              <AlertDialogDescription>
                This question will be permanently removed. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {deleteError && (
              <p className="px-1 text-sm text-red-600">{deleteError}</p>
            )}
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
