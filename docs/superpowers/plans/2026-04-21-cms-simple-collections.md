# CMS Simple Collections (Locations & FAQ) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the Locations and FAQ collections from static TypeScript files to Supabase Postgres, add admin CRUD pages with drag-to-reorder, and update the public frontend to read from the database with 60-second revalidation.

**Architecture:** Two Postgres tables (`locations`, `faq_items`) with `sort_order` columns; server actions with `auth()` guard for all mutations; `unstable_cache` with tag-based invalidation for the public frontend; `@dnd-kit/sortable` for drag-to-reorder in the admin. The public `[lang]/layout.tsx` (server component) fetches locations and passes them to `Footer`; `[lang]/page.tsx` (server component) fetches FAQ items and passes them to `FaqQuoteSection`.

**Tech Stack:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, Next.js server actions, `next/cache` `unstable_cache` + `revalidateTag`, `@supabase/supabase-js` v2 (already installed), existing `shadcn/ui` primitives (Dialog, AlertDialog, Button, Input, Label, Textarea).

**Spec:** `docs/superpowers/specs/2026-04-21-cms-simple-collections-design.md`

---

## File map

| Action | Path | Responsibility |
|--------|------|----------------|
| Install | `package.json` | Add `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` |
| Create | `supabase/migrations/20260421000001_create_collections.sql` | Both DB tables + RLS |
| Create | `scripts/seed-collections.ts` | One-time seed of static data into DB |
| Create | `src/lib/locations-data.ts` | Cached public fetch for locations |
| Create | `src/lib/faq-data.ts` | Cached public fetch for FAQ items |
| Modify | `src/components/admin/admin-nav-items.ts` | Add Locations + FAQ nav entries |
| Create | `src/app/(admin)/admin/locations/actions.ts` | CRUD + reorder server actions |
| Create | `src/app/(admin)/admin/locations/page.tsx` | Server component shell |
| Create | `src/app/(admin)/admin/locations/LocationsList.tsx` | Client: DnD list + modals |
| Create | `src/app/(admin)/admin/faq/actions.ts` | CRUD + reorder server actions |
| Create | `src/app/(admin)/admin/faq/page.tsx` | Server component shell |
| Create | `src/app/(admin)/admin/faq/FaqList.tsx` | Client: DnD list + modals |
| Modify | `src/components/sections/Footer.tsx` | Accept `locations` prop instead of static import |
| Modify | `src/app/[lang]/layout.tsx` | Fetch locations, pass to `<Footer>` |
| Modify | `src/components/sections/FaqQuoteSection.tsx` | Accept `faqItems` prop instead of hardcoded const |
| Modify | `src/app/[lang]/page.tsx` | Fetch FAQ items, pass to `<FaqQuoteSection>` |

---

## Task 1: Install @dnd-kit packages

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the three @dnd-kit packages**

```bash
cd "/Users/metwally/Desktop/Kimi_Agent_Clone Hello Monday Site 2/nextjs-app"
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

Expected: packages install without errors. `package.json` now lists all three in `dependencies`.

- [ ] **Step 2: Verify TypeScript is happy**

```bash
npx tsc --noEmit
```

Expected: only the two pre-existing errors in `next.config.ts` and `[lang]/projects/page.tsx`. No new errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install @dnd-kit packages for drag-to-reorder"
```

---

## Task 2: SQL migration — create `locations` and `faq_items` tables

**Files:**
- Create: `supabase/migrations/20260421000001_create_collections.sql`

- [ ] **Step 1: Create the migration file**

Create `supabase/migrations/20260421000001_create_collections.sql` with this exact content:

```sql
-- locations table
CREATE TABLE IF NOT EXISTS locations (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  country     text        NOT NULL,
  address_lines text[]    NOT NULL DEFAULT '{}',
  email       text        NOT NULL DEFAULT '',
  map_url     text        NOT NULL DEFAULT '',
  sort_order  int4        NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deny anon locations"          ON locations FOR ALL TO anon          USING (false);
CREATE POLICY "deny authenticated locations" ON locations FOR ALL TO authenticated USING (false);

-- faq_items table
CREATE TABLE IF NOT EXISTS faq_items (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  question     text        NOT NULL,
  answer       text        NOT NULL,
  preview      text        NOT NULL DEFAULT '',
  deliverables text[]      NOT NULL DEFAULT '{}',
  sort_order   int4        NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deny anon faq"          ON faq_items FOR ALL TO anon          USING (false);
CREATE POLICY "deny authenticated faq" ON faq_items FOR ALL TO authenticated USING (false);
```

- [ ] **Step 2: Install `pg` temporarily and run the migration**

```bash
npm install --save-dev pg @types/pg
```

Create a temporary file `scripts/_run-migration-collections.ts`:

```ts
import { Client } from "pg";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const sql = fs.readFileSync(
    path.join(process.cwd(), "supabase/migrations/20260421000001_create_collections.sql"),
    "utf8"
  );
  await client.query(sql);
  await client.end();
  console.log("Migration complete.");
}

main().catch((e) => { console.error(e); process.exit(1); });
```

Run it:

```bash
npx tsx scripts/_run-migration-collections.ts
```

Expected output: `Migration complete.`

- [ ] **Step 3: Uninstall `pg` and remove the temp script**

```bash
npm uninstall pg @types/pg
rm scripts/_run-migration-collections.ts
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260421000001_create_collections.sql package.json package-lock.json
git commit -m "feat: add SQL migration for locations and faq_items tables"
```

---

## Task 3: Seed static data into the database

**Files:**
- Create: `scripts/seed-collections.ts`

- [ ] **Step 1: Create `scripts/seed-collections.ts`**

```ts
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

async function main() {
  // --- Locations ---
  const { count: locCount } = await supabase
    .from("locations")
    .select("*", { count: "exact", head: true });

  if (locCount && locCount > 0) {
    console.log("locations: already seeded, skipping.");
  } else {
    const { error } = await supabase.from("locations").insert([
      {
        name: "New York",
        country: "United States",
        address_lines: [
          "36 East 20th St, 6th Floor",
          "New York, NY 10003",
          "Tel: +1 917 818-4282",
        ],
        email: "hello@hellomonday.com",
        map_url:
          "https://www.google.com/maps/place/Hello+Monday/@40.7385487,-73.9908801,17z",
        sort_order: 0,
      },
      {
        name: "Copenhagen",
        country: "Denmark",
        address_lines: [
          "Langebrogade 6E, 2nd floor",
          "1411 Copenhagen",
          "Tel: +45 3145 6035",
        ],
        email: "hello@hellomonday.com",
        map_url:
          "https://www.google.com/maps/place/Hello+Monday/@55.6658995,12.5783361,17z",
        sort_order: 1,
      },
      {
        name: "Aarhus",
        country: "Denmark",
        address_lines: [
          "Banegardspladsen 20A, 1.TV",
          "8000 Aarhus C",
          "Tel: +45 6015 4515",
        ],
        email: "hello@hellomonday.com",
        map_url:
          "https://www.google.com/maps/place/Hello+Monday/@56.1500968,10.2030539,17z",
        sort_order: 2,
      },
      {
        name: "Amsterdam",
        country: "Netherlands",
        address_lines: [
          "Generaal Vetterstraat 66",
          "1059 BW Amsterdam",
          "Netherlands",
        ],
        email: "hello@hellomonday.com",
        map_url:
          "https://www.google.com/maps/place/Generaal+Vetterstraat+66,+1059+BW+Amsterdam,+Netherlands",
        sort_order: 3,
      },
    ]);
    if (error) throw error;
    console.log("locations: seeded 4 rows.");
  }

  // --- FAQ items ---
  const { count: faqCount } = await supabase
    .from("faq_items")
    .select("*", { count: "exact", head: true });

  if (faqCount && faqCount > 0) {
    console.log("faq_items: already seeded, skipping.");
  } else {
    const { error } = await supabase.from("faq_items").insert([
      {
        question: "What does a typical engagement look like?",
        answer:
          "Most projects begin with a focused discovery sprint, then move into strategy, design, and implementation. We align around checkpoints early so the handoff is clear and launch-ready.",
        preview: "A short discovery sprint, then production with clear review cadence.",
        deliverables: ["Discovery Notes", "Roadmap", "Weekly Review Rhythm"],
        sort_order: 0,
      },
      {
        question: "Do you work with product teams as well as brands?",
        answer:
          "Yes. We support product organizations, marketing teams, and brand leads. The shape of the project changes, but the core collaboration model stays the same.",
        preview: "The process adapts to both product organizations and brand teams.",
        deliverables: ["UX Direction", "Launch System"],
        sort_order: 1,
      },
      {
        question: "Can you take on a focused scope instead of a full redesign?",
        answer:
          "Absolutely. We can quote single-scope projects like a launch page, design system work, or a campaign experience while keeping room to expand later.",
        preview: "Focused scopes are fine as long as the output is clearly defined.",
        deliverables: ["Scope Plan", "Execution Milestones"],
        sort_order: 2,
      },
      {
        question: "How do you price projects?",
        answer:
          "We quote by scope and outcomes, not hourly tracking. Once we understand goals, timeline, and deliverables, we can put together a tighter project estimate.",
        preview: "Outcome-based pricing with a clearer estimate after discovery.",
        deliverables: ["Proposal", "Milestone Estimate"],
        sort_order: 3,
      },
      {
        question: "How quickly can a project start?",
        answer:
          "Smaller scopes can usually start quickly. Larger programs may need a short lead-in for discovery, content collection, or technical planning.",
        preview: "Fast-start for focused work, short runway for broader programs.",
        deliverables: ["Availability Window", "Kickoff Plan"],
        sort_order: 4,
      },
    ]);
    if (error) throw error;
    console.log("faq_items: seeded 5 rows.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 2: Run the seed script**

```bash
npx tsx scripts/seed-collections.ts
```

Expected output:
```
locations: seeded 4 rows.
faq_items: seeded 5 rows.
```

- [ ] **Step 3: Commit**

```bash
git add scripts/seed-collections.ts
git commit -m "feat: add seed script for locations and faq_items"
```

---

## Task 4: Server fetch library functions for the public frontend

**Files:**
- Create: `src/lib/locations-data.ts`
- Create: `src/lib/faq-data.ts`

- [ ] **Step 1: Create `src/lib/locations-data.ts`**

```ts
import { unstable_cache } from "next/cache";
import { supabase } from "@/lib/supabase";

export interface Location {
  id: string;
  name: string;
  country: string;
  address_lines: string[];
  email: string;
  map_url: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const getLocations = unstable_cache(
  async (): Promise<Location[]> => {
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data as Location[];
  },
  ["locations"],
  { revalidate: 60, tags: ["locations"] }
);
```

- [ ] **Step 2: Create `src/lib/faq-data.ts`**

```ts
import { unstable_cache } from "next/cache";
import { supabase } from "@/lib/supabase";

export interface FaqItemDb {
  id: string;
  question: string;
  answer: string;
  preview: string;
  deliverables: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const getFaqItems = unstable_cache(
  async (): Promise<FaqItemDb[]> => {
    const { data, error } = await supabase
      .from("faq_items")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data as FaqItemDb[];
  },
  ["faq"],
  { revalidate: 60, tags: ["faq"] }
);
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/locations-data.ts src/lib/faq-data.ts
git commit -m "feat: add cached fetch functions for locations and faq frontend data"
```

---

## Task 5: Add Locations and FAQ to the admin sidebar

**Files:**
- Modify: `src/components/admin/admin-nav-items.ts`

- [ ] **Step 1: Replace the entire file**

The file currently reads:

```ts
import { LayoutDashboard, Image, FolderKanban, FileText, Settings, type LucideIcon } from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Media", href: "/admin/media", icon: Image },
  { label: "Projects", href: "/admin/projects", icon: FolderKanban },
  { label: "Pages", href: "/admin/pages", icon: FileText },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];
```

Replace it with:

```ts
import {
  LayoutDashboard,
  Image,
  MapPin,
  HelpCircle,
  FolderKanban,
  FileText,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Media", href: "/admin/media", icon: Image },
  { label: "Locations", href: "/admin/locations", icon: MapPin },
  { label: "FAQ", href: "/admin/faq", icon: HelpCircle },
  { label: "Projects", href: "/admin/projects", icon: FolderKanban },
  { label: "Pages", href: "/admin/pages", icon: FileText },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/admin-nav-items.ts
git commit -m "feat: add Locations and FAQ to admin sidebar navigation"
```

---

## Task 6: Locations admin page — server actions + page shell + client list

**Files:**
- Create: `src/app/(admin)/admin/locations/actions.ts`
- Create: `src/app/(admin)/admin/locations/page.tsx`
- Create: `src/app/(admin)/admin/locations/LocationsList.tsx`

- [ ] **Step 1: Create `src/app/(admin)/admin/locations/actions.ts`**

```ts
"use server";

import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { revalidateTag } from "next/cache";

export interface Location {
  id: string;
  name: string;
  country: string;
  address_lines: string[];
  email: string;
  map_url: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface LocationInput {
  name: string;
  country: string;
  address_lines: string[];
  email: string;
  map_url: string;
}

export async function listLocations(): Promise<Location[]> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data as Location[];
}

export async function createLocation(input: LocationInput): Promise<Location> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { data: maxRow } = await supabase
    .from("locations")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();
  const sort_order = (maxRow?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("locations")
    .insert({ ...input, sort_order })
    .select()
    .single();
  if (error) throw error;
  revalidateTag("locations");
  return data as Location;
}

export async function updateLocation(
  id: string,
  patch: Partial<LocationInput>
): Promise<Location> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { data, error } = await supabase
    .from("locations")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  revalidateTag("locations");
  return data as Location;
}

export async function deleteLocation(id: string): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { error } = await supabase.from("locations").delete().eq("id", id);
  if (error) throw error;
  revalidateTag("locations");
}

export async function reorderLocations(orderedIds: string[]): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("locations").update({ sort_order: index }).eq("id", id)
    )
  );
  revalidateTag("locations");
}
```

- [ ] **Step 2: Create `src/app/(admin)/admin/locations/page.tsx`**

```tsx
import { listLocations } from "./actions";
import LocationsList from "./LocationsList";

export default async function AdminLocationsPage() {
  const locations = await listLocations();
  return <LocationsList initialLocations={locations} />;
}
```

- [ ] **Step 3: Create `src/app/(admin)/admin/locations/LocationsList.tsx`**

```tsx
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
    location?.address_lines.join("\n") ?? ""
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
  const [, startTransition] = useTransition();

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

  async function confirmDelete(location: Location) {
    try {
      await deleteLocation(location.id);
      setLocations((prev) => prev.filter((l) => l.id !== location.id));
    } catch {
      alert("Delete failed. Please try again.");
    } finally {
      setDeletingLocation(null);
    }
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
        <AlertDialog open onOpenChange={() => setDeletingLocation(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete location?</AlertDialogTitle>
              <AlertDialogDescription>
                "{deletingLocation.name}" will be permanently removed. This
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => confirmDelete(deletingLocation)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/\(admin\)/admin/locations/
git commit -m "feat: add Locations admin page with drag-to-reorder and CRUD"
```

---

## Task 7: FAQ admin page — server actions + page shell + client list

**Files:**
- Create: `src/app/(admin)/admin/faq/actions.ts`
- Create: `src/app/(admin)/admin/faq/page.tsx`
- Create: `src/app/(admin)/admin/faq/FaqList.tsx`

- [ ] **Step 1: Create `src/app/(admin)/admin/faq/actions.ts`**

```ts
"use server";

import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { revalidateTag } from "next/cache";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  preview: string;
  deliverables: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface FaqItemInput {
  question: string;
  answer: string;
  preview: string;
  deliverables: string[];
}

export async function listFaqItems(): Promise<FaqItem[]> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");
  const { data, error } = await supabase
    .from("faq_items")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data as FaqItem[];
}

export async function createFaqItem(input: FaqItemInput): Promise<FaqItem> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { data: maxRow } = await supabase
    .from("faq_items")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();
  const sort_order = (maxRow?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("faq_items")
    .insert({ ...input, sort_order })
    .select()
    .single();
  if (error) throw error;
  revalidateTag("faq");
  return data as FaqItem;
}

export async function updateFaqItem(
  id: string,
  patch: Partial<FaqItemInput>
): Promise<FaqItem> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { data, error } = await supabase
    .from("faq_items")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  revalidateTag("faq");
  return data as FaqItem;
}

export async function deleteFaqItem(id: string): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { error } = await supabase.from("faq_items").delete().eq("id", id);
  if (error) throw error;
  revalidateTag("faq");
}

export async function reorderFaqItems(orderedIds: string[]): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("faq_items").update({ sort_order: index }).eq("id", id)
    )
  );
  revalidateTag("faq");
}
```

- [ ] **Step 2: Create `src/app/(admin)/admin/faq/page.tsx`**

```tsx
import { listFaqItems } from "./actions";
import FaqList from "./FaqList";

export default async function AdminFaqPage() {
  const faqItems = await listFaqItems();
  return <FaqList initialItems={faqItems} />;
}
```

- [ ] **Step 3: Create `src/app/(admin)/admin/faq/FaqList.tsx`**

```tsx
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
    item?.deliverables.join(", ") ?? ""
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
            {isEdit ? "Edit the FAQ question and answer." : "Add a new FAQ question and answer."}
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
  const [, startTransition] = useTransition();

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

  async function confirmDelete(item: FaqItem) {
    try {
      await deleteFaqItem(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch {
      alert("Delete failed. Please try again.");
    } finally {
      setDeletingItem(null);
    }
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
        <AlertDialog open onOpenChange={() => setDeletingItem(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete FAQ item?</AlertDialogTitle>
              <AlertDialogDescription>
                This question will be permanently removed. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => confirmDelete(deletingItem)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/\(admin\)/admin/faq/
git commit -m "feat: add FAQ admin page with drag-to-reorder and CRUD"
```

---

## Task 8: Update public frontend to read from the database

**Files:**
- Modify: `src/components/sections/Footer.tsx`
- Modify: `src/app/[lang]/layout.tsx`
- Modify: `src/components/sections/FaqQuoteSection.tsx`
- Modify: `src/app/[lang]/page.tsx`

### Context

- `Footer.tsx` is a `"use client"` component that currently imports `studioLocations` directly from `@/lib/studio-locations`. It is rendered by `src/app/[lang]/layout.tsx` (a server component) as `<Footer />`.
- `FaqQuoteSection.tsx` is a `"use client"` component with a hardcoded `FAQ_ITEMS` const. It is rendered by `src/app/[lang]/page.tsx` (a server component) as `<FaqQuoteSection />`.

The plan: pass DB-fetched data as props from the server components to the client components.

- [ ] **Step 1: Read `src/components/sections/Footer.tsx` to understand the current props interface**

Open the file. Find the component's `Props` type or function signature. Note the current structure — it likely accepts no props.

Find every reference to `studioLocations` inside the file (used as an array for rendering location cards).

Note the type `StudioLocation` from `@/lib/studio-locations` — you will replace it with `Location` from `@/lib/locations-data`.

- [ ] **Step 2: Update `src/components/sections/Footer.tsx`**

Add a `locations` prop of type `Location[]` (import from `@/lib/locations-data`). Remove the import of `studioLocations` and `StudioLocation` from `@/lib/studio-locations`. Replace every reference to `studioLocations` in the JSX with `props.locations`.

The change is mechanical — wherever the footer maps over `studioLocations`, change it to `locations` (from props). The `StudioLocation` type referenced for typing map callbacks should be replaced with `Location`.

The `address` field in the old static type was `string[]` — in the new DB type `Location`, the equivalent is `address_lines: string[]`. Update any references accordingly (e.g. `location.address` → `location.address_lines`, `location.city` → `location.name`, `location.href` → `location.map_url`).

After editing, the Footer function signature must look like:

```tsx
import type { Location } from "@/lib/locations-data";

interface Props {
  // ... any existing props ...
  locations: Location[];
}

export default function Footer({ locations, /* other props */ }: Props) {
  // ... render using locations ...
}
```

- [ ] **Step 3: Update `src/app/[lang]/layout.tsx` to fetch locations and pass to Footer**

Open `src/app/[lang]/layout.tsx`. It is already an async server component.

Add the import at the top:
```tsx
import { getLocations } from "@/lib/locations-data";
```

Inside the layout function, call:
```tsx
const locations = await getLocations();
```

Find the `<Footer />` render and change it to:
```tsx
<Footer locations={locations} />
```

- [ ] **Step 4: Read `src/components/sections/FaqQuoteSection.tsx` to understand the current structure**

Open the file. Find the hardcoded `FAQ_ITEMS` const (type `FaqItem[]`, declared inside the file). Note the local `FaqItem` type shape: `{ id, question, answer, preview, deliverables }`.

The DB type `FaqItemDb` from `@/lib/faq-data` has the same fields plus `sort_order`, `created_at`, `updated_at`.

- [ ] **Step 5: Update `src/components/sections/FaqQuoteSection.tsx`**

Add a `faqItems` prop. Remove the hardcoded `FAQ_ITEMS` const. Replace all references to `FAQ_ITEMS` with the prop value.

The local `FaqItem` type in the file can be replaced with `FaqItemDb` from `@/lib/faq-data`, or kept as a local type alias if the component only uses a subset of fields. The simplest approach is to import `FaqItemDb` and use it:

```tsx
import type { FaqItemDb } from "@/lib/faq-data";

interface Props {
  faqItems: FaqItemDb[];
}

export default function FaqQuoteSection({ faqItems }: Props) {
  // Replace all FAQ_ITEMS references with faqItems
  // ...
}
```

Anywhere the existing code references `FAQ_ITEMS[0]?.id`, change to `faqItems[0]?.id`. The `id` field in `FaqItemDb` is a UUID string, whereas the old static data used slug strings (`"engagement"`, etc.). Update `useState` initial values accordingly — `useState(faqItems[0]?.id ?? "")` and `useState(faqItems[0]?.id)`.

- [ ] **Step 6: Update `src/app/[lang]/page.tsx` to fetch FAQ items and pass to FaqQuoteSection**

Open `src/app/[lang]/page.tsx`. It is already an async server component.

Add the import:
```tsx
import { getFaqItems } from "@/lib/faq-data";
```

Inside the page function:
```tsx
const faqItems = await getFaqItems();
```

Find the `<FaqQuoteSection />` render and change it to:
```tsx
<FaqQuoteSection faqItems={faqItems} />
```

- [ ] **Step 7: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no new errors. If TypeScript complains about field name mismatches (e.g. `address` vs `address_lines`, `city` vs `name`, `href` vs `map_url`), fix each one in Footer.tsx.

- [ ] **Step 8: Start the dev server and verify the public pages render correctly**

```bash
npm run dev
```

Open `http://localhost:3000` in the browser (or whichever locale path works, e.g. `http://localhost:3000/en`).

Check:
- The footer renders all 4 studio locations with correct city names and addresses
- The FAQ section on the home page renders all 5 FAQ items
- No console errors about missing props or undefined values

Stop the dev server when done.

- [ ] **Step 9: Commit**

```bash
git add src/components/sections/Footer.tsx src/app/\[lang\]/layout.tsx src/components/sections/FaqQuoteSection.tsx src/app/\[lang\]/page.tsx
git commit -m "feat: update Footer and FaqQuoteSection to read locations and FAQ from database"
```

---

## Manual test checklist (run before merging)

1. Unauthenticated GET `/admin/locations` → redirected to `/admin/login`
2. Unauthenticated GET `/admin/faq` → redirected to `/admin/login`
3. Authenticated: `/admin/locations` loads with 4 seeded locations
4. Authenticated: `/admin/faq` loads with 5 seeded FAQ items
5. Add a location → appears at bottom of list
6. Edit a location → changes reflected immediately
7. Delete a location → confirm dialog shown; item removed on confirm
8. Drag a location to reorder → new order persists on page reload
9. Tests 5–8 for `/admin/faq`
10. Save with empty required field → blocked client-side, error shown in modal
11. Public home page footer shows all locations (city + address lines)
12. Public home page FAQ section shows all FAQ items
13. Edit a location in admin → public page reflects update within 60 seconds (or immediately if `revalidateTag` fires)
