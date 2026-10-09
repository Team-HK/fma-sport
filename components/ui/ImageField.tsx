"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Upload, Link2, X, Loader2, FileText, ExternalLink } from "lucide-react";
import { Label } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { upload } from "@vercel/blob/client";
import { uploadAdminFile } from "@/app/actions/admin/upload";

function detectKind(value: string, accept: string): "image" | "video" | "document" | "none" {
  if (!value) return "none";
  if (/\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i.test(value)) return "image";
  if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(value)) return "video";
  if (/\.pdf(\?|$)/i.test(value)) return "document";
  // No recognizable extension (e.g. a bare blob URL) — trust the accept
  // attribute when it only names one kind of file.
  if (accept.includes("image") && !accept.includes(",")) return "image";
  if (accept.includes("video") && !accept.includes(",")) return "video";
  return "document";
}

const MAX_FILE_BYTES = 20 * 1024 * 1024; // hard limit per file
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

export function ImageField({
  id,
  name,
  label,
  defaultValue,
  accept = "image/*",
}: {
  id: string;
  name: string;
  label: string;
  defaultValue?: string | null;
  accept?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handlePickFile() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (file.size > MAX_FILE_BYTES) {
      setError("Fichier trop volumineux (20 Mo maximum).");
      e.target.value = "";
      return;
    }

    startTransition(async () => {
      try {
        const prepared = await compressImage(file);
        if (prepared.size <= SERVER_ACTION_BYTES) {
          const fd = new FormData();
          fd.set("file", prepared);
          const result = await uploadAdminFile(fd);
          if (result.success) setValue(result.url);
          else setError(result.message);
          return;
        }
        const safeName = prepared.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const blob = await upload(`admin-uploads/${Date.now()}-${safeName}`, prepared, {
          access: "public",
          handleUploadUrl: "/api/admin/blob-upload",
          contentType: prepared.type || undefined,
        });
        setValue(blob.url);
      } catch (err) {
        const detail = err instanceof Error ? err.message : "";
        setError(`Échec de l'envoi du fichier${detail ? ` : ${detail}` : ". Vérifiez votre connexion et réessayez."}`);
      }
    });

    e.target.value = "";
  }

  const kind = detectKind(value, accept);

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>

      {kind === "image" && (
        <div className="relative mb-2 h-32 w-32 overflow-hidden rounded-[10px] border border-border bg-muted">
          <Image
            src={value}
            alt=""
            fill
            sizes="128px"
            className="object-cover"
            unoptimized
          />
          <button
            type="button"
            onClick={() => setValue("")}
            aria-label="Retirer l'image"
            className="absolute right-1 top-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-foreground/70 text-white hover:bg-foreground"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {kind === "video" && (
        <div className="relative mb-2 w-full max-w-xs overflow-hidden rounded-[10px] border border-border bg-foreground">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video src={value} controls className="aspect-video w-full" />
          <button
            type="button"
            onClick={() => setValue("")}
            aria-label="Retirer la vidéo"
            className="absolute right-1 top-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-foreground/70 text-white hover:bg-foreground"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {kind === "document" && (
        <div className="mb-2 flex max-w-xs items-center gap-2 rounded-[10px] border border-border bg-muted px-3 py-2.5">
          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 truncate text-sm font-medium text-primary hover:underline"
          >
            Voir le fichier
          </a>
          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <button
            type="button"
            onClick={() => setValue("")}
            aria-label="Retirer le fichier"
            className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-card hover:text-destructive"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id={id}
            name={name}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-[10px] border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground transition-colors duration-200 placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <button
          type="button"
          onClick={handlePickFile}
          disabled={isPending}
          className={cn(
            "flex shrink-0 cursor-pointer items-center gap-2 rounded-[10px] border border-border bg-card px-3.5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          )}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Upload className="h-4 w-4" aria-hidden="true" />
          )}
          Importer
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
