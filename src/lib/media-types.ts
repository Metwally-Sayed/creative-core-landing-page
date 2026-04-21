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
