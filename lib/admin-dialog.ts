/**
 * Tiny imperative store behind <AdminDialogHost />. Any admin button can open a
 * styled confirmation (with a loading state and the real result of the action),
 * an error dialog, or a toast, without threading UI state through components.
 */
export type AdminToast = {
  id: number;
  tone: "success" | "error";
  message: string;
  href?: string;
  hrefLabel?: string;
};

export type AdminDialog =
  | {
      kind: "confirm";
      title: string;
      message: string;
      detail?: string;
      confirmLabel: string;
      destructive: boolean;
      busy: boolean;
      error: string | null;
      /** When set, the dialog runs it on confirm and shows a loading state. */
      execute?: () => Promise<TaskResult | void>;
      successMessage?: string;
      trashHref?: string;
      resolve: (accepted: boolean) => void;
    }
  | { kind: "error"; title: string; message: string };

export type TaskResult = { success?: boolean; message?: string };

export type AdminUiState = { dialog: AdminDialog | null; toasts: AdminToast[] };

let state: AdminUiState = { dialog: null, toasts: [] };
const listeners = new Set<() => void>();
let nextToastId = 1;

function set(next: Partial<AdminUiState>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

export function subscribeAdminUi(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getAdminUi() {
  return state;
}

const SERVER_SNAPSHOT: AdminUiState = { dialog: null, toasts: [] };
export function getAdminUiServer() {
  return SERVER_SNAPSHOT;
}

export function closeAdminDialog(accepted = false) {
  const { dialog } = state;
  if (dialog?.kind === "confirm") {
    if (dialog.busy) return;
    dialog.resolve(accepted);
  }
  set({ dialog: null });
}

export function dismissToast(id: number) {
  set({ toasts: state.toasts.filter((t) => t.id !== id) });
}

export function pushToast(toast: Omit<AdminToast, "id">, durationMs = 5000) {
  const id = nextToastId++;
  set({ toasts: [...state.toasts, { ...toast, id }] });
  setTimeout(() => dismissToast(id), durationMs);
}

export function notifyError(message: string, title = "Une erreur est survenue") {
  const { dialog } = state;
  if (dialog?.kind === "confirm" && !dialog.busy) dialog.resolve(false);
  set({ dialog: { kind: "error", title, message } });
}

type ConfirmOptions = {
  title?: string;
  confirmLabel?: string;
  destructive?: boolean;
};

function describe(message: string, options: ConfirmOptions) {
  const toTrash = /^Déplacer/i.test(message);
  return {
    title: options.title ?? (toTrash ? "Mettre à la corbeille" : "Confirmation"),
    confirmLabel: options.confirmLabel ?? (toTrash ? "Mettre à la corbeille" : "Confirmer"),
    destructive: options.destructive ?? true,
    detail: toTrash
      ? "Il ne sera plus visible sur le site. Vous pourrez le restaurer depuis la corbeille."
      : undefined,
  };
}

/** Resolves true when the admin confirms, false when they cancel or dismiss. */
export function confirmDialog(message: string, options: ConfirmOptions = {}): Promise<boolean> {
  return new Promise((resolve) => {
    const { dialog } = state;
    if (dialog?.kind === "confirm" && !dialog.busy) dialog.resolve(false);
    set({
      dialog: {
        kind: "confirm",
        message,
        busy: false,
        error: null,
        resolve,
        ...describe(message, options),
      },
    });
  });
}

/**
 * Asks for confirmation, then runs `run` while the dialog shows a loading
 * state. On success the dialog closes and a toast reports the real result
 * (the message returned by the server action); on failure the dialog stays
 * open with the error so the admin can retry.
 */
export function confirmAndRun(
  options: ConfirmOptions & {
    message: string;
    run: () => Promise<TaskResult | void>;
    successMessage?: string;
    /** List URL showing the trash, offered as a link in the success toast. */
    trashHref?: string;
  }
): void {
  const { dialog } = state;
  if (dialog?.kind === "confirm" && !dialog.busy) dialog.resolve(false);
  set({
    dialog: {
      kind: "confirm",
      message: options.message,
      busy: false,
      error: null,
      execute: options.run,
      successMessage: options.successMessage,
      trashHref: options.trashHref,
      resolve: () => {},
      ...describe(options.message, options),
    },
  });
}

/** Called by the dialog's confirm button. */
export async function submitAdminDialog() {
  const { dialog } = state;
  if (dialog?.kind !== "confirm" || dialog.busy) return;

  if (!dialog.execute) {
    dialog.resolve(true);
    set({ dialog: null });
    return;
  }

  set({ dialog: { ...dialog, busy: true, error: null } });
  try {
    const result = await dialog.execute();
    if (result && result.success === false) {
      throw new Error(result.message || "L'action a échoué.");
    }
    set({ dialog: null });
    pushToast({
      tone: "success",
      message: result?.message || dialog.successMessage || "Action effectuée.",
      href: dialog.trashHref,
      hrefLabel: dialog.trashHref ? "Voir la corbeille" : undefined,
    });
  } catch (error) {
    const digest = (error as { digest?: unknown } | null)?.digest;
    if (typeof digest === "string" && digest.startsWith("NEXT_")) {
      set({ dialog: null });
      throw error;
    }
    console.error("Admin action failed:", error);
    const current = state.dialog;
    if (current?.kind === "confirm") {
      set({
        dialog: {
          ...current,
          busy: false,
          error:
            error instanceof Error && error.message
              ? "L'action n'a pas abouti : " + error.message
              : "L'action n'a pas abouti. Vérifiez votre connexion puis réessayez.",
        },
      });
    }
  }
}
