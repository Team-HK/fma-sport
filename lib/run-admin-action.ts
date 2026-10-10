/**
 * Runs an admin server action from a button and tells the user when it fails
 * (database unavailable, session expired, ...) instead of failing silently.
 */
export async function runAdminAction(action: () => Promise<unknown>): Promise<void> {
  try {
    await action();
  } catch (error) {
    // Let Next.js redirects/navigation signals through untouched.
    const digest = (error as { digest?: unknown } | null)?.digest;
    if (typeof digest === "string" && digest.startsWith("NEXT_")) throw error;
    console.error("Admin action failed:", error);
    window.alert("L'action a échoué. Vérifiez votre connexion ou reconnectez-vous, puis réessayez.");
  }
}
