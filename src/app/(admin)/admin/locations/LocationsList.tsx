"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus, GripVertical, Loader2, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createLocation,
  updateLocation,
  deleteLocation,
  reorderLocations,
  type Location,
  type LocationInput,
} from "./actions";

interface Props {
  initialLocations: Location[];
}

const EMPTY_INPUT: LocationInput = {
  name: "",
  country: "",
  address_lines: [""],
  email: "",
  map_url: "",
};

function LocationForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: LocationInput;
  onSave: (input: LocationInput) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<LocationInput>(initial);

  function setField<K extends keyof LocationInput>(key: K, value: LocationInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setAddressLine(index: number, value: string) {
    const lines = [...form.address_lines];
    lines[index] = value;
    setField("address_lines", lines);
  }

  function addAddressLine() {
    setField("address_lines", [...form.address_lines, ""]);
  }

  function removeAddressLine(index: number) {
    setField(
      "address_lines",
      form.address_lines.filter((_, i) => i !== index)
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned: LocationInput = {
      ...form,
      address_lines: form.address_lines.filter((l) => l.trim() !== ""),
    };
    await onSave(cleaned);
  }

  const inputCls =
    "w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-[hsl(var(--admin-accent))]";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-[hsl(var(--admin-text-muted))]">Name *</span>
          <input
            required
            className={inputCls}
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            placeholder="e.g. Copenhagen"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-[hsl(var(--admin-text-muted))]">Country *</span>
          <input
            required
            className={inputCls}
            value={form.country}
            onChange={(e) => setField("country", e.target.value)}
            placeholder="e.g. Denmark"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-[hsl(var(--admin-text-muted))]">Email</span>
          <input
            type="email"
            className={inputCls}
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            placeholder="office@example.com"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-[hsl(var(--admin-text-muted))]">Map URL</span>
          <input
            type="url"
            className={inputCls}
            value={form.map_url}
            onChange={(e) => setField("map_url", e.target.value)}
            placeholder="https://maps.google.com/..."
          />
        </label>
      </div>

      {/* Address lines */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-[hsl(var(--admin-text-muted))]">Address lines</span>
        {form.address_lines.map((line, i) => (
          <div key={i} className="flex gap-2">
            <input
              className={cn(inputCls, "flex-1")}
              value={line}
              onChange={(e) => setAddressLine(i, e.target.value)}
              placeholder={`Line ${i + 1}`}
            />
            {form.address_lines.length > 1 && (
              <button
                type="button"
                onClick={() => removeAddressLine(i)}
                className="rounded p-1 text-[hsl(var(--admin-text-muted))] hover:text-red-500"
                aria-label="Remove line"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addAddressLine}
          className="mt-1 self-start text-xs text-[hsl(var(--admin-accent))] hover:underline"
        >
          + Add line
        </button>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1.5 rounded-md bg-[hsl(var(--admin-accent))] px-4 py-1.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-md px-4 py-1.5 text-sm font-medium text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function LocationsList({ initialLocations }: Props) {
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  async function handleCreate(input: LocationInput) {
    setSaving(true);
    try {
      const created = await createLocation(input);
      setLocations((prev) => [...prev, created]);
      setShowCreate(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to create location.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id: string, input: LocationInput) {
    setSaving(true);
    try {
      const updated = await updateLocation(id, input);
      setLocations((prev) => prev.map((l) => (l.id === id ? updated : l)));
      setEditingId(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to update location.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteLocation(id);
      setLocations((prev) => prev.filter((l) => l.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete location.");
    }
  }

  // Drag-to-reorder helpers
  function handleDragStart(id: string) {
    setDraggingId(id);
  }

  function handleDragEnter(id: string) {
    if (id !== draggingId) setDragOverId(id);
  }

  async function handleDrop(targetId: string) {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      setDragOverId(null);
      return;
    }
    const reordered = [...locations];
    const fromIdx = reordered.findIndex((l) => l.id === draggingId);
    const toIdx = reordered.findIndex((l) => l.id === targetId);
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    setLocations(reordered);
    setDraggingId(null);
    setDragOverId(null);
    try {
      await reorderLocations(reordered.map((l) => l.id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to reorder locations.");
    }
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Locations</h1>
        {!showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-md bg-[hsl(var(--admin-accent))] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add location
          </button>
        )}
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="mb-6 rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] p-4">
          <h2 className="mb-4 text-sm font-semibold">New location</h2>
          <LocationForm
            initial={EMPTY_INPUT}
            onSave={handleCreate}
            onCancel={() => setShowCreate(false)}
            saving={saving}
          />
        </div>
      )}

      {/* Locations list */}
      {locations.length === 0 ? (
        <p className="py-16 text-center text-sm text-[hsl(var(--admin-text-muted))]">
          No locations yet. Add one to get started.
        </p>
      ) : (
        <ul className="space-y-3">
          {locations.map((loc) => (
            <li
              key={loc.id}
              draggable
              onDragStart={() => handleDragStart(loc.id)}
              onDragEnter={() => handleDragEnter(loc.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(loc.id)}
              onDragEnd={() => {
                setDraggingId(null);
                setDragOverId(null);
              }}
              className={cn(
                "rounded-lg border bg-[hsl(var(--admin-surface))] transition-colors",
                draggingId === loc.id
                  ? "opacity-40"
                  : dragOverId === loc.id
                  ? "border-[hsl(var(--admin-accent))]"
                  : "border-[hsl(var(--admin-border))]"
              )}
            >
              {editingId === loc.id ? (
                <div className="p-4">
                  <h2 className="mb-4 text-sm font-semibold">Edit location</h2>
                  <LocationForm
                    initial={{
                      name: loc.name,
                      country: loc.country,
                      address_lines: loc.address_lines.length > 0 ? loc.address_lines : [""],
                      email: loc.email,
                      map_url: loc.map_url,
                    }}
                    onSave={(input) => handleUpdate(loc.id, input)}
                    onCancel={() => setEditingId(null)}
                    saving={saving}
                  />
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4">
                  {/* Drag handle */}
                  <GripVertical className="mt-0.5 h-4 w-4 shrink-0 cursor-grab text-[hsl(var(--admin-text-muted))]" />

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="font-medium">{loc.name}</span>
                      <span className="text-sm text-[hsl(var(--admin-text-muted))]">{loc.country}</span>
                    </div>
                    {loc.address_lines.length > 0 && (
                      <p className="mt-0.5 text-sm text-[hsl(var(--admin-text-muted))]">
                        {loc.address_lines.join(", ")}
                      </p>
                    )}
                    {loc.email && (
                      <p className="mt-0.5 text-xs text-[hsl(var(--admin-text-muted))]">{loc.email}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => setEditingId(loc.id)}
                      className="rounded p-1.5 text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-bg))] hover:text-[hsl(var(--admin-text))]"
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(loc.id, loc.name)}
                      className="rounded p-1.5 text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-bg))] hover:text-red-500"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
