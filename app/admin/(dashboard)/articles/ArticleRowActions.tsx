"use client";

import { runAdminAction } from "@/lib/run-admin-action";
import { confirmAndRun } from "@/lib/admin-dialog";
import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Trash2, RotateCcw, Eye, EyeOff } from "lucide-react";
import { deleteArticle, restoreArticle, toggleArticleStatus } from "@/app/actions/admin/articles";

export function DeleteArticleButton({ id }: { id: string }) {

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      onClick={() =>
        confirmAndRun({
          message: "Déplacer cet article vers la corbeille ?",
          run: () => deleteArticle(id),
          trashHref: "/admin/articles?corbeille=1",
        })
      }
    >
      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      Supprimer
    </Button>
  );
}

export function RestoreArticleButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => runAdminAction(() => restoreArticle(id)))}
    >
      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
      Restaurer
    </Button>
  );
}

export function TogglePublishButton({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();
  const isPublished = status === "PUBLISHED";

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={isPending}
      onClick={() =>
        startTransition(() => runAdminAction(() => toggleArticleStatus(id, isPublished ? "DRAFT" : "PUBLISHED")))
      }
    >
      {isPublished ? (
        <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {isPublished ? "Dépublier" : "Publier"}
    </Button>
  );
}
