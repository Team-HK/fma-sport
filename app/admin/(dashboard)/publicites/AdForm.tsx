"use client";

import { useActionState, useEffect, useRef } from "react";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageField } from "@/components/ui/ImageField";
import { upsertAd, type AdActionState } from "@/app/actions/admin/ads";
import type { Advertisement } from "@prisma/client";

const initialState: AdActionState = { success: false, message: "" };
const FORMATS = ["BANNER", "IMAGE", "VIDEO", "SPONSORED_ARTICLE"];
const PLACEMENTS = ["HOME", "ACTUALITES", "ARTICLE", "VIDEOS", "TALENTS", "FOOTER"];

export function AdForm({ ad, onSuccess }: { ad?: Advertisement; onSuccess?: () => void }) {
  const action = upsertAd.bind(null, ad?.id ?? null);
  const [state, formAction, isPending] = useActionState(action, initialState);
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
        <Input id="title" name="title" defaultValue={ad?.title} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="format">Format *</Label>
          <select
            id="format"
            name="format"
            defaultValue={ad?.format ?? ""}
            required
            className="w-full rounded-[10px] border border-border bg-card px-4 py-3 text-base text-foreground"
          >
            <option value="">Sélectionner...</option>
            {FORMATS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="placement">Emplacement *</Label>
          <select
            id="placement"
            name="placement"
            defaultValue={ad?.placement ?? ""}
            required
            className="w-full rounded-[10px] border border-border bg-card px-4 py-3 text-base text-foreground"
          >
            <option value="">Sélectionner...</option>
            {PLACEMENTS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>
      <ImageField
        id="mediaUrl"
        name="mediaUrl"
        label="Média (image ou vidéo) *"
        defaultValue={ad?.mediaUrl}
        accept="image/*,video/*"
      />
      <div>
        <Label htmlFor="linkUrl">Lien de destination</Label>
        <Input id="linkUrl" name="linkUrl" defaultValue={ad?.linkUrl ?? ""} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Début d&apos;affichage</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={ad?.startDate ? new Date(ad.startDate).toISOString().slice(0, 10) : ""}
          />
        </div>
        <div>
          <Label htmlFor="endDate">Fin d&apos;affichage</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={ad?.endDate ? new Date(ad.endDate).toISOString().slice(0, 10) : ""}
          />
        </div>
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
        <input type="checkbox" name="active" value="true" defaultChecked={ad?.active ?? false} />
        Publicité active
      </label>
      <div className="flex justify-end border-t border-border pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
