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
