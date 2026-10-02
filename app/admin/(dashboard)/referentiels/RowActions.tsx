"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Trash2, RotateCcw } from "lucide-react";
import { deleteHeroSlide, restoreHeroSlide } from "@/app/actions/admin/hero-slides";

export function DeleteHeroSlideButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (confirm("Déplacer cette diapositive vers la corbeille ?")) {
          startTransition(() => deleteHeroSlide(id));
        }
      }}
    >
      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      Supprimer
    </Button>
  );
}

export function RestoreHeroSlideButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => restoreHeroSlide(id))}
    >
      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
      Restaurer
    </Button>
  );
}
