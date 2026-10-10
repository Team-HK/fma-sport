import { notifyError, pushToast, type TaskResult } from "@/lib/admin-dialog";

/**
 * Runs an admin server action from a button. Reports the real outcome: a toast
 * with the message the server returned, or an error dialog when it fails
 * (database unavailable, session expired, ...) instead of failing silently.
 */
export async function runAdminAction(action: () => Promise<TaskResult | void | unknown>): Promise<void> {
  try {
    const result = (await action()) as TaskResult | undefined;
    if (result && typeof result === "object" && "success" in result) {
      if (result.success === false) {
        notifyError(result.message || "L'action n'a pas pu aboutir.");
      } else if (result.message) {
        pushToast({ tone: "success", message: result.message });
      }
    }
  } catch (error) {
    // Let Next.js redirects/navigation signals through untouched.
    const digest = (error as { digest?: unknown } | null)?.digest;
    if (typeof digest === "string" && digest.startsWith("NEXT_")) throw error;
    console.error("Admin action failed:", error);
    notifyError("L'action n'a pas pu aboutir. Vérifiez votre connexion ou reconnectez-vous, puis réessayez.");
  }
}
