"use server";

import { auth } from "@/auth";
import { supabase, STORAGE_BUCKET } from "@/lib/supabase";
import {
  mimeTypeToFileType,
  fileTypeToFolder,
  type MediaAsset,
  type MediaAssetPatch,
  MAX_FILE_SIZES,
} from "@/lib/media-types";

export async function listMediaAssets(
  filter?: { fileType?: string }
): Promise<MediaAsset[]> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  let query = supabase
    .from("media_assets")
    .select("*")
    .order("created_at", { ascending: false });

  if (filter?.fileType && filter.fileType !== "all") {
    query = query.eq("file_type", filter.fileType);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to list assets: ${error.message}`);
  return (data ?? []) as MediaAsset[];
}

export async function getSignedUploadUrl(
  filename: string,
  mimeType: string
): Promise<{ signedUrl: string; storagePath: string; publicUrl: string }> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const fileType = mimeTypeToFileType(mimeType);
  if (!fileType) throw new Error(`Unsupported MIME type: ${mimeType}`);

  const ext = (filename.includes(".") ? filename.split(".").pop() : "") || "bin";
  const folder = fileTypeToFolder(fileType);
  const storagePath = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUploadUrl(storagePath);

  if (error || !data) {
    throw new Error(`Failed to create signed URL: ${error?.message ?? "unknown error"}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);

  return { signedUrl: data.signedUrl, storagePath, publicUrl };
}

export interface SaveMediaAssetInput {
  storage_path: string;
  public_url: string;
  mime_type: string;
  size_bytes: number;
  title: string;
}

export async function saveMediaAsset(
  input: SaveMediaAssetInput
): Promise<MediaAsset> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const fileType = mimeTypeToFileType(input.mime_type);
  if (!fileType) throw new Error(`Unsupported MIME type: ${input.mime_type}`);

  if (!Number.isInteger(input.size_bytes) || input.size_bytes <= 0) {
    throw new Error("size_bytes must be a positive integer");
  }

  const maxSize = MAX_FILE_SIZES[fileType];
  if (input.size_bytes > maxSize) {
    throw new Error(
      `File exceeds the ${fileType} size limit of ${maxSize / 1024 / 1024} MB`
    );
  }

  const title = input.title.trim();
  if (!title) throw new Error("title must not be empty");

  const { data, error } = await supabase
    .from("media_assets")
    .insert({
      storage_path: input.storage_path,
      public_url: input.public_url,
      file_type: fileType,
      mime_type: input.mime_type,
      size_bytes: input.size_bytes,
      title,
      alt_text: null,
      tags: [],
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to save asset: ${error.message}`);
  return data as MediaAsset;
}

export async function importFromUrl(url: string): Promise<MediaAsset> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error("Invalid URL. Provide a fully-qualified https:// address.");
  }
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Only http:// and https:// URLs are supported.");
  }

  // HEAD first to validate MIME type and size before downloading
  let headRes: Response;
  try {
    headRes = await fetch(url, { method: "HEAD" });
  } catch {
    throw new Error("Could not reach the URL. Check that it is publicly accessible.");
  }

  const mimeType = (headRes.headers.get("content-type") ?? "").split(";")[0].trim();
  const fileType = mimeTypeToFileType(mimeType);
  if (!fileType) {
    throw new Error(
      `Unsupported file type: ${mimeType || "unknown"}. Accepted: images (JPEG/PNG/WebP/SVG/GIF), videos (MP4/WebM/MOV), PDFs.`
    );
  }

  const contentLength = parseInt(headRes.headers.get("content-length") ?? "0", 10);
  const maxSize = MAX_FILE_SIZES[fileType];
  if (contentLength > 0 && contentLength > maxSize) {
    throw new Error(
      `File is too large (${(contentLength / 1024 / 1024).toFixed(1)} MB). Max for ${fileType}: ${maxSize / 1024 / 1024} MB.`
    );
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Remote server returned ${res.status} ${res.statusText}.`);
  }
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (buffer.length > maxSize) {
    throw new Error(
      `File is too large (${(buffer.length / 1024 / 1024).toFixed(1)} MB). Max for ${fileType}: ${maxSize / 1024 / 1024} MB.`
    );
  }

  const urlObj = new URL(url);
  const rawFilename = urlObj.pathname.split("/").pop() ?? "import";
  const filename = decodeURIComponent(rawFilename);
  const ext = (filename.includes(".") ? filename.split(".").pop() : "") || "bin";
  const folder = fileTypeToFolder(fileType);
  const storagePath = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, buffer, { contentType: mimeType });

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);

  return saveMediaAsset({
    storage_path: storagePath,
    public_url: publicUrl,
    mime_type: mimeType,
    size_bytes: buffer.length,
    title: filename,
  });
}

export async function updateMediaAsset(
  id: string,
  patch: Partial<MediaAssetPatch>
): Promise<MediaAsset> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  if (patch.title !== undefined) {
    const trimmed = patch.title.trim();
    if (!trimmed) throw new Error("title must not be empty");
    patch = { ...patch, title: trimmed };
  }

  const { data, error } = await supabase
    .from("media_assets")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update asset: ${error.message}`);
  return data as MediaAsset;
}

export async function deleteMediaAsset(id: string): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("UNAUTHORIZED");

  const { data: asset, error: fetchError } = await supabase
    .from("media_assets")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (fetchError) throw new Error(`Asset not found: ${fetchError.message}`);

  const { error: storageError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([asset.storage_path]);

  if (storageError) throw new Error(`Storage deletion failed: ${storageError.message}`);

  const { error: dbError } = await supabase
    .from("media_assets")
    .delete()
    .eq("id", id);

  if (dbError) throw new Error(`DB deletion failed: ${dbError.message}`);
}
