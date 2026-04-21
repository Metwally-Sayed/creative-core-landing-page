"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
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
import {
  GripVertical,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
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
import {
  deleteProject,
  reorderProjects,
  togglePublished,
} from "./actions";
import type { ProjectSummaryDb } from "@/lib/project-data";

function SortableRow({
  project,
  onDelete,
  onToggle,
}: {
  project: ProjectSummaryDb;
  onDelete: (p: ProjectSummaryDb) => void;
  onToggle: (p: ProjectSummaryDb) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: project.id });

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

      {project.cover_image_url ? (
        <div className="relative h-10 w-14 flex-shrink-0 overflow-hidden rounded">
          <Image
            src={project.cover_image_url}
            alt={project.title}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="h-10 w-14 flex-shrink-0 rounded bg-[hsl(var(--admin-bg))]" />
      )}

      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-[hsl(var(--admin-text))]">
          {project.title}
        </p>
        <p className="truncate text-xs text-[hsl(var(--admin-text-muted))]">
          {project.tags[0] ?? ""} · /{project.slug}
        </p>
      </div>

      <button
        onClick={() => onToggle(project)}
        className="rounded p-1 text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-bg))] hover:text-[hsl(var(--admin-text))]"
        aria-label={project.published ? "Unpublish" : "Publish"}
        title={project.published ? "Published — click to unpublish" : "Draft — click to publish"}
      >
        {project.published ? (
          <Eye className="h-4 w-4 text-green-500" />
        ) : (
          <EyeOff className="h-4 w-4" />
        )}
      </button>

      <Link
        href={`/admin/projects/${project.id}`}
        className="rounded p-1 text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-bg))] hover:text-[hsl(var(--admin-text))]"
        aria-label="Edit project"
      >
        <Pencil className="h-4 w-4" />
      </Link>

      <button
        onClick={() => onDelete(project)}
        className="rounded p-1 text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-bg))] hover:text-red-500"
        aria-label="Delete project"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function ProjectsList({
  initialProjects,
}: {
  initialProjects: ProjectSummaryDb[];
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [deletingProject, setDeletingProject] = useState<ProjectSummaryDb | null>(null);
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
    const oldIndex = projects.findIndex((p) => p.id === active.id);
    const newIndex = projects.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(projects, oldIndex, newIndex);
    setProjects(reordered);
    startReorderTransition(() => reorderProjects(reordered.map((p) => p.id)));
  }

  function handleToggle(project: ProjectSummaryDb) {
    const next = !project.published;
    setProjects((prev) =>
      prev.map((p) => (p.id === project.id ? { ...p, published: next } : p))
    );
    startToggleTransition(() => togglePublished(project.id, next));
  }

  function confirmDelete(project: ProjectSummaryDb) {
    setDeleteError("");
    startDeleteTransition(async () => {
      try {
        await deleteProject(project.id);
        setProjects((prev) => prev.filter((p) => p.id !== project.id));
        setDeletingProject(null);
      } catch {
        setDeleteError("Delete failed. Please try again.");
      }
    });
  }

  return (
    <div>
      {projects.length === 0 ? (
        <p className="py-16 text-center text-sm text-[hsl(var(--admin-text-muted))]">
          No projects yet. Click + New to create the first one.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={projects.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {projects.map((project) => (
                <SortableRow
                  key={project.id}
                  project={project}
                  onDelete={setDeletingProject}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {deletingProject && (
        <AlertDialog
          open
          onOpenChange={() => {
            setDeletingProject(null);
            setDeleteError("");
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete project?</AlertDialogTitle>
              <AlertDialogDescription>
                &ldquo;{deletingProject.title}&rdquo; will be permanently removed along with all its content. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {deleteError && (
              <p className="px-1 text-sm text-red-600">{deleteError}</p>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => confirmDelete(deletingProject)}
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
