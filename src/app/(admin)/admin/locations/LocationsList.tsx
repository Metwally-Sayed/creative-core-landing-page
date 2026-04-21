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
  createLocation,
  updateLocation,
  deleteLocation,
  reorderLocations,
  type Location,
  type LocationInput,
} from "./actions";

function SortableRow({
  location,
  onEdit,
  onDelete,
}: {
  location: Location;
  onEdit: (location: Location) => void;
  onDelete: (location: Location) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: location.id });

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
      <div className="flex-1">
        <span className="text-sm font-medium text-[hsl(var(--admin-text))]">
          {location.name}
        </span>
        <span className="ml-2 text-sm text-[hsl(var(--admin-text-muted))]">
          · {location.country}
        </span>
      </div>
      <button
        onClick={() => onEdit(location)}
        className="rounded p-1 text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-bg))] hover:text-[hsl(var(--admin-text))]"
        aria-label="Edit location"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={() => onDelete(location)}
        className="rounded p-1 text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-bg))] hover:text-red-500"
        aria-label="Delete location"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function LocationModal({
  location,
  onClose,
  onSaved,
}: {
  location: Location | null;
  onClose: () => void;
  onSaved: (location: Location) => void;
}) {
  const isEdit = location !== null;
  const [name, setName] = useState(location?.name ?? "");
  const [country, setCountry] = useState(location?.country ?? "");
  const [addressLines, setAddressLines] = useState(
    (location?.address_lines ?? []).join("\n")
  );
  const [email, setEmail] = useState(location?.email ?? "");
  const [mapUrl, setMapUrl] = useState(location?.map_url ?? "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    if (!name.trim() || !country.trim()) {
      setError("Name and Country are required.");
      return;
    }
    setError("");
    const input: LocationInput = {
      name: name.trim(),
      country: country.trim(),
      address_lines: addressLines
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
      email: email.trim(),
      map_url: mapUrl.trim(),
    };
    startTransition(async () => {
      try {
        const saved = isEdit
          ? await updateLocation(location.id, input)
          : await createLocation(input);
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
          <DialogTitle>{isEdit ? "Edit location" : "Add location"}</DialogTitle>
          <DialogDescription className="sr-only">
            {isEdit ? "Edit the studio location details." : "Add a new studio location."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="loc-name">Name *</Label>
            <Input
              id="loc-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New York"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="loc-country">Country *</Label>
            <Input
              id="loc-country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="United States"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="loc-address">Address lines (one per line)</Label>
            <Textarea
              id="loc-address"
              value={addressLines}
              onChange={(e) => setAddressLines(e.target.value)}
              placeholder={"36 East 20th St, 6th Floor\nNew York, NY 10003\nTel: +1 917 818-4282"}
              rows={3}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="loc-email">Email</Label>
            <Input
              id="loc-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@example.com"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="loc-map">Google Maps URL</Label>
            <Input
              id="loc-map"
              value={mapUrl}
              onChange={(e) => setMapUrl(e.target.value)}
              placeholder="https://www.google.com/maps/..."
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
  initialLocations: Location[];
}

export default function LocationsList({ initialLocations }: Props) {
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [editingLocation, setEditingLocation] = useState<Location | "new" | null>(null);
  const [deletingLocation, setDeletingLocation] = useState<Location | null>(null);
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
    const oldIndex = locations.findIndex((l) => l.id === active.id);
    const newIndex = locations.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(locations, oldIndex, newIndex);
    setLocations(reordered);
    startTransition(() => reorderLocations(reordered.map((l) => l.id)));
  }

  function handleSaved(location: Location) {
    setLocations((prev) => {
      const exists = prev.find((l) => l.id === location.id);
      return exists
        ? prev.map((l) => (l.id === location.id ? location : l))
        : [...prev, location];
    });
  }

  function confirmDelete(location: Location) {
    setDeleteError("");
    startTransition(async () => {
      try {
        await deleteLocation(location.id);
        setLocations((prev) => prev.filter((l) => l.id !== location.id));
        setDeletingLocation(null);
      } catch {
        setDeleteError("Delete failed. Please try again.");
      }
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Locations</h1>
        <Button onClick={() => setEditingLocation("new")}>+ Add</Button>
      </div>

      {locations.length === 0 ? (
        <p className="py-16 text-center text-sm text-[hsl(var(--admin-text-muted))]">
          No locations yet. Click + Add to create the first one.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={locations.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {locations.map((location) => (
                <SortableRow
                  key={location.id}
                  location={location}
                  onEdit={setEditingLocation}
                  onDelete={setDeletingLocation}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {editingLocation !== null && (
        <LocationModal
          key={editingLocation === "new" ? "new" : editingLocation.id}
          location={editingLocation === "new" ? null : editingLocation}
          onClose={() => setEditingLocation(null)}
          onSaved={handleSaved}
        />
      )}

      {deletingLocation && (
        <AlertDialog open onOpenChange={() => { setDeletingLocation(null); setDeleteError(""); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete location?</AlertDialogTitle>
              <AlertDialogDescription>
                "{deletingLocation.name}" will be permanently removed. This
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {deleteError && <p className="px-1 text-sm text-red-600">{deleteError}</p>}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => confirmDelete(deletingLocation)} disabled={isDeleting}>
                {isDeleting ? "Deleting…" : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
