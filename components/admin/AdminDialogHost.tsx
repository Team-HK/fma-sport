"use client";

import { useSyncExternalStore } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { closeAdminDialog, getAdminDialog, subscribeAdminDialog } from "@/lib/admin-dialog";

/** Renders the confirmation / error modal requested through lib/admin-dialog. */
export function AdminDialogHost() {
  const dialog = useSyncExternalStore(subscribeAdminDialog, getAdminDialog, () => null);
  if (!dialog) return null;

  const isConfirm = dialog.kind === "confirm";
  const destructive = isConfirm ? dialog.destructive : true;
  const Icon = isConfirm && dialog.confirmLabel.toLowerCase().includes("corbeille") ? Trash2 : AlertTriangle;

  return (
    <Modal open onClose={() => closeAdminDialog(false)} title={dialog.title} maxWidth="max-w-md">
      <div className="flex gap-4">
        <span
          className={
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full " +
            (destructive ? "bg-destructive-soft text-destructive" : "bg-muted text-primary")
          }
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="pt-1.5 text-sm leading-relaxed text-muted-foreground">{dialog.message}</p>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        {isConfirm ? (
          <>
            <Button type="button" variant="soft" size="sm" onClick={() => closeAdminDialog(false)}>
              Annuler
            </Button>
            <Button
              type="button"
              variant={dialog.destructive ? "destructive" : "primary"}
              size="sm"
              onClick={() => closeAdminDialog(true)}
            >
              {dialog.confirmLabel}
            </Button>
          </>
        ) : (
          <Button type="button" variant="primary" size="sm" onClick={() => closeAdminDialog(false)}>
            Fermer
          </Button>
        )}
      </div>
    </Modal>
  );
}
