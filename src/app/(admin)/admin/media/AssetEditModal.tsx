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
