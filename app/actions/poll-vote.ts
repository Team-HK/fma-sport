"use server";

import { createHash, randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { isPollOpen, normalizeContact } from "@/lib/poll-rules";

export type PollVoteState = { success: boolean; message: string };

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const MAX_WRITE_INS_PER_BALLOT = 3;
const MAX_WRITE_INS_PER_QUESTION = 100;
const WRITE_IN_PREFIX = "new:";

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

/** Trims, collapses spaces and strips control characters from a voter-typed answer. */
function cleanWriteIn(raw: string) {
  // eslint-disable-next-line no-control-regex
  return raw.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
}

/**
 * Records one voter's ballot. Form fields are `q_<questionId>_<rank>` = optionId
 * (or `new:<text>` for a write-in answer when the question allows it) and, when the
 * poll asks for it, `contact` (e-mail or phone).
 *
 * Every rule comes from the poll's back-office settings: a question may be skipped
 * entirely but a started one must be complete; one ballot per browser (random token
 * cookie) and per contact when identification is required; the per-device and
 * per-connection caps and the minimum fill time are the poll's own values (mobile
 * networks put many real voters behind one IP, so the IP can't identify a voter).
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

  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    include: { questions: { include: { options: { select: { id: true, name: true } } } } },
  });
  if (!poll || poll.deletedAt || poll.status === "DRAFT") {
    return { success: false, message: "Ce sondage n'existe pas." };
  }
  if (!isPollOpen(poll)) {
    return { success: false, message: "Ce sondage est clos : les votes ne sont plus acceptés." };
  }

  const startedAt = Number(formData.get("startedAt"));
  if (
    poll.minFillSeconds > 0 &&
    Number.isFinite(startedAt) &&
    startedAt > 0 &&
    Date.now() - startedAt < poll.minFillSeconds * 1000
  ) {
    return { success: false, message: "Prenez le temps de choisir vos réponses avant de valider." };
  }

  const cookieStore = await cookies();
  const cookieName = `poll_voted_${poll.id}`;
  if (cookieStore.get(cookieName)) {
    return { success: false, message: "Vous avez déjà voté pour ce sondage." };
  }

  // Identification required by the poll (e-mail or phone): one vote per contact.
  let contactHash: string | null = null;
  if (poll.identification !== "NONE") {
    const contact = normalizeContact(poll.identification, String(formData.get("contact") ?? ""));
    if (!contact) {
      return {
        success: false,
        message:
          poll.identification === "EMAIL"
            ? "Saisissez une adresse e-mail valide pour voter."
            : "Saisissez un numéro de téléphone valide pour voter.",
      };
    }
    contactHash = hash(poll.id, "contact", contact);
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
  if (recentFromIp >= poll.maxBallotsPerIpPerHour || fromDevice >= poll.maxBallotsPerDevice) {
    return { success: false, message: "Trop de votes depuis votre connexion. Merci de réessayer plus tard." };
  }

  // Resolve every pick to an existing option, or to a write-in answer to create.
  type Pick = { questionId: string; rank: number; optionId?: string; writeIn?: string };
  const picks: Pick[] = [];
  let writeInCount = 0;

  for (const question of poll.questions) {
    const byId = new Set(question.options.map((o) => o.id));
    const byName = new Map(question.options.map((o) => [o.name.toLowerCase(), o.id]));
    const chosen: { optionId?: string; writeIn?: string }[] = [];

    for (let rank = 1; rank <= question.picks; rank++) {
      const value = formData.get(`q_${question.id}_${rank}`);
      if (typeof value !== "string" || !value) continue;
      if (value.startsWith(WRITE_IN_PREFIX)) {
        if (!question.allowWriteIn) {
          return { success: false, message: `« ${question.title} » n'accepte pas de réponse libre.` };
        }
        const text = cleanWriteIn(value.slice(WRITE_IN_PREFIX.length));
        if (text.length < 2) {
          return { success: false, message: `« ${question.title} » : votre réponse libre est trop courte.` };
        }
        const existing = byName.get(text.toLowerCase());
        if (existing) chosen.push({ optionId: existing });
        else {
          writeInCount++;
          chosen.push({ writeIn: text });
        }
      } else {
        if (!byId.has(value)) {
          return { success: false, message: `« ${question.title} » : réponse invalide.` };
        }
        chosen.push({ optionId: value });
      }
    }
    if (chosen.length === 0) continue;

    if (chosen.length !== question.picks) {
      return {
        success: false,
        message: `« ${question.title} » : choisissez ${question.picks} réponse${question.picks > 1 ? "s" : ""} (ou aucune pour passer cette question).`,
      };
    }
    const keys = chosen.map((c) => c.optionId ?? `new:${c.writeIn!.toLowerCase()}`);
    if (new Set(keys).size !== keys.length) {
      return { success: false, message: `« ${question.title} » : chaque réponse ne peut être choisie qu'une seule fois.` };
    }
    chosen.forEach((c, index) => {
      picks.push({ questionId: question.id, rank: question.ranked ? index + 1 : 1, ...c });
    });
  }

  if (picks.length === 0) {
    return { success: false, message: "Choisissez au moins une réponse pour voter." };
  }
  if (writeInCount > MAX_WRITE_INS_PER_BALLOT) {
    return { success: false, message: `Vous pouvez proposer ${MAX_WRITE_INS_PER_BALLOT} réponses libres au maximum.` };
  }
  for (const questionId of new Set(picks.filter((p) => p.writeIn).map((p) => p.questionId))) {
    const existing = await prisma.pollOption.count({ where: { questionId, custom: true } });
    if (existing >= MAX_WRITE_INS_PER_QUESTION) {
      return { success: false, message: "Cette question ne peut plus recevoir de nouvelles réponses libres." };
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      const ballot = await tx.pollBallot.create({
        data: { pollId: poll.id, voterHash: ballotHash, ipHash, deviceHash, contactHash },
      });
      const created = new Map<string, string>();
      for (const pick of picks) {
        let optionId = pick.optionId;
        if (!optionId) {
          const key = `${pick.questionId}|${pick.writeIn!.toLowerCase()}`;
          optionId = created.get(key);
          if (!optionId) {
            const option = await tx.pollOption.create({
              data: { questionId: pick.questionId, name: pick.writeIn!, custom: true, order: 1000 },
            });
            optionId = option.id;
            created.set(key, optionId);
          }
        }
        await tx.pollVote.create({
          data: { ballotId: ballot.id, questionId: pick.questionId, optionId, rank: pick.rank },
        });
      }
    });
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "P2002") {
      const target = String((error as { meta?: { target?: unknown } }).meta?.target ?? "");
      cookieStore.set(cookieName, "1", secureCookie());
      return {
        success: false,
        message: target.includes("contactHash")
          ? `Ce ${poll.identification === "EMAIL" ? "e-mail" : "numéro"} a déjà voté pour ce sondage.`
          : "Vous avez déjà voté pour ce sondage.",
      };
    }
    console.error("Failed to record poll vote:", error);
    return { success: false, message: "Une erreur est survenue. Merci de réessayer." };
  }

  const cookieOptions = secureCookie();
  cookieStore.set(cookieName, "1", cookieOptions);
  cookieStore.set("poll_voter", token, cookieOptions);
  return { success: true, message: "Merci ! Votre vote a bien été pris en compte." };
}
