"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Trash2, X, XCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  closeAdminDialog,
  dismissToast,
  getAdminUi,
  getAdminUiServer,
  submitAdminDialog,
  subscribeAdminUi,
} from "@/lib/admin-dialog";

/** Renders the confirmation / error modal and the toasts requested through lib/admin-dialog. */
export function AdminDialogHost() {
  const { dialog, toasts } = useSyncExternalStore(subscribeAdminUi, getAdminUi, getAdminUiServer);

  return (
    <>
      {dialog && <DialogView dialog={dialog} />}

      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[90] flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-xl"
          >
            {toast.tone === "success" ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
            ) : (
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{toast.message}</p>
              {toast.href && (
                <Link
                  href={toast.href}
                  onClick={() => dismissToast(toast.id)}
                  className="mt-1 inline-block text-sm font-semibold text-primary hover:underline"
                >
                  {toast.hrefLabel ?? "Voir"}
                </Link>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Fermer la notification"
              className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

function DialogView({ dialog }: { dialog: NonNullable<ReturnType<typeof getAdminUi>["dialog"]> }) {
  const isConfirm = dialog.kind === "confirm";
  const busy = isConfirm && dialog.busy;
  const destructive = isConfirm ? dialog.destructive : true;
  const toTrash = isConfirm && dialog.confirmLabel.toLowerCase().includes("corbeille");
  const Icon = toTrash ? Trash2 : AlertTriangle;

  return (
    <Modal
      open
      onClose={() => closeAdminDialog(false)}
      title={dialog.title}
      maxWidth="max-w-md"
    >
      <div className="flex gap-4">
        <span
          className={
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full " +
            (destructive ? "bg-destructive-soft text-destructive" : "bg-muted text-primary")
          }
        >
          {busy ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <Icon className="h-5 w-5" aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0 pt-1">
          <p className="text-sm font-medium leading-relaxed text-foreground">{dialog.message}</p>
          {isConfirm && dialog.detail && !busy && (
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{dialog.detail}</p>
          )}
          {busy && (
            <p role="status" className="mt-1.5 text-sm text-muted-foreground">
              Opération en cours, veuillez patienter…
            </p>
          )}
          {isConfirm && dialog.error && (
            <p role="alert" className="mt-2 rounded-lg bg-destructive-soft px-3 py-2 text-sm text-destructive-soft-foreground">
              {dialog.error}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        {isConfirm ? (
          <>
            <Button
              type="button"
              variant="soft"
              size="sm"
              disabled={busy}
              onClick={() => closeAdminDialog(false)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant={dialog.destructive ? "destructive" : "primary"}
              size="sm"
              disabled={busy}
              onClick={() => void submitAdminDialog()}
            >
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
              {busy ? "En cours…" : dialog.error ? "Réessayer" : dialog.confirmLabel}
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
