"use client";

import { useState, useEffect, useTransition } from "react";
import { FileText, Film } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
          <DialogDescription className="sr-only">
            Browse the media library and click an asset to select it.
          </DialogDescription>
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
