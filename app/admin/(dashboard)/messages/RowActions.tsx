"use client";

import { runAdminAction } from "@/lib/run-admin-action";
import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Trash2, RotateCcw, Mail, MailOpen } from "lucide-react";
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
        onClick={() => startTransition(() => runAdminAction(() => markMessageRead(id, !read)))}
      >
        {read ? (
          <Mail className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <MailOpen className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        {read ? "Marquer non lu" : "Marquer lu"}
      </Button>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={isPending}
        onClick={() => {
          if (confirm("Déplacer ce message vers la corbeille ?")) {
            startTransition(() => runAdminAction(() => deleteMessage(id)));
          }
        }}
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
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
      onClick={() => startTransition(() => runAdminAction(() => restoreMessage(id)))}
    >
      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
      Restaurer
    </Button>
  );
}
