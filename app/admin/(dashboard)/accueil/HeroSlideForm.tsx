"use client";

import { useActionState, useEffect, useRef } from "react";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageField } from "@/components/ui/ImageField";
import { upsertHeroSlide, type HeroSlideActionState } from "@/app/actions/admin/hero-slides";
import type { HeroSlide } from "@prisma/client";

const initialState: HeroSlideActionState = { success: false, message: "" };

export function HeroSlideForm({ slide, onSuccess }: { slide?: HeroSlide; onSuccess?: () => void }) {
  const action = upsertHeroSlide.bind(null, slide?.id ?? null);
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

      <ImageField
        id="imageUrl"
        name="imageUrl"
        label="Image de fond *"
        defaultValue={slide?.imageUrl}
        accept="image/*"
      />

      <div>
        <Label htmlFor="title">Titre affiché</Label>
        <Input
          id="title"
          name="title"
          defaultValue={slide?.title ?? ""}
          placeholder="Laisser vide pour garder le logo FMA SPORT"
        />
      </div>
      <div>
        <Label htmlFor="subtitle">Sous-titre / accroche</Label>
        <Input id="subtitle" name="subtitle" defaultValue={slide?.subtitle ?? ""} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ctaLabel">Texte du bouton</Label>
          <Input id="ctaLabel" name="ctaLabel" defaultValue={slide?.ctaLabel ?? ""} />
        </div>
        <div>
          <Label htmlFor="ctaHref">Lien du bouton</Label>
          <Input
            id="ctaHref"
            name="ctaHref"
            defaultValue={slide?.ctaHref ?? ""}
            placeholder="/actualites"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="order">Ordre d&apos;affichage</Label>
          <Input
            id="order"
            name="order"
            type="number"
            defaultValue={slide?.order ?? 0}
          />
        </div>
        <label className="flex cursor-pointer items-center gap-2 self-end pb-3 text-sm text-foreground">
          <input type="checkbox" name="active" value="true" defaultChecked={slide?.active ?? true} />
          Diapositive active
        </label>
      </div>

      <div className="flex justify-end border-t border-border pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
