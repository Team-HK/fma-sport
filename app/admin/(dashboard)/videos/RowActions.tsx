"use client";

import { runAdminAction } from "@/lib/run-admin-action";
import { confirmAndRun } from "@/lib/admin-dialog";
import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Trash2, RotateCcw } from "lucide-react";
import { deleteVideo, restoreVideo } from "@/app/actions/admin/videos";

export function DeleteVideoButton({ id }: { id: string }) {
  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      onClick={() =>
        confirmAndRun({
          message: "Déplacer cette vidéo vers la corbeille ?",
          run: () => deleteVideo(id),
          trashHref: "/admin/videos?corbeille=1",
        })
      }
    >
      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
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
      onClick={() => startTransition(() => runAdminAction(() => restoreVideo(id)))}
    >
      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
      Restaurer
    </Button>
  );
}
