// Pure poll rules, safe to import from client components (no database access).

export type PollResultsVisibility = "ALWAYS" | "AFTER_VOTE" | "AFTER_CLOSE" | "NEVER";
export type PollIdentification = "NONE" | "EMAIL" | "PHONE";

type PollWindow = { status: string; startsAt: Date | null; endsAt: Date | null };

/** A poll accepts votes while it is OPEN and inside its optional start/end dates. */
export function isPollOpen(poll: PollWindow, now = new Date()): boolean {
  if (poll.status !== "OPEN") return false;
  if (poll.startsAt && poll.startsAt > now) return false;
  if (poll.endsAt && poll.endsAt < now) return false;
  return true;
}

/**
 * Whether the standings may be shown to a visitor, following the poll's
 * back-office setting. A closed poll shows its final standings unless the
 * admin chose NEVER.
 */
export function canSeeResults(
  visibility: PollResultsVisibility,
  state: { open: boolean; voted: boolean }
): boolean {
  if (visibility === "NEVER") return false;
  if (visibility === "ALWAYS") return true;
  if (!state.open) return true;
  return visibility === "AFTER_VOTE" && state.voted;
}

export const RESULTS_VISIBILITY_LABELS: Record<PollResultsVisibility, string> = {
  ALWAYS: "Toujours visibles, même avant de voter",
  AFTER_VOTE: "Visibles après le vote du visiteur",
  AFTER_CLOSE: "Visibles seulement à la clôture du sondage",
  NEVER: "Jamais visibles (réservés à l'administration)",
};

export const IDENTIFICATION_LABELS: Record<PollIdentification, string> = {
  NONE: "Aucune (vote anonyme)",
  EMAIL: "Adresse e-mail obligatoire",
  PHONE: "Numéro de téléphone obligatoire",
};

/** Normalised contact used to detect a second vote from the same person. */
export function normalizeContact(kind: Exclude<PollIdentification, "NONE">, raw: string): string | null {
  const value = raw.trim();
  if (kind === "EMAIL") {
    const email = value.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 120) return null;
    // "nom+1@gmail.com" and "n.o.m@gmail.com" reach the same inbox: count them as one voter.
    const [local, domain] = email.split("@");
    const base = local.split("+")[0];
    const gmail = domain === "gmail.com" || domain === "googlemail.com";
    return `${gmail ? base.replace(/\./g, "") : base}@${gmail ? "gmail.com" : domain}`;
  }
  const digits = value.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return null;
  // "+221 77 682 36 28", "00221776823628" and "776823628" are the same person: compare the
  // subscriber number (last 9 digits) so the country-code prefix can't be used to vote twice.
  return digits.length > 9 ? digits.slice(-9) : digits;
}
