"use server";

import { createHash, randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { isPollOpen } from "@/lib/polls";

export type PollVoteState = { success: boolean; message: string };

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

// Shared mobile networks put many real voters behind one IP, so these caps are generous:
// they stop scripted stuffing, while the per-browser token is what enforces "one vote each".
const MAX_BALLOTS_PER_IP_PER_HOUR = 30;
const MAX_BALLOTS_PER_DEVICE = 10;
// A human can't read and fill a ranked ballot faster than this.
const MIN_FILL_MS = 3000;

function secureCookie() {
  return {
    maxAge: COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

function hash(...parts: string[]) {
  const salt = process.env.POLL_SALT ?? process.env.AUTH_SECRET ?? "fma-sport-poll";
  return createHash("sha256").update([...parts, salt].join("|")).digest("hex");
}

/**
 * Records one voter's ballot. Form fields are `q_<questionId>_<rank>` = optionId.
 * A question may be skipped entirely, but a started question must be complete
 * (exactly `picks` different candidates) and at least one question answered.
 * One ballot per browser (random token cookie). The IP is only used to cap abuse:
 * mobile networks put many real voters behind one IP, so it can't identify a voter.
 */
export async function submitPollVote(
  pollId: string,
  _prev: PollVoteState,
  formData: FormData
): Promise<PollVoteState> {
  // Honeypot: a hidden field real visitors never see, but form-filling bots do.
  if (String(formData.get("website") ?? "").length > 0) {
    return { success: false, message: "Votre vote n'a pas pu être enregistré." };
  }
  const startedAt = Number(formData.get("startedAt"));
  if (Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < MIN_FILL_MS) {
    return { success: false, message: "Prenez le temps de choisir vos réponses avant de valider." };
  }

  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    include: { questions: { include: { options: { select: { id: true } } } } },
  });
  if (!poll || poll.deletedAt || poll.status === "DRAFT") {
    return { success: false, message: "Ce sondage n'existe pas." };
  }
  if (!isPollOpen(poll)) {
    return { success: false, message: "Ce sondage est clos : les votes ne sont plus acceptés." };
  }

  const cookieStore = await cookies();
  const cookieName = `poll_voted_${poll.id}`;
  if (cookieStore.get(cookieName)) {
    return { success: false, message: "Vous avez déjà voté pour ce sondage." };
  }

  const requestHeaders = await headers();
  const ip = (requestHeaders.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || "unknown";
  const userAgent = requestHeaders.get("user-agent") ?? "";
  const ipHash = hash(poll.id, "ip", ip);
  const deviceHash = hash(poll.id, "device", ip, userAgent);
  const token = cookieStore.get("poll_voter")?.value ?? randomUUID();
  const ballotHash = hash(poll.id, "voter", token);

  const [recentFromIp, fromDevice] = await Promise.all([
    prisma.pollBallot.count({
      where: { pollId: poll.id, ipHash, createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
    }),
    prisma.pollBallot.count({ where: { pollId: poll.id, deviceHash } }),
  ]);
  if (recentFromIp >= MAX_BALLOTS_PER_IP_PER_HOUR || fromDevice >= MAX_BALLOTS_PER_DEVICE) {
    return { success: false, message: "Trop de votes depuis votre connexion. Merci de réessayer plus tard." };
  }

  const rows: { questionId: string; optionId: string; rank: number }[] = [];
  for (const question of poll.questions) {
    const validOptions = new Set(question.options.map((o) => o.id));
    const chosen: string[] = [];
    for (let rank = 1; rank <= question.picks; rank++) {
      const value = formData.get(`q_${question.id}_${rank}`);
      if (typeof value === "string" && value) chosen.push(value);
    }
    if (chosen.length === 0) continue;

    if (chosen.length !== question.picks) {
      return {
        success: false,
        message: `« ${question.title} » : choisissez ${question.picks} réponse${question.picks > 1 ? "s" : ""} (ou aucune pour passer cette question).`,
      };
    }
    if (new Set(chosen).size !== chosen.length || chosen.some((id) => !validOptions.has(id))) {
      return {
        success: false,
        message: `« ${question.title} » : chaque réponse ne peut être choisie qu'une seule fois.`,
      };
    }
    chosen.forEach((optionId, index) => {
      rows.push({ questionId: question.id, optionId, rank: question.ranked ? index + 1 : 1 });
    });
  }

  if (rows.length === 0) {
    return { success: false, message: "Choisissez au moins une réponse pour voter." };
  }

  try {
    await prisma.pollBallot.create({
      data: { pollId: poll.id, voterHash: ballotHash, ipHash, deviceHash, votes: { create: rows } },
    });
  } catch (error) {
    // Unique (pollId, voterHash): the same person voting again from another browser profile.
    if ((error as { code?: string }).code === "P2002") {
      cookieStore.set(cookieName, "1", secureCookie());
      return { success: false, message: "Vous avez déjà voté pour ce sondage." };
    }
    console.error("Failed to record poll vote:", error);
    return { success: false, message: "Une erreur est survenue. Merci de réessayer." };
  }

  const cookieOptions = secureCookie();
  cookieStore.set(cookieName, "1", cookieOptions);
  cookieStore.set("poll_voter", token, cookieOptions);
  return { success: true, message: "Merci ! Votre vote a bien été pris en compte." };
}
