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

      <Dialog open={open} onOpenChange={(next) => { if (!isPending) setOpen(next); }}>
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
