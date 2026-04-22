"use client";

import { useState } from "react";
import { ImageIcon, X, RefreshCw } from "lucide-react";
import MediaPickerModal from "./MediaPickerModal";

interface Props {
  label: string;
  description?: string;
  value: string;
  onChange: (url: string) => void;
  /** Show the preview on a dark background */
  darkPreview?: boolean;
}

export default function LogoPicker({ label, description, value, onChange, darkPreview = false }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">{label}</p>
        {description && <p className="mt-0.5 text-xs text-[hsl(var(--admin-text-muted))] opacity-70">{description}</p>}
      </div>

      {value ? (
        <div
          className={`group relative flex h-24 w-full items-center justify-center overflow-hidden rounded-lg border border-[hsl(var(--admin-border))] p-4 ${
            darkPreview ? "bg-[hsl(var(--accent))]" : "bg-white"
          }`}
        >
          <img
            src={value}
            alt={label}
            className="max-h-full max-w-full object-contain"
          />
          {/* Overlay actions — visible on hover */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-1.5 rounded-md bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-white transition-colors shadow"
            >
              <RefreshCw className="h-3 w-3" />
              Replace
            </button>
            <button
              onClick={() => onChange("")}
              className="flex items-center gap-1.5 rounded-md bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 transition-colors shadow"
            >
              <X className="h-3 w-3" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex h-20 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[hsl(var(--admin-border))] text-xs text-[hsl(var(--admin-text-muted))] hover:border-[hsl(var(--admin-accent))] hover:text-[hsl(var(--admin-accent))] transition-colors"
        >
          <ImageIcon className="h-4 w-4" />
          Choose from Gallery
        </button>
      )}

      <MediaPickerModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSelect={(url) => { onChange(url); setOpen(false); }}
      />
    </div>
  );
}
