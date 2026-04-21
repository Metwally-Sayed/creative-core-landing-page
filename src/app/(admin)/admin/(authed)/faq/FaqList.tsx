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

// ─── Shared helpers ───────────────────────────────────────────────────────────

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

function ArDivider() {
  return (
    <div className="flex items-center gap-2 pt-1">
      <div className="flex-1 border-t border-amber-400/30" />
      <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">العربية (Arabic)</span>
      <div className="flex-1 border-t border-amber-400/30" />
    </div>
  );
}

// ─── Sortable row ─────────────────────────────────────────────────────────────

function SortableRow({
  item,
  onEdit,
  onDelete,
}: {
  item: FaqItem;
  onEdit: (item: FaqItem) => void;
  onDelete: (item: FaqItem) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

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
        <p className="truncate text-sm text-[hsl(var(--admin-text))]">{item.question}</p>
        {item.translations?.ar?.question && (
          <p dir="rtl" className="truncate text-xs text-amber-500 mt-0.5">{item.translations.ar.question}</p>
        )}
      </div>
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

// ─── Edit / Add modal ─────────────────────────────────────────────────────────

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
  const [lang, setLang] = useState<"en" | "ar">("en");

  // EN fields
  const [question, setQuestion] = useState(item?.question ?? "");
  const [answer, setAnswer] = useState(item?.answer ?? "");
  const [preview, setPreview] = useState(item?.preview ?? "");
  const [deliverables, setDeliverables] = useState((item?.deliverables ?? []).join(", "));

  // AR fields
  const itemAr = item?.translations?.ar ?? {};
  const [arQuestion, setArQuestion] = useState(itemAr.question ?? "");
  const [arAnswer, setArAnswer] = useState(itemAr.answer ?? "");
  const [arPreview, setArPreview] = useState(itemAr.preview ?? "");
  const [arDeliverables, setArDeliverables] = useState((itemAr.deliverables ?? []).join(", "));

  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    if (!question.trim() || !answer.trim()) {
      setError("Question and Answer (English) are required.");
      return;
    }
    setError("");

    const arDeliverablesArr = arDeliverables.split(",").map((d) => d.trim()).filter(Boolean);

    const input: FaqItemInput = {
      question: question.trim(),
      answer: answer.trim(),
      preview: preview.trim(),
      deliverables: deliverables.split(",").map((d) => d.trim()).filter(Boolean),
      translations: {
        ar: {
          question: arQuestion.trim() || undefined,
          answer: arAnswer.trim() || undefined,
          preview: arPreview.trim() || undefined,
          deliverables: arDeliverablesArr.length > 0 ? arDeliverablesArr : undefined,
        },
      },
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit FAQ item" : "Add FAQ item"}</DialogTitle>
          <DialogDescription className="sr-only">
            {isEdit ? "Edit the FAQ question and answer." : "Add a new FAQ question and answer."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-4">
          {/* Language switcher */}
          <LangTabs lang={lang} onChange={setLang} />

          {/* ── English ── */}
          {lang === "en" && (
            <>
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
                <Label htmlFor="faq-deliverables">Deliverables (comma-separated)</Label>
                <Input
                  id="faq-deliverables"
                  value={deliverables}
                  onChange={(e) => setDeliverables(e.target.value)}
                  placeholder="Discovery Notes, Roadmap, Weekly Review Rhythm"
                />
              </div>
            </>
          )}

          {/* ── Arabic ── */}
          {lang === "ar" && (
            <>
              <p className="text-sm text-[hsl(var(--admin-text-muted))]">
                Fill in Arabic translations. English fields are required; Arabic is optional but shown to Arabic-locale visitors.
              </p>
              <ArDivider />
              <div className="space-y-1">
                <Label htmlFor="faq-ar-question">Question (AR)</Label>
                <Input
                  id="faq-ar-question"
                  dir="rtl"
                  value={arQuestion}
                  onChange={(e) => setArQuestion(e.target.value)}
                  placeholder="كيف يبدو التعاون النموذجي؟"
                  className="border-amber-400/40"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="faq-ar-answer">Answer (AR)</Label>
                <Textarea
                  id="faq-ar-answer"
                  dir="rtl"
                  value={arAnswer}
                  onChange={(e) => setArAnswer(e.target.value)}
                  placeholder="تبدأ معظم المشاريع بسباق استكشاف مكثف…"
                  rows={4}
                  className="border-amber-400/40"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="faq-ar-preview">Preview (AR)</Label>
                <Input
                  id="faq-ar-preview"
                  dir="rtl"
                  value={arPreview}
                  onChange={(e) => setArPreview(e.target.value)}
                  placeholder="سباق استكشاف قصير، ثم الإنتاج…"
                  className="border-amber-400/40"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="faq-ar-deliverables">Deliverables (AR, comma-separated)</Label>
                <Input
                  id="faq-ar-deliverables"
                  dir="rtl"
                  value={arDeliverables}
                  onChange={(e) => setArDeliverables(e.target.value)}
                  placeholder="ملاحظات الاستكشاف، خارطة الطريق، إيقاع المراجعة الأسبوعية"
                  className="border-amber-400/40"
                />
              </div>
            </>
          )}

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
  initialItems: FaqItem[];
}

export default function FaqList({ initialItems }: Props) {
  const [items, setItems] = useState<FaqItem[]>(initialItems);
  const [editingItem, setEditingItem] = useState<FaqItem | "new" | null>(null);
  const [deletingItem, setDeletingItem] = useState<FaqItem | null>(null);
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
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    startReorderTransition(() => reorderFaqItems(reordered.map((i) => i.id)));
  }

  function handleSaved(item: FaqItem) {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      return exists ? prev.map((i) => (i.id === item.id ? item : i)) : [...prev, item];
    });
  }

  function confirmDelete(item: FaqItem) {
    setDeleteError("");
    startDeleteTransition(async () => {
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
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
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
            {deleteError && <p className="px-1 text-sm text-red-600">{deleteError}</p>}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => confirmDelete(deletingItem)} disabled={isDeleting}>
                {isDeleting ? "Deleting…" : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
