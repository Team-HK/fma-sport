"use client";

import { upload } from "@vercel/blob/client";
import { uploadAdminFile } from "@/app/actions/admin/upload";

export const MAX_FILE_BYTES = 20 * 1024 * 1024; // hard limit per file
const SERVER_ACTION_BYTES = 3.5 * 1024 * 1024; // above this, upload straight to Blob
const COMPRESS_ABOVE_BYTES = 800 * 1024;
const MAX_DIMENSION = 2000;

/**
 * Compresses photos in the browser (max 2000 px, JPEG 85%) before upload: faster
 * for the admin, lighter for visitors. Falls back to the original file when the
 * browser can't decode it (e.g. HEIC) or the result isn't smaller.
 */
async function compressImage(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp|bmp)$/.test(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= COMPRESS_ABOVE_BYTES) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

/**
 * Uploads a file from the admin (compressing images first) and returns its
 * public URL. Small files go through a server action (which also normalises
 * HEIC/EXIF); larger ones go straight to Vercel Blob. Throws a user-readable
 * Error on failure.
 */
export async function uploadFile(file: File): Promise<string> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("Fichier trop volumineux (20 Mo maximum).");
  }
  try {
    const prepared = await compressImage(file);
    if (prepared.size <= SERVER_ACTION_BYTES) {
      const fd = new FormData();
      fd.set("file", prepared);
      const result = await uploadAdminFile(fd);
      if (!result.success) throw new Error(result.message);
      return result.url;
    }
    const safeName = prepared.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const blob = await upload(`admin-uploads/${Date.now()}-${safeName}`, prepared, {
      access: "public",
      handleUploadUrl: "/api/admin/blob-upload",
      contentType: prepared.type || undefined,
    });
    return blob.url;
  } catch (err) {
    if (err instanceof Error && err.message) throw err;
    throw new Error("Échec de l'envoi du fichier. Vérifiez votre connexion et réessayez.");
  }
}
