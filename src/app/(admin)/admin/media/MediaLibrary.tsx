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

      {/* Edit modal — keyed on asset.id so state resets when editing a different asset */}
      {editingAsset && (
        <AssetEditModal
          key={editingAsset.id}
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
