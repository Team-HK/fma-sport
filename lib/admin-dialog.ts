/**
 * Tiny imperative store behind <AdminDialogHost />: lets any admin button open
 * a styled confirmation or error modal (instead of window.confirm / alert)
 * without threading dialog state through every component.
 */
export type AdminDialog =
  | {
      kind: "confirm";
      title: string;
      message: string;
      confirmLabel: string;
      destructive: boolean;
      resolve: (accepted: boolean) => void;
    }
  | { kind: "error"; title: string; message: string };

let current: AdminDialog | null = null;
const listeners = new Set<() => void>();

function set(next: AdminDialog | null) {
  current = next;
  listeners.forEach((l) => l());
}

export function subscribeAdminDialog(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getAdminDialog() {
  return current;
}

export function closeAdminDialog(accepted = false) {
  if (current?.kind === "confirm") current.resolve(accepted);
  set(null);
}

/** Resolves true when the admin confirms, false when they cancel or dismiss. */
export function confirmDialog(
  message: string,
  options: { title?: string; confirmLabel?: string; destructive?: boolean } = {}
): Promise<boolean> {
  const toTrash = /^Déplacer/i.test(message);
  return new Promise((resolve) => {
    if (current?.kind === "confirm") current.resolve(false);
    set({
      kind: "confirm",
      title: options.title ?? (toTrash ? "Mettre à la corbeille" : "Confirmation"),
      message,
      confirmLabel: options.confirmLabel ?? (toTrash ? "Mettre à la corbeille" : "Confirmer"),
      destructive: options.destructive ?? true,
      resolve,
    });
  });
}

export function notifyError(message: string, title = "Une erreur est survenue") {
  if (current?.kind === "confirm") current.resolve(false);
  set({ kind: "error", title, message });
}
