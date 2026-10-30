"use client";

import { useTransition } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { confirmAndRun } from "@/lib/admin-dialog";
import { runAdminAction } from "@/lib/run-admin-action";
import { deletePoll, resetPollVotes, restorePoll } from "@/app/actions/admin/polls";

export function DeletePollButton({ id }: { id: string }) {
  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      onClick={() =>
        confirmAndRun({
          message: "Déplacer ce sondage vers la corbeille ?",
          run: () => deletePoll(id),
          trashHref: "/admin/sondages?corbeille=1",
        })
      }
    >
      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      Supprimer
    </Button>
  );
}

export function RestorePollButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => runAdminAction(() => restorePoll(id)))}
    >
      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
      Restaurer
    </Button>
  );
}

export function ResetVotesButton({ id, votes }: { id: string; votes: number }) {
  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={votes === 0}
      onClick={() =>
        confirmAndRun({
          title: "Remettre les votes à zéro",
          confirmLabel: "Supprimer les votes",
          message: `Supprimer définitivement les ${votes} vote${votes > 1 ? "s" : ""} de ce sondage ? Cette action est irréversible.`,
          run: () => resetPollVotes(id),
        })
      }
    >
      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
      Remettre les votes à zéro
    </Button>
  );
}
