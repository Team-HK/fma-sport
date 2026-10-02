"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { deleteEvent, restoreEvent } from "@/app/actions/admin/events";

export function DeleteEventButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (confirm("Déplacer cet événement vers la corbeille ?")) {
          startTransition(() => deleteEvent(id));
        }
      }}
    >
      Supprimer
    </Button>
  );
}

export function RestoreEventButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => restoreEvent(id))}
    >
      Restaurer
    </Button>
  );
}
