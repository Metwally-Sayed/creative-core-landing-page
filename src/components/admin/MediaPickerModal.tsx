"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Search, Check, ImageIcon, Upload, Loader2 } from "lucide-react";
import {
  listMediaAssets,
  getSignedUploadUrl,
  saveMediaAsset,
} from "@/app/(admin)/admin/(authed)/media/actions";
import { MEDIA_PAGE_SIZE } from "@/lib/media-types";
import type { MediaAsset } from "@/lib/media-types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
  error?: string;
  done?: boolean;
}

function uploadViaXhr(
  signedUrl: string,
  file: File,
  onProgress: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    });
    xhr.addEventListener("load", () =>
      xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Status ${xhr.status}`))
    );
    xhr.addEventListener("error", () => reject(new Error("Network error")));
    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}

// The overlay renders inside #admin-modal-root (a dedicated fixed div at body
// level — see admin/(authed)/layout.tsx and globals.css).
// Using position:absolute here (not fixed) so it's relative to the portal root,
// which is already sized to 100vw × 100vh and avoids the Chrome bug where
// body { position:relative } (set by Radix scroll-lock) makes body the
// fixed-containing-block instead of the viewport.
// pointer-events:auto overrides the root's pointer-events:none default.
const overlayStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1rem",
  pointerEvents: "auto",
};

const backdropStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.6)",
  backdropFilter: "blur(4px)",
  WebkitBackdropFilter: "blur(4px)",
};

export default function MediaPickerModal({ isOpen, onClose, onSelect }: Props) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingFirst, setIsLoadingFirst] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragCounterRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Client-side mount guard — createPortal needs the DOM, and
  // #admin-modal-root must exist before we portal into it.
  useEffect(() => { setMounted(true); }, []);

  const loadFirstPage = useCallback(async (q: string) => {
    setIsLoadingFirst(true);
    try {
      const data = await listMediaAssets({ fileType: "image", page: 1, search: q });
      setAssets(data);
      setPage(1);
      setHasMore(data.length === MEDIA_PAGE_SIZE);
    } finally {
      setIsLoadingFirst(false);
    }
  }, []);

  const loadNextPage = useCallback(async (currentPage: number, q: string) => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const data = await listMediaAssets({ fileType: "image", page: nextPage, search: q });
      if (data.length > 0) {
        setAssets((prev) => [...prev, ...data]);
        setPage(nextPage);
      }
      setHasMore(data.length === MEDIA_PAGE_SIZE);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore]);

  // Load on open
  useEffect(() => {
    if (isOpen) loadFirstPage(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => loadFirstPage(search), 300);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [search, isOpen, loadFirstPage]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setSearch(""); setSelected(null); setUploading([]);
      setPage(1); setHasMore(true);
    }
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Infinite scroll sentinel
  useEffect(() => {
    if (!isOpen || !hasMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && !isLoadingFirst) {
          loadNextPage(page, search);
        }
      },
      { root: scrollContainerRef.current, rootMargin: "120px", threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isOpen, hasMore, page, search, isLoadingMore, isLoadingFirst, loadNextPage]);

  const handleFiles = async (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (!imageFiles.length) return;

    const items: UploadingFile[] = imageFiles.map((f) => ({
      id: crypto.randomUUID(), name: f.name, progress: 0,
    }));
    setUploading((prev) => [...items, ...prev]);

    await Promise.allSettled(
      imageFiles.map(async (file, i) => {
        const id = items[i].id;
        const update = (patch: Partial<UploadingFile>) =>
          setUploading((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
        try {
          const { signedUrl, storagePath, publicUrl } = await getSignedUploadUrl(file.name, file.type);
          await uploadViaXhr(signedUrl, file, (pct) => update({ progress: pct }));
          const saved = await saveMediaAsset({
            storage_path: storagePath, public_url: publicUrl,
            mime_type: file.type, size_bytes: file.size, title: file.name,
          });
          update({ done: true, progress: 100 });
          setAssets((prev) => [saved, ...prev]);
          if (i === 0) setSelected(saved.public_url);
        } catch (err) {
          update({ error: err instanceof Error ? err.message : "Upload failed" });
        }
      })
    );
    setTimeout(() => setUploading((prev) => prev.filter((u) => !u.done)), 1800);
  };

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault(); dragCounterRef.current++; setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) setIsDragging(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); dragCounterRef.current = 0; setIsDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  if (!isOpen || !mounted) return null;

  // Portal target: dedicated #admin-modal-root div in the admin layout.
  // Falls back to document.body if the root somehow isn't in the DOM yet.
  const portalTarget =
    document.getElementById("admin-modal-root") ?? document.body;

  const activeUploads = uploading.filter((u) => !u.done && !u.error);
  const failedUploads = uploading.filter((u) => u.error);

  return createPortal(
    <div style={overlayStyle}>
      {/* Backdrop */}
      <div style={backdropStyle} onClick={onClose} />

      {/* Modal panel */}
      <div
        className={`relative flex w-full max-w-3xl flex-col rounded-xl border shadow-2xl overflow-hidden transition-colors ${
          isDragging
            ? "border-[hsl(var(--admin-accent))] bg-[hsl(var(--admin-bg))]"
            : "border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))]"
        }`}
        style={{ maxHeight: "85vh" }}
        onDragEnter={onDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {/* Drag overlay */}
        {isDragging && (
          <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[hsl(var(--admin-accent))]">
            <Upload className="h-10 w-10 text-[hsl(var(--admin-accent))]" />
            <p className="text-sm font-medium text-[hsl(var(--admin-accent))]">Drop to upload</p>
          </div>
        )}

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[hsl(var(--admin-border))] px-5 py-3.5">
          <h2 className="text-sm font-semibold text-[hsl(var(--admin-text))]">Media Library</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-md bg-[hsl(var(--admin-accent))] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity"
            >
              <Upload className="h-3 w-3" /> Upload
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => { if (e.target.files) handleFiles(Array.from(e.target.files)); e.target.value = ""; }} />
            <button onClick={onClose}
              className="rounded-md p-1.5 text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-surface))] hover:text-[hsl(var(--admin-text))] transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="shrink-0 border-b border-[hsl(var(--admin-border))] px-5 py-3">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[hsl(var(--admin-text-muted))]" />
            <input type="text" placeholder="Search images…" value={search}
              onChange={(e) => setSearch(e.target.value)} autoFocus
              className="w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] py-1.5 ps-9 pe-3 text-sm text-[hsl(var(--admin-text))] placeholder:text-[hsl(var(--admin-text-muted))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]"
            />
          </div>
        </div>

        {/* Upload progress */}
        {(activeUploads.length > 0 || failedUploads.length > 0) && (
          <div className="shrink-0 border-b border-[hsl(var(--admin-border))] px-5 py-2 space-y-1.5 max-h-32 overflow-y-auto">
            {uploading.map((u) => (
              <div key={u.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs text-[hsl(var(--admin-text))]">{u.name}</p>
                  {!u.error && !u.done && (
                    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-[hsl(var(--admin-border))]">
                      <div className="h-full rounded-full bg-[hsl(var(--admin-accent))] transition-all duration-150" style={{ width: `${u.progress}%` }} />
                    </div>
                  )}
                  {u.error && <p className="mt-0.5 text-[0.65rem] text-red-500">{u.error}</p>}
                </div>
                {u.done && <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" strokeWidth={3} />}
                {!u.done && !u.error && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-[hsl(var(--admin-text-muted))]" />}
                {u.error && (
                  <button onClick={() => setUploading((p) => p.filter((x) => x.id !== u.id))}
                    className="text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))]">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Grid */}
        <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto p-5">
          {isLoadingFirst ? (
            <div className="flex h-48 items-center justify-center gap-2 text-sm text-[hsl(var(--admin-text-muted))]">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : assets.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3 text-[hsl(var(--admin-text-muted))]">
              <ImageIcon className="h-8 w-8 opacity-30" />
              <p className="text-sm">No images found</p>
              <button onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-md border border-[hsl(var(--admin-border))] px-3 py-1.5 text-xs hover:bg-[hsl(var(--admin-surface))] transition-colors">
                <Upload className="h-3 w-3" /> Upload an image
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {assets.map((asset) => {
                  const isSelected = selected === asset.public_url;
                  return (
                    <button key={asset.id}
                      onClick={() => setSelected(isSelected ? null : asset.public_url)}
                      className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                        isSelected
                          ? "border-[hsl(var(--admin-accent))] ring-2 ring-[hsl(var(--admin-accent))/0.25]"
                          : "border-[hsl(var(--admin-border))] hover:border-[hsl(var(--admin-accent))/0.5]"
                      }`}
                    >
                      <img src={asset.public_url} alt={asset.alt_text || asset.title}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" />
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[hsl(var(--admin-accent))/0.25]">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--admin-accent))] text-white shadow">
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <p className="truncate text-[0.6rem] text-white">{asset.title}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {hasMore && (
                <div ref={sentinelRef} className="flex items-center justify-center py-6">
                  {isLoadingMore && (
                    <div className="flex items-center gap-2 text-xs text-[hsl(var(--admin-text-muted))]">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading more…
                    </div>
                  )}
                </div>
              )}

              {!hasMore && assets.length > MEDIA_PAGE_SIZE && (
                <p className="py-4 text-center text-xs text-[hsl(var(--admin-text-muted))]">
                  All {assets.length} images loaded
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-[hsl(var(--admin-border))] px-5 py-3">
          <p className="text-xs text-[hsl(var(--admin-text-muted))]">
            {selected ? "1 image selected" : `${assets.length} images · drag & drop to upload`}
          </p>
          <div className="flex gap-2">
            <button onClick={onClose}
              className="rounded-md border border-[hsl(var(--admin-border))] px-4 py-1.5 text-xs font-medium text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-surface))] transition-colors">
              Cancel
            </button>
            <button
              onClick={() => { if (selected) { onSelect(selected); onClose(); } }}
              disabled={!selected}
              className="rounded-md bg-[hsl(var(--admin-accent))] px-4 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-40 transition-opacity">
              Use Image
            </button>
          </div>
        </div>
      </div>
    </div>,
    portalTarget
  );
}
