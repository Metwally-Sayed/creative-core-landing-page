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
