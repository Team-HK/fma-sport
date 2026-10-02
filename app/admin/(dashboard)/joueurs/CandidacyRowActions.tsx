"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { updateCandidacyStatus, createPlayerFromCandidacy } from "@/app/actions/admin/players";

export function CandidacyRowActions({ id, status }: { id: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      {status !== "ACCEPTED" && (
        <Button
          type="button"
          size="sm"
          disabled={isPending}
          onClick={() => startTransition(() => createPlayerFromCandidacy(id))}
        >
          Accepter + créer profil
        </Button>
      )}
      {status !== "INFO_REQUESTED" && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={isPending}
          onClick={() => {
            const note = window.prompt(
              "Quelles informations souhaitez-vous demander au candidat ?"
            );
            if (note === null) return;
            startTransition(() => updateCandidacyStatus(id, "INFO_REQUESTED", note || undefined));
          }}
        >
          Demander infos
        </Button>
      )}
      {status !== "REJECTED" && (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={isPending}
          onClick={() => {
            const note = window.prompt("Motif du refus (facultatif, visible en interne) :");
            if (note === null) return;
            startTransition(() => updateCandidacyStatus(id, "REJECTED", note || undefined));
          }}
        >
          Refuser
        </Button>
      )}
    </div>
  );
}
