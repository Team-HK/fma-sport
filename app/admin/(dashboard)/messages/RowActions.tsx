"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { markMessageRead, deleteMessage, restoreMessage } from "@/app/actions/admin/messages";

export function MessageRowActions({ id, read }: { id: string; read: boolean }) {
  const [isPending, startTransition] = useTransition();
  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={isPending}
        onClick={() => startTransition(() => markMessageRead(id, !read))}
      >
        {read ? "Marquer non lu" : "Marquer lu"}
      </Button>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={isPending}
        onClick={() => {
          if (confirm("Déplacer ce message vers la corbeille ?")) {
            startTransition(() => deleteMessage(id));
          }
        }}
      >
        Supprimer
      </Button>
    </div>
  );
}

export function RestoreMessageButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => restoreMessage(id))}
    >
      Restaurer
    </Button>
  );
}
