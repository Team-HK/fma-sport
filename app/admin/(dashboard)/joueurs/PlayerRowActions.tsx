"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { deletePlayer, restorePlayer } from "@/app/actions/admin/players";

export function DeletePlayerButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (confirm("Déplacer ce profil vers la corbeille ?")) {
          startTransition(() => deletePlayer(id));
        }
      }}
    >
      Supprimer
    </Button>
  );
}

export function RestorePlayerButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => restorePlayer(id))}
    >
      Restaurer
    </Button>
  );
}
