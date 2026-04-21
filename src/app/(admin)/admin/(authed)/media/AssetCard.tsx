"use client";

import Image from "next/image";
import { Pencil, Trash2, FileText, Film } from "lucide-react";
import { formatBytes, type MediaAsset } from "@/lib/media-types";

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
          <Image
            src={asset.public_url}
            alt={asset.alt_text ?? asset.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
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

        {/* Hover overlay — also shown on keyboard focus inside */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            onClick={() => onEdit(asset)}
            className="rounded-full bg-white/90 p-2 hover:bg-white"
            aria-label="Edit asset"
          >
            <Pencil className="h-4 w-4 text-gray-800" />
          </button>
          <button
            onClick={() => onDelete(asset)}
            className="group/delete rounded-full bg-white/90 p-2 hover:bg-red-50"
            aria-label="Delete asset"
          >
            <Trash2 className="h-4 w-4 text-gray-800 group-hover/delete:text-red-600" />
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
