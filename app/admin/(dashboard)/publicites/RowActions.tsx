"use client";

import { runAdminAction } from "@/lib/run-admin-action";
import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Trash2, RotateCcw, Power, PowerOff } from "lucide-react";
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
          startTransition(() => runAdminAction(() => deleteAd(id)));
        }
      }}
    >
      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
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
      onClick={() => startTransition(() => runAdminAction(() => restoreAd(id)))}
    >
      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
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
      onClick={() => startTransition(() => runAdminAction(() => toggleAdActive(id, !active)))}
    >
      {active ? (
        <PowerOff className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Power className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {active ? "Désactiver" : "Activer"}
    </Button>
  );
}
