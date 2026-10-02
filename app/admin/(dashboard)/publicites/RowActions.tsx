"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { deleteAd, restoreAd, toggleAdActive } from "@/app/actions/admin/ads";

export function DeleteAdButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (confirm("Déplacer cette publicité vers la corbeille ?")) {
          startTransition(() => deleteAd(id));
        }
      }}
    >
      Supprimer
    </Button>
  );
}

export function RestoreAdButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => restoreAd(id))}
    >
      Restaurer
    </Button>
  );
}

export function ToggleAdButton({ id, active }: { id: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => toggleAdActive(id, !active))}
    >
      {active ? "Désactiver" : "Activer"}
    </Button>
  );
}
