# CMS Media Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full admin media library at `/admin/media` backed by Supabase Storage and Postgres, including drag-and-drop upload, URL import, metadata editing, and a reusable `<AssetPicker>` modal for sub-project #4.

**Architecture:** Hybrid upload strategy — file picker/drag-drop uses signed URLs for direct browser-to-Supabase upload; URL import proxies through a Next.js server action. All mutations are server actions guarded by `auth()`. A `media_assets` Postgres table stores metadata; Supabase Storage holds the files.

**Tech Stack:** `@supabase/supabase-js` v2, Next.js 16 server actions, React 19 `useTransition`, Supabase Storage (public bucket), Supabase Postgres, existing `shadcn/ui` primitives.

**Spec:** `docs/superpowers/specs/2026-04-21-cms-media-center-design.md`

---

## File map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/lib/media-types.ts` | Shared types, MIME map, size limits, helper functions |
| Create | `src/lib/supabase.ts` | Fail-fast server-side Supabase client |
| Create | `supabase/migrations/20260421000000_create_media_assets.sql` | SQL to create `media_assets` table + RLS |
| Create | `scripts/setup-media-bucket.ts` | One-time CLI to create `media` storage bucket |
| Create | `src/app/(admin)/admin/media/actions.ts` | All server actions |
| Modify | `src/app/(admin)/admin/media/page.tsx` | Replace stub with server-rendered shell |
| Create | `src/app/(admin)/admin/media/MediaLibrary.tsx` | Client: grid, filters, search, drag-drop, upload tray |
| Create | `src/app/(admin)/admin/media/UploadZone.tsx` | Client: upload button + hidden file input |
| Create | `src/app/(admin)/admin/media/UrlImportForm.tsx` | Client: URL import dialog |
| Create | `src/app/(admin)/admin/media/AssetCard.tsx` | Single asset card with hover edit/delete |
| Create | `src/app/(admin)/admin/media/AssetEditModal.tsx` | Dialog to edit title, alt_text, tags |
| Create | `src/components/admin/AssetPicker.tsx` | Shared modal returning `SelectedAsset` to caller |
| Modify | `.env.example` | Document three new Supabase env vars |

---

## Task 1: Install `@supabase/supabase-js` + shared types + Supabase client

**Files:**
- Modify: `package.json`
- Create: `src/lib/media-types.ts`
- Create: `src/lib/supabase.ts`

- [ ] **Step 1: Install the Supabase JS client**

```bash
cd "$(git rev-parse --show-toplevel)"
npm install @supabase/supabase-js
```

Expected: package installs without errors. `package.json` now lists `"@supabase/supabase-js"` in `dependencies`.

- [ ] **Step 2: Create `src/lib/media-types.ts`**

```ts
export type FileType = "image" | "video" | "document";

export interface MediaAsset {
  id: string;
  storage_path: string;
  public_url: string;
  file_type: FileType;
  mime_type: string;
  size_bytes: number;
  title: string;
  alt_text: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface MediaAssetPatch {
  title: string;
  alt_text: string | null;
  tags: string[];
}

export const ACCEPTED_MIME_TYPES: Record<string, FileType> = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/svg+xml": "image",
  "image/gif": "image",
  "video/mp4": "video",
  "video/webm": "video",
  "video/quicktime": "video",
  "application/pdf": "document",
};

export const MAX_FILE_SIZES: Record<FileType, number> = {
  image: 20 * 1024 * 1024,
  document: 20 * 1024 * 1024,
  video: 200 * 1024 * 1024,
};

export function mimeTypeToFileType(mime: string): FileType | null {
  return ACCEPTED_MIME_TYPES[mime.split(";")[0].trim()] ?? null;
}

export function fileTypeToFolder(fileType: FileType): string {
  const map: Record<FileType, string> = {
    image: "images",
    video: "videos",
    document: "documents",
  };
  return map[fileType];
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
```

- [ ] **Step 3: Create `src/lib/supabase.ts`**

```ts
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const envSchema = z.object({
  SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
  SUPABASE_STORAGE_BUCKET: z.string().min(1).default("media"),
});

const envParsed = envSchema.safeParse({
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET ?? "media",
});

if (!envParsed.success) {
  const issues = envParsed.error.issues
    .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  throw new Error(`[supabase] Missing/invalid environment variables:\n${issues}`);
}

const env = envParsed.data;

export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export const STORAGE_BUCKET = env.SUPABASE_STORAGE_BUCKET;
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors in `src/lib/media-types.ts` or `src/lib/supabase.ts`. (The supabase client will throw at runtime if env vars are absent — that is correct behaviour.)

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/lib/media-types.ts src/lib/supabase.ts
git commit -m "feat: install supabase-js, add media types and server client"
```

---

## Task 2: Set up Supabase — `media_assets` table + storage bucket

**Files:**
- Create: `supabase/migrations/20260421000000_create_media_assets.sql`
- Create: `scripts/setup-media-bucket.ts`

- [ ] **Step 1: Create the SQL migration file**

```bash
mkdir -p supabase/migrations
```

Create `supabase/migrations/20260421000000_create_media_assets.sql`:

```sql
-- media_assets: stores metadata for every file uploaded to Supabase Storage
CREATE TABLE IF NOT EXISTS media_assets (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path   text        NOT NULL,
  public_url     text        NOT NULL,
  file_type      text        NOT NULL CHECK (file_type IN ('image', 'video', 'document')),
  mime_type      text        NOT NULL,
  size_bytes     int8        NOT NULL,
  title          text        NOT NULL,
  alt_text       text,
  tags           text[]      NOT NULL DEFAULT '{}',
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS automatically; deny all direct client access
CREATE POLICY "deny_anon"          ON media_assets FOR ALL TO anon          USING (false);
CREATE POLICY "deny_authenticated" ON media_assets FOR ALL TO authenticated USING (false);
```

- [ ] **Step 2: Run the SQL in Supabase**

Option A — Supabase dashboard: go to **SQL Editor**, paste the file contents, click **Run**.

Option B — Supabase MCP (if connected in this session): execute the SQL via the MCP `execute_sql` tool.

Verify: the `media_assets` table appears in **Table Editor** with all columns listed above.

- [ ] **Step 3: Create `scripts/setup-media-bucket.ts`**

```ts
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET ?? "media";

  const { error } = await supabase.storage.createBucket(bucketName, {
    public: true,
    fileSizeLimit: 200 * 1024 * 1024,
    allowedMimeTypes: [
      "image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif",
      "video/mp4", "video/webm", "video/quicktime",
      "application/pdf",
    ],
  });

  if (error && !error.message.toLowerCase().includes("already exists")) {
    console.error("Failed to create bucket:", error.message);
    process.exit(1);
  }

  console.log(`✓ Bucket "${bucketName}" ready`);
}

main().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 4: Add env vars to `.env.local` and run the bucket setup script**

Add to `.env.local`:
```
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key-from-supabase-dashboard>
SUPABASE_STORAGE_BUCKET=media
```

Then run:
```bash
npx tsx scripts/setup-media-bucket.ts
```

Expected output:
```
✓ Bucket "media" ready
```

Verify: the `media` bucket appears in **Supabase → Storage**.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260421000000_create_media_assets.sql scripts/setup-media-bucket.ts
git commit -m "feat: add media_assets migration and bucket setup script"
```

---

## Task 3: Server actions — read + signed upload URL + save

**Files:**
- Create: `src/app/(admin)/admin/media/actions.ts`

- [ ] **Step 1: Create `src/app/(admin)/admin/media/actions.ts`** with the read and upload actions

```ts
"use server";

import { auth } from "@/auth";
import { supabase, STORAGE_BUCKET } from "@/lib/supabase";
import {
  mimeTypeToFileType,
  fileTypeToFolder,
  type MediaAsset,
  type MediaAssetPatch,
  MAX_FILE_SIZES,
} from "@/lib/media-types";

export async function listMediaAssets(
  filter?: { fileType?: string }
): Promise<MediaAsset[]> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  let query = supabase
    .from("media_assets")
    .select("*")
    .order("created_at", { ascending: false });

  if (filter?.fileType && filter.fileType !== "all") {
    query = query.eq("file_type", filter.fileType);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to list assets: ${error.message}`);
  return (data ?? []) as MediaAsset[];
}

export async function getSignedUploadUrl(
  filename: string,
  mimeType: string
): Promise<{ signedUrl: string; storagePath: string; publicUrl: string }> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const fileType = mimeTypeToFileType(mimeType);
  if (!fileType) throw new Error(`Unsupported MIME type: ${mimeType}`);

  const ext = filename.includes(".") ? filename.split(".").pop()! : "bin";
  const folder = fileTypeToFolder(fileType);
  const storagePath = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUploadUrl(storagePath);

  if (error || !data) {
    throw new Error(`Failed to create signed URL: ${error?.message ?? "unknown error"}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);

  return { signedUrl: data.signedUrl, storagePath, publicUrl };
}

export interface SaveMediaAssetInput {
  storage_path: string;
  public_url: string;
  mime_type: string;
  size_bytes: number;
  title: string;
}

export async function saveMediaAsset(
  input: SaveMediaAssetInput
): Promise<MediaAsset> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const fileType = mimeTypeToFileType(input.mime_type);
  if (!fileType) throw new Error(`Unsupported MIME type: ${input.mime_type}`);

  const { data, error } = await supabase
    .from("media_assets")
    .insert({
      storage_path: input.storage_path,
      public_url: input.public_url,
      file_type: fileType,
      mime_type: input.mime_type,
      size_bytes: input.size_bytes,
      title: input.title,
      alt_text: null,
      tags: [],
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to save asset: ${error.message}`);
  return data as MediaAsset;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Smoke-test `listMediaAssets` manually**

Start the dev server (`npm run dev`), navigate to `/admin/media` (stub page still active). No crash = the supabase client initialises correctly with your env vars.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(admin\)/admin/media/actions.ts
git commit -m "feat: add media server actions — list, signed upload URL, save"
```

---

## Task 4: Server actions — URL import, update, delete

**Files:**
- Modify: `src/app/(admin)/admin/media/actions.ts` (append to the file)

- [ ] **Step 1: Append `importFromUrl`, `updateMediaAsset`, and `deleteMediaAsset` to `actions.ts`**

Open `src/app/(admin)/admin/media/actions.ts` and append the following after `saveMediaAsset`:

```ts
export async function importFromUrl(url: string): Promise<MediaAsset> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  // HEAD first to validate MIME type and size before downloading
  let headRes: Response;
  try {
    headRes = await fetch(url, { method: "HEAD" });
  } catch {
    throw new Error("Could not reach the URL. Check that it is publicly accessible.");
  }

  const mimeType = (headRes.headers.get("content-type") ?? "").split(";")[0].trim();
  const fileType = mimeTypeToFileType(mimeType);
  if (!fileType) {
    throw new Error(
      `Unsupported file type: ${mimeType || "unknown"}. Accepted: images (JPEG/PNG/WebP/SVG/GIF), videos (MP4/WebM/MOV), PDFs.`
    );
  }

  const contentLength = parseInt(headRes.headers.get("content-length") ?? "0", 10);
  const maxSize = MAX_FILE_SIZES[fileType];
  if (contentLength > 0 && contentLength > maxSize) {
    throw new Error(
      `File is too large (${(contentLength / 1024 / 1024).toFixed(1)} MB). Max for ${fileType}: ${maxSize / 1024 / 1024} MB.`
    );
  }

  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (buffer.length > maxSize) {
    throw new Error(
      `File is too large (${(buffer.length / 1024 / 1024).toFixed(1)} MB). Max for ${fileType}: ${maxSize / 1024 / 1024} MB.`
    );
  }

  const urlObj = new URL(url);
  const rawFilename = urlObj.pathname.split("/").pop() ?? "import";
  const filename = decodeURIComponent(rawFilename);
  const ext = filename.includes(".") ? filename.split(".").pop()! : "bin";
  const folder = fileTypeToFolder(fileType);
  const storagePath = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, buffer, { contentType: mimeType });

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);

  return saveMediaAsset({
    storage_path: storagePath,
    public_url: publicUrl,
    mime_type: mimeType,
    size_bytes: buffer.length,
    title: filename,
  });
}

export async function updateMediaAsset(
  id: string,
  patch: Partial<MediaAssetPatch>
): Promise<MediaAsset> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { data, error } = await supabase
    .from("media_assets")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update asset: ${error.message}`);
  return data as MediaAsset;
}

export async function deleteMediaAsset(id: string): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { data: asset, error: fetchError } = await supabase
    .from("media_assets")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (fetchError) throw new Error(`Asset not found: ${fetchError.message}`);

  const { error: storageError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([asset.storage_path]);

  if (storageError) throw new Error(`Storage deletion failed: ${storageError.message}`);

  const { error: dbError } = await supabase
    .from("media_assets")
    .delete()
    .eq("id", id);

  if (dbError) throw new Error(`DB deletion failed: ${dbError.message}`);
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(admin\)/admin/media/actions.ts
git commit -m "feat: add importFromUrl, updateMediaAsset, deleteMediaAsset server actions"
```

---

## Task 5: `AssetCard` component

**Files:**
- Create: `src/app/(admin)/admin/media/AssetCard.tsx`

- [ ] **Step 1: Create `src/app/(admin)/admin/media/AssetCard.tsx`**

```tsx
"use client";

import { Pencil, Trash2, FileText, Film } from "lucide-react";
import type { MediaAsset } from "@/lib/media-types";
import { formatBytes } from "@/lib/media-types";

interface Props {
  asset: MediaAsset;
  onEdit: (asset: MediaAsset) => void;
  onDelete: (asset: MediaAsset) => void;
}

export default function AssetCard({ asset, onEdit, onDelete }: Props) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))]">
      <div className="relative aspect-square bg-[hsl(var(--admin-bg))]">
        {asset.file_type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset.public_url}
            alt={asset.alt_text ?? asset.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            {asset.file_type === "video" ? (
              <Film className="h-10 w-10 text-[hsl(var(--admin-text-muted))]" />
            ) : (
              <FileText className="h-10 w-10 text-[hsl(var(--admin-text-muted))]" />
            )}
          </div>
        )}

        {/* Hover overlay with action buttons */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => onEdit(asset)}
            className="rounded-full bg-white/90 p-2 hover:bg-white"
            aria-label="Edit asset"
          >
            <Pencil className="h-4 w-4 text-gray-800" />
          </button>
          <button
            onClick={() => onDelete(asset)}
            className="rounded-full bg-white/90 p-2 hover:bg-red-50"
            aria-label="Delete asset"
          >
            <Trash2 className="h-4 w-4 text-gray-800 hover:text-red-600" />
          </button>
        </div>
      </div>

      <div className="p-2">
        <p className="truncate text-xs text-[hsl(var(--admin-text))]">{asset.title}</p>
        <p className="text-xs text-[hsl(var(--admin-text-muted))]">
          {formatBytes(asset.size_bytes)}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(admin\)/admin/media/AssetCard.tsx
git commit -m "feat: add AssetCard component"
```

---

## Task 6: `AssetEditModal` component

**Files:**
- Create: `src/app/(admin)/admin/media/AssetEditModal.tsx`

- [ ] **Step 1: Create `src/app/(admin)/admin/media/AssetEditModal.tsx`**

```tsx
"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateMediaAsset } from "./actions";
import type { MediaAsset } from "@/lib/media-types";

interface Props {
  asset: MediaAsset;
  onClose: () => void;
  onSaved: (asset: MediaAsset) => void;
}

export default function AssetEditModal({ asset, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(asset.title);
  const [altText, setAltText] = useState(asset.alt_text ?? "");
  const [tags, setTags] = useState(asset.tags.join(", "));
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setError("");
    startTransition(async () => {
      try {
        const updated = await updateMediaAsset(asset.id, {
          title: title.trim(),
          alt_text:
            asset.file_type === "image" ? (altText.trim() || null) : null,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        });
        onSaved(updated);
        onClose();
      } catch {
        setError("Failed to save. Try again.");
      }
    });
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit asset</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="asset-title">Title</Label>
            <Input
              id="asset-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {asset.file_type === "image" && (
            <div className="space-y-1">
              <Label htmlFor="asset-alt">Alt text</Label>
              <Input
                id="asset-alt"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe the image for screen readers"
              />
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="asset-tags">Tags (comma-separated)</Label>
            <Input
              id="asset-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. hero, branding, 2024"
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(admin\)/admin/media/AssetEditModal.tsx
git commit -m "feat: add AssetEditModal component"
```

---

## Task 7: `UploadZone` component

**Files:**
- Create: `src/app/(admin)/admin/media/UploadZone.tsx`

- [ ] **Step 1: Create `src/app/(admin)/admin/media/UploadZone.tsx`**

```tsx
"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

export default function UploadZone({ onFiles, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
      >
        <Upload className="mr-2 h-4 w-4" />
        Upload
      </Button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif,video/mp4,video/webm,video/quicktime,application/pdf"
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length > 0) onFiles(files);
          // Reset so the same file can be re-selected after an error
          e.target.value = "";
        }}
      />
    </>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(admin\)/admin/media/UploadZone.tsx
git commit -m "feat: add UploadZone component"
```

---

## Task 8: `UrlImportForm` component

**Files:**
- Create: `src/app/(admin)/admin/media/UrlImportForm.tsx`

- [ ] **Step 1: Create `src/app/(admin)/admin/media/UrlImportForm.tsx`**

```tsx
"use client";

import { useState, useTransition } from "react";
import { Link as LinkIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { importFromUrl } from "./actions";
import type { MediaAsset } from "@/lib/media-types";

interface Props {
  onImported: (asset: MediaAsset) => void;
}

export default function UrlImportForm({ onImported }: Props) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!url.trim()) {
      setError("URL is required.");
      return;
    }
    setError("");
    startTransition(async () => {
      try {
        const asset = await importFromUrl(url.trim());
        onImported(asset);
        setUrl("");
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Import failed. Try again.");
      }
    });
  }

  return (
    <>
      <Button variant="outline" onClick={() => { setUrl(""); setError(""); setOpen(true); }}>
        <LinkIcon className="mr-2 h-4 w-4" />
        URL
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import from URL</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <Input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              autoFocus
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Importing…" : "Import"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(admin\)/admin/media/UrlImportForm.tsx
git commit -m "feat: add UrlImportForm component"
```

---

## Task 9: `MediaLibrary` client component

**Files:**
- Create: `src/app/(admin)/admin/media/MediaLibrary.tsx`

- [ ] **Step 1: Create `src/app/(admin)/admin/media/MediaLibrary.tsx`**

```tsx
"use client";

import { useState, useCallback, useRef } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getSignedUploadUrl,
  saveMediaAsset,
  deleteMediaAsset,
} from "./actions";
import {
  mimeTypeToFileType,
  MAX_FILE_SIZES,
  type MediaAsset,
  type FileType,
} from "@/lib/media-types";
import AssetCard from "./AssetCard";
import AssetEditModal from "./AssetEditModal";
import UploadZone from "./UploadZone";
import UrlImportForm from "./UrlImportForm";

interface UploadItem {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "done" | "error";
  errorMessage?: string;
}

type FilterTab = "all" | FileType;

const FILTER_TABS: { label: string; value: FilterTab }[] = [
  { label: "All", value: "all" },
  { label: "Images", value: "image" },
  { label: "Videos", value: "video" },
  { label: "Documents", value: "document" },
];

function uploadFileDirectly(
  signedUrl: string,
  file: File,
  onProgress: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed with status ${xhr.status}`));
    });
    xhr.addEventListener("error", () =>
      reject(new Error("Network error during upload"))
    );
    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}

interface Props {
  initialAssets: MediaAsset[];
}

export default function MediaLibrary({ initialAssets }: Props) {
  const [assets, setAssets] = useState<MediaAsset[]>(initialAssets);
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [editingAsset, setEditingAsset] = useState<MediaAsset | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  const updateUploadItem = useCallback(
    (id: string, update: Partial<UploadItem>) => {
      setUploadItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...update } : item))
      );
    },
    []
  );

  const handleFiles = useCallback(
    async (files: File[]) => {
      // Validate all files first; build the tray items list
      type FileWithId = File & { _uploadId: string };
      const validFiles: FileWithId[] = [];
      const newItems: UploadItem[] = [];

      for (const file of files) {
        const fileType = mimeTypeToFileType(file.type);
        const maxSize = fileType ? MAX_FILE_SIZES[fileType] : 0;
        const itemId = crypto.randomUUID();

        if (!fileType) {
          newItems.push({
            id: itemId,
            name: file.name,
            progress: 0,
            status: "error",
            errorMessage: `Unsupported type: ${file.type || "unknown"}`,
          });
          continue;
        }
        if (file.size > maxSize) {
          newItems.push({
            id: itemId,
            name: file.name,
            progress: 0,
            status: "error",
            errorMessage: `File too large (max ${maxSize / 1024 / 1024} MB)`,
          });
          continue;
        }
        newItems.push({
          id: itemId,
          name: file.name,
          progress: 0,
          status: "uploading",
        });
        const f = file as FileWithId;
        f._uploadId = itemId;
        validFiles.push(f);
      }

      setUploadItems((prev) => [...prev, ...newItems]);

      // Upload valid files sequentially to avoid overwhelming the connection
      for (const file of validFiles) {
        const itemId = file._uploadId;
        try {
          const { signedUrl, storagePath, publicUrl } =
            await getSignedUploadUrl(file.name, file.type);

          await uploadFileDirectly(signedUrl, file, (pct) => {
            updateUploadItem(itemId, { progress: pct });
          });

          const saved = await saveMediaAsset({
            storage_path: storagePath,
            public_url: publicUrl,
            mime_type: file.type,
            size_bytes: file.size,
            title: file.name,
          });

          updateUploadItem(itemId, { status: "done", progress: 100 });
          setAssets((prev) => [saved, ...prev]);
        } catch (e) {
          updateUploadItem(itemId, {
            status: "error",
            errorMessage:
              e instanceof Error ? e.message : "Upload failed",
          });
        }
      }
    },
    [updateUploadItem]
  );

  async function handleDelete(asset: MediaAsset) {
    if (!confirm(`Delete "${asset.title}"? This cannot be undone.`)) return;
    try {
      await deleteMediaAsset(asset.id);
      setAssets((prev) => prev.filter((a) => a.id !== asset.id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed.");
    }
  }

  const filteredAssets = assets.filter((a) => {
    if (activeFilter !== "all" && a.file_type !== activeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div
      className="min-h-full"
      onDragEnter={(e) => {
        e.preventDefault();
        dragCounterRef.current++;
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        dragCounterRef.current--;
        if (dragCounterRef.current === 0) setIsDragging(false);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        dragCounterRef.current = 0;
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) handleFiles(files);
      }}
    >
      {/* Full-page drag overlay */}
      {isDragging && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center border-2 border-dashed border-[hsl(var(--admin-accent))] bg-[hsl(var(--admin-accent))]/10">
          <p className="text-lg font-medium text-[hsl(var(--admin-accent))]">
            Drop files to upload
          </p>
        </div>
      )}

      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Media</h1>
        <div className="flex items-center gap-2">
          <UploadZone onFiles={handleFiles} />
          <UrlImportForm
            onImported={(asset) => setAssets((prev) => [asset, ...prev])}
          />
        </div>
      </div>

      {/* Filters + Search */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                activeFilter === tab.value
                  ? "bg-[hsl(var(--admin-accent))] text-white"
                  : "text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-bg))] hover:text-[hsl(var(--admin-text))]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Search…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="ml-auto w-48 rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-[hsl(var(--admin-accent))]"
        />
      </div>

      {/* Asset grid */}
      {filteredAssets.length === 0 ? (
        <p className="py-16 text-center text-sm text-[hsl(var(--admin-text-muted))]">
          {assets.length === 0
            ? "No assets yet. Upload files or import from a URL."
            : "No assets match your filters."}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onEdit={setEditingAsset}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Upload tray */}
      {uploadItems.length > 0 && (
        <div className="fixed bottom-4 right-4 z-40 w-80 overflow-hidden rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] shadow-lg">
          <div className="flex items-center justify-between border-b border-[hsl(var(--admin-border))] px-4 py-2">
            <span className="text-sm font-medium">Uploads</span>
            {uploadItems.every((i) => i.status !== "uploading") && (
              <button
                onClick={() => setUploadItems([])}
                className="text-xs text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))]"
              >
                Clear
              </button>
            )}
          </div>
          <ul className="max-h-60 divide-y divide-[hsl(var(--admin-border))] overflow-y-auto">
            {uploadItems.map((item) => (
              <li key={item.id} className="px-4 py-2">
                <div className="flex items-center gap-2">
                  {item.status === "uploading" && (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[hsl(var(--admin-accent))]" />
                  )}
                  {item.status === "done" && (
                    <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
                  )}
                  {item.status === "error" && (
                    <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                  )}
                  <span className="truncate text-xs">{item.name}</span>
                </div>
                {item.status === "uploading" && (
                  <div className="mt-1 h-1 w-full rounded-full bg-[hsl(var(--admin-bg))]">
                    <div
                      className="h-1 rounded-full bg-[hsl(var(--admin-accent))] transition-all"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
                {item.status === "error" && item.errorMessage && (
                  <p className="mt-0.5 text-xs text-red-500">{item.errorMessage}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Edit modal */}
      {editingAsset && (
        <AssetEditModal
          asset={editingAsset}
          onClose={() => setEditingAsset(null)}
          onSaved={(updated) => {
            setAssets((prev) =>
              prev.map((a) => (a.id === updated.id ? updated : a))
            );
          }}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(admin\)/admin/media/MediaLibrary.tsx
git commit -m "feat: add MediaLibrary client component with upload tray, filters, search"
```

---

## Task 10: Replace `media/page.tsx` stub with the real library

**Files:**
- Modify: `src/app/(admin)/admin/media/page.tsx`

- [ ] **Step 1: Replace `src/app/(admin)/admin/media/page.tsx`**

```tsx
import { listMediaAssets } from "./actions";
import MediaLibrary from "./MediaLibrary";

export default async function AdminMediaPage() {
  const assets = await listMediaAssets();
  return <MediaLibrary initialAssets={assets} />;
}
```

- [ ] **Step 2: Start the dev server and verify the page loads**

```bash
npm run dev
```

Navigate to `http://localhost:3000/admin/media` (log in first if needed).

Expected:
- Page renders with "Media" heading, Upload button, URL button
- Filter tabs: All / Images / Videos / Documents
- Search input
- Empty state message: "No assets yet. Upload files or import from a URL."
- No console errors

- [ ] **Step 3: Test file upload**

1. Click **Upload**, select a JPEG image.
2. Upload tray appears at the bottom with a progress bar.
3. After completion: image thumbnail appears in the grid, tray item shows a green checkmark.

- [ ] **Step 4: Test drag-and-drop**

1. Drag a PNG file from Finder/Explorer onto the page.
2. Blue dashed overlay appears while dragging.
3. File uploads and thumbnail appears in the grid.

- [ ] **Step 5: Test URL import**

1. Click the **URL** button.
2. Paste a direct URL to a publicly accessible JPEG (e.g., any CDN image URL).
3. Click **Import**.
4. Asset appears in the grid.

- [ ] **Step 6: Test edit metadata**

1. Hover an asset card; click the **pencil** icon.
2. Edit modal opens.
3. Change title, add tags, click **Save**.
4. Card updates immediately.

- [ ] **Step 7: Test delete**

1. Hover an asset card; click the **trash** icon.
2. Confirm the prompt.
3. Asset disappears from the grid.
4. Verify in Supabase Storage dashboard that the file is also removed.

- [ ] **Step 8: Commit**

```bash
git add src/app/\(admin\)/admin/media/page.tsx
git commit -m "feat: replace media stub with real server-rendered media library"
```

---

## Task 11: `AssetPicker` shared modal

**Files:**
- Create: `src/components/admin/AssetPicker.tsx`

- [ ] **Step 1: Create `src/components/admin/AssetPicker.tsx`**

```tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { FileText, Film } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { listMediaAssets } from "@/app/(admin)/admin/media/actions";
import type { MediaAsset } from "@/lib/media-types";

export interface SelectedAsset {
  id: string;
  public_url: string;
  title: string;
  alt_text: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (asset: SelectedAsset) => void;
}

export default function AssetPicker({ open, onOpenChange, onSelect }: Props) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    startTransition(async () => {
      const data = await listMediaAssets();
      setAssets(data);
    });
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select asset</DialogTitle>
        </DialogHeader>

        {isPending ? (
          <p className="py-8 text-center text-sm text-[hsl(var(--admin-text-muted))]">
            Loading…
          </p>
        ) : assets.length === 0 ? (
          <p className="py-8 text-center text-sm text-[hsl(var(--admin-text-muted))]">
            No assets yet. Upload files in the Media section first.
          </p>
        ) : (
          <div className="grid max-h-[60vh] grid-cols-4 gap-3 overflow-y-auto py-2">
            {assets.map((asset) => (
              <button
                key={asset.id}
                className="group overflow-hidden rounded-lg border border-[hsl(var(--admin-border))] text-left transition-colors hover:border-[hsl(var(--admin-accent))]"
                onClick={() => {
                  onSelect({
                    id: asset.id,
                    public_url: asset.public_url,
                    title: asset.title,
                    alt_text: asset.alt_text,
                  });
                  onOpenChange(false);
                }}
              >
                <div className="aspect-square bg-[hsl(var(--admin-bg))]">
                  {asset.file_type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={asset.public_url}
                      alt={asset.alt_text ?? asset.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      {asset.file_type === "video" ? (
                        <Film className="h-8 w-8 text-[hsl(var(--admin-text-muted))]" />
                      ) : (
                        <FileText className="h-8 w-8 text-[hsl(var(--admin-text-muted))]" />
                      )}
                    </div>
                  )}
                </div>
                <p className="truncate px-2 py-1 text-xs text-[hsl(var(--admin-text))]">
                  {asset.title}
                </p>
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Smoke-test the AssetPicker**

Add a temporary button somewhere in the admin dashboard (`src/app/(admin)/admin/page.tsx`) to open the picker, verify it shows the assets uploaded in Task 10, select one, and check the console logs the expected `SelectedAsset` shape. Remove the test button afterward.

```tsx
// Temporary test — remove after verifying
"use client";
import { useState } from "react";
import AssetPicker, { type SelectedAsset } from "@/components/admin/AssetPicker";

export default function AdminPage() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <button onClick={() => setOpen(true)} className="mt-4 underline text-sm">
        Test AssetPicker
      </button>
      <AssetPicker
        open={open}
        onOpenChange={setOpen}
        onSelect={(a: SelectedAsset) => { console.log("selected", a); setOpen(false); }}
      />
    </>
  );
}
```

After verifying, revert `admin/page.tsx` to its original stub content:

```tsx
export default function AdminPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-sm text-[hsl(var(--admin-text-muted))]">
        Coming soon — dashboard overview will land in a later sub-project.
      </p>
    </>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/AssetPicker.tsx src/app/\(admin\)/admin/page.tsx
git commit -m "feat: add AssetPicker shared modal for sub-project #4 consumption"
```

---

## Task 12: Update `.env.example`

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Append Supabase env vars to `.env.example`**

Open `.env.example` and append at the end:

```
# Supabase — Media Center (sub-project #2)
# Project URL from Supabase dashboard → Settings → API
SUPABASE_URL=

# Service-role key from Supabase dashboard → Settings → API
# IMPORTANT: Never expose this to the browser. Server-side only.
SUPABASE_SERVICE_ROLE_KEY=

# Supabase Storage bucket name (created by: npx tsx scripts/setup-media-bucket.ts)
SUPABASE_STORAGE_BUCKET=media
```

- [ ] **Step 2: Commit**

```bash
git add .env.example
git commit -m "docs: add Supabase env vars to .env.example"
```

---

## Manual test checklist (run before merging)

1. Unauthenticated GET `/admin/media` → redirected to `/admin/login`
2. Authenticated: `/admin/media` loads, shows empty state
3. Drag-and-drop a JPEG → appears in grid with thumbnail
4. Multi-select upload (3 files at once) → all show progress bars, all appear in grid
5. Upload a PDF → shows document icon
6. Upload an MP4 → shows video icon
7. URL import of a public image URL → asset appears in grid
8. URL import of an HTML page URL → error message shown, no asset created
9. Edit asset title + tags → changes persist on page reload
10. Edit image asset: alt_text field visible. Edit PDF: alt_text field hidden
11. Delete asset → removed from grid and from Supabase Storage bucket
12. File too large (>20 MB image) → rejected before upload with size message
13. Unsupported file type (e.g. `.txt`) → rejected client-side
14. Missing `SUPABASE_URL` in `.env.local` → server throws with clear error listing the missing var
15. `AssetPicker` modal renders, selecting an asset calls `onSelect` with `{ id, public_url, title, alt_text }`
