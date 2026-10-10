"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageField } from "@/components/ui/ImageField";
import { VIDEO_CATEGORY_LABELS, VIDEO_PLATFORM_LABELS } from "@/lib/constants";
import { upsertVideo, type VideoActionState } from "@/app/actions/admin/videos";
import type { Video } from "@prisma/client";

const initialState: VideoActionState = { success: false, message: "" };
const PLATFORMS = Object.keys(VIDEO_PLATFORM_LABELS);

export function VideoForm({ video, players = [], onSuccess }: { video?: Video; players?: { id: string; name: string }[]; onSuccess?: () => void }) {
  const action = upsertVideo.bind(null, video?.id ?? null);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [platform, setPlatform] = useState(video?.platform ?? "");
  const didRun = useRef(false);

  useEffect(() => {
    if (state.success && didRun.current) onSuccess?.();
    didRun.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      {state.message && (
        <p role="alert" className={state.success ? "text-sm text-success" : "text-sm text-destructive"}>
          {state.message}
        </p>
      )}
      <div>
        <Label htmlFor="title">Titre *</Label>
        <Input id="title" name="title" defaultValue={video?.title} required />
      </div>
      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea id="description" name="description" rows={3} defaultValue={video?.description} required />
      </div>

      <div>
        <Label htmlFor="platform">Plateforme *</Label>
        <select
          id="platform"
          name="platform"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          required
          className="w-full rounded-[10px] border border-border bg-card px-4 py-3 text-base text-foreground"
        >
          <option value="">Sélectionner...</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {VIDEO_PLATFORM_LABELS[p]}
            </option>
          ))}
        </select>
      </div>

      {platform === "SITE" ? (
        <ImageField
          id="url"
          name="url"
          label="Fichier vidéo *"
          defaultValue={video?.url}
          accept="video/*"
        />
      ) : (
        <div>
          <Label htmlFor="url">Lien de la vidéo *</Label>
          <Input id="url" name="url" defaultValue={video?.url} required placeholder="https://..." />
        </div>
      )}

      {players.length > 0 && (
        <div>
          <Label htmlFor="playerId">Joueur associé (optionnel)</Label>
          <select
            id="playerId"
            name="playerId"
            defaultValue={video?.playerId ?? ""}
            className="w-full rounded-[10px] border border-border bg-card px-4 py-3 text-base text-foreground"
          >
            <option value="">Aucun</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-muted-foreground">
            La vidéo apparaîtra sur la fiche publique de ce joueur.
          </p>
        </div>
      )}

      <ImageField id="thumbnail" name="thumbnail" label="Miniature" defaultValue={video?.thumbnail} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Catégorie *</Label>
          <select
            id="category"
            name="category"
            defaultValue={video?.category ?? ""}
            required
            className="w-full rounded-[10px] border border-border bg-card px-4 py-3 text-base text-foreground"
          >
            <option value="">Sélectionner...</option>
            {Object.entries(VIDEO_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="status">Statut *</Label>
          <select
            id="status"
            name="status"
            defaultValue={video?.status ?? "DRAFT"}
            required
            className="w-full rounded-[10px] border border-border bg-card px-4 py-3 text-base text-foreground"
          >
            <option value="DRAFT">Brouillon</option>
            <option value="PUBLISHED">Publié</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end border-t border-border pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
