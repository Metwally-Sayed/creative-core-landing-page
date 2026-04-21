// src/components/admin/ImageField.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AssetPicker from "@/components/admin/AssetPicker";

interface ImageFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageField({ value, onChange, label }: ImageFieldProps) {
  const [mode, setMode] = useState<"picker" | "url">("picker");
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="space-y-2">
      {mode === "picker" ? (
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPickerOpen(true)}
          >
            {value ? "Change image" : "Pick from media library"}
          </Button>
          {value && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt={label ?? "Selected"}
              className="h-12 w-20 rounded object-cover border border-[hsl(var(--admin-border))]"
            />
          )}
        </div>
      ) : (
        <Input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
        />
      )}

      <button
        type="button"
        onClick={() => setMode((m) => (m === "picker" ? "url" : "picker"))}
        className="text-xs text-[hsl(var(--admin-text-muted))] underline hover:text-[hsl(var(--admin-text))]"
      >
        {mode === "picker" ? "Use URL instead" : "Use media library"}
      </button>

      <AssetPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(asset) => {
          onChange(asset.public_url);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}
