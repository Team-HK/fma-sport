"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Upload, Link2, X, Loader2, Film, Plus } from "lucide-react";
import { Label } from "@/components/ui/Input";
import { uploadFile } from "@/lib/upload-client";

/**
 * Several photos or videos for one record. Submits the URLs as one hidden
 * field (one URL per line), the same convention as the other list fields.
 */
export function GalleryField({
  name,
  label,
  kind,
  defaultValue = [],
  hint,
}: {
  name: string;
  label: string;
  kind: "image" | "video";
  defaultValue?: string[];
  hint?: string;
}) {
  const [items, setItems] = useState<string[]>(defaultValue);
  const [link, setLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addUrl(url: string) {
    const clean = url.trim();
    if (!clean) return;
    setItems((current) => (current.includes(clean) ? current : [...current, clean]));
  }

  function addLink() {
    addUrl(link);
    setLink("");
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setError(null);

    startTransition(async () => {
      const failures: string[] = [];
      for (const file of files) {
        try {
          addUrl(await uploadFile(file));
        } catch (err) {
          failures.push(`${file.name} : ${err instanceof Error ? err.message : "échec de l'envoi"}`);
        }
      }
      if (failures.length > 0) setError(failures.join(" — "));
    });
  }

  const accept = kind === "image" ? "image/*" : "video/*";
  const placeholder =
    kind === "image" ? "https://... (lien d'une photo)" : "https://... (YouTube ou fichier vidéo)";

  return (
    <div>
      <Label>{label}</Label>
      <input type="hidden" name={name} value={items.join("\n")} />

      {items.length > 0 && (
        <ul className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {items.map((url) => (
            <li
              key={url}
              className="relative overflow-hidden rounded-[10px] border border-border bg-muted"
            >
              {kind === "image" ? (
                <div className="relative aspect-square">
                  <Image src={url} alt="" fill sizes="160px" className="object-cover" unoptimized />
                </div>
              ) : (
                <div className="flex aspect-video items-center gap-2 px-3">
                  <Film className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="truncate text-xs text-foreground">{url}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => setItems((current) => current.filter((u) => u !== url))}
                aria-label="Retirer"
                className="absolute right-1 top-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-foreground/70 text-white hover:bg-foreground"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addLink();
              }
            }}
            placeholder={placeholder}
            aria-label={`${label} : ajouter un lien`}
            className="w-full rounded-[10px] border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <button
          type="button"
          onClick={addLink}
          className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-[10px] border border-border bg-card px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Ajouter
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
          className="flex shrink-0 cursor-pointer items-center gap-2 rounded-[10px] border border-border bg-card px-3.5 py-2.5 text-sm font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
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
          multiple
          onChange={handleFiles}
          className="hidden"
        />
      </div>

      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
