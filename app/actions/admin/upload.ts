"use server";

import { put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { requireAdmin } from "@/lib/admin-auth";

export type UploadResult = { success: true; url: string } | { success: false; message: string };

function sanitizeFilename(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? "fichier";
  return base.replace(/[^a-zA-Z0-9._-]/g, "-");
}

/**
 * Normalizes any uploaded image (iPhone HEIC/HEIF, Android formats, AI-generated
 * PNG/WEBP, arbitrary camera output, etc.) to a browser-safe JPEG, auto-correcting
 * EXIF orientation so photos taken on phones don't end up sideways. Falls back to
 * the original bytes untouched if sharp can't decode the source format.
 */
async function normalizeImage(
  bytes: Buffer,
  filename: string
): Promise<{ bytes: Buffer; filename: string; contentType: string }> {
  try {
    const converted = await sharp(bytes).rotate().jpeg({ quality: 88 }).toBuffer();
    return {
      bytes: converted,
      filename: filename.replace(/\.[^.]+$/, "") + ".jpg",
      contentType: "image/jpeg",
    };
  } catch (error) {
    console.error("Image normalization failed, storing original bytes:", error);
    return { bytes, filename, contentType: "application/octet-stream" };
  }
}

export async function uploadAdminFile(formData: FormData): Promise<UploadResult> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, message: "Aucun fichier sélectionné." };
  }

  let filename = `${Date.now()}-${sanitizeFilename(file.name)}`;
  let bytes: Buffer<ArrayBufferLike> = Buffer.from(await file.arrayBuffer());

  if (file.type.startsWith("image/") || /\.(heic|heif|avif)$/i.test(file.name)) {
    const normalized = await normalizeImage(bytes, filename);
    bytes = normalized.bytes;
    filename = normalized.filename;
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(`admin-uploads/${filename}`, bytes, { access: "public" });
      return { success: true, url: blob.url };
    } catch (error) {
      console.error("Admin file upload failed (Vercel Blob):", error);
      return { success: false, message: "Échec de l'envoi du fichier. Merci de réessayer." };
    }
  }

  // Dev/local fallback: no Blob token configured. Served dynamically through
  // app/api/uploads/[...path]/route.ts rather than from public/ — Next's
  // production server doesn't pick up files dropped into public/ after the
  // build, so a static path would 404 until the next rebuild. Not suitable
  // for serverless deployments (no persistent filesystem) — configure
  // BLOB_READ_WRITE_TOKEN for production use.
  try {
    const uploadsDir = path.join(process.cwd(), "uploads");
    await mkdir(uploadsDir, { recursive: true });
    await writeFile(path.join(uploadsDir, filename), bytes);
    return { success: true, url: `/api/uploads/${filename}` };
  } catch (error) {
    console.error("Admin file upload failed (local fallback):", error);
    return { success: false, message: "Échec de l'envoi du fichier. Merci de réessayer." };
  }
}
