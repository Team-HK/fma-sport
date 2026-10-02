"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { deleteVideo, restoreVideo } from "@/app/actions/admin/videos";

export function DeleteVideoButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (confirm("Déplacer cette vidéo vers la corbeille ?")) {
          startTransition(() => deleteVideo(id));
        }
      }}
    >
      Supprimer
    </Button>
  );
}

export function RestoreVideoButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => restoreVideo(id))}
    >
      Restaurer
    </Button>
  );
}
