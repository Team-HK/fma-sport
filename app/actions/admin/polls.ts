"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { slugify } from "@/lib/utils";
import { logAdminAction } from "@/lib/audit-log";
import { expirePublicContent } from "@/lib/cache";

const optionSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1),
  club: z.string().trim().optional(),
  photo: z.string().trim().optional(),
});

const questionSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().trim().min(1),
    picks: z.coerce.number().int().min(1).max(20),
    ranked: z.boolean(),
    allowWriteIn: z.boolean().default(false),
    options: z.array(optionSchema).min(2),
  })
  .refine((q) => q.options.length >= q.picks, { message: "picks" });

const pollSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  status: z.enum(["DRAFT", "OPEN", "CLOSED"]),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  resultsVisibility: z.enum(["ALWAYS", "AFTER_VOTE", "AFTER_CLOSE", "NEVER"]),
  identification: z.enum(["NONE", "EMAIL", "PHONE"]),
  maxBallotsPerDevice: z.coerce.number().int().min(1).max(1000),
  maxBallotsPerIpPerHour: z.coerce.number().int().min(1).max(10000),
  minFillSeconds: z.coerce.number().int().min(0).max(60),
  // When the form was opened: options voters added since then must not be deleted by this save.
  loadedAt: z.string().optional(),
  questions: z.array(questionSchema).min(1),
});

export type PollActionState = { success: boolean; message: string };

async function uniqueSlug(title: string, ignoreId?: string) {
  const base = slugify(title) || "sondage";
  let candidate = base;
  for (let n = 2; ; n++) {
    const clash = await prisma.poll.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!clash || clash.id === ignoreId) return candidate;
    candidate = `${base}-${n}`;
  }
}

function refreshPublic() {
  revalidatePath("/admin/sondages");
  revalidatePath("/", "layout");
  expirePublicContent();
}

export async function savePoll(
  id: string | null,
  _prev: PollActionState,
  formData: FormData
): Promise<PollActionState> {
  const admin = await requireAdmin();

  let structure: unknown;
  try {
    structure = JSON.parse(String(formData.get("structure") ?? "[]"));
  } catch {
    return { success: false, message: "Les questions n'ont pas pu être lues. Rechargez la page." };
  }

  const parsed = pollSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    coverImage: formData.get("coverImage") || undefined,
    status: formData.get("status"),
    startsAt: formData.get("startsAt") || undefined,
    endsAt: formData.get("endsAt") || undefined,
    resultsVisibility: formData.get("resultsVisibility"),
    identification: formData.get("identification"),
    maxBallotsPerDevice: formData.get("maxBallotsPerDevice") || 10,
    maxBallotsPerIpPerHour: formData.get("maxBallotsPerIpPerHour") || 30,
    minFillSeconds: formData.get("minFillSeconds") ?? 3,
    loadedAt: formData.get("loadedAt") || undefined,
    questions: structure,
  });
  if (!parsed.success) {
    const tooFew = parsed.error.issues.some((i) => i.message === "picks");
    return {
      success: false,
      message: tooFew
        ? "Une question a moins de candidats que de choix demandés."
        : "Vérifiez le titre, et que chaque question a un intitulé et au moins 2 candidats.",
    };
  }
  const data = parsed.data;
  const startsAt = data.startsAt ? new Date(data.startsAt) : null;
  const endsAt = data.endsAt ? new Date(data.endsAt) : null;
  if (startsAt && endsAt && endsAt <= startsAt) {
    return { success: false, message: "La date de fin doit être après la date de début." };
  }

  const pollFields = {
    title: data.title,
    description: data.description || null,
    coverImage: data.coverImage || null,
    status: data.status,
    startsAt,
    endsAt,
    resultsVisibility: data.resultsVisibility,
    identification: data.identification,
    maxBallotsPerDevice: data.maxBallotsPerDevice,
    maxBallotsPerIpPerHour: data.maxBallotsPerIpPerHour,
    minFillSeconds: data.minFillSeconds,
  };
  const loadedAt = data.loadedAt ? new Date(data.loadedAt) : null;

  let pollId = id;
  try {
    pollId = await prisma.$transaction(async (tx) => {
      if (!id) {
        const created = await tx.poll.create({
          data: {
            ...pollFields,
            slug: await uniqueSlug(data.title),
            questions: {
              create: data.questions.map((q, qi) => ({
                title: q.title,
                picks: q.picks,
                ranked: q.ranked,
                allowWriteIn: q.allowWriteIn,
                order: qi,
                options: {
                  create: q.options.map((o, oi) => ({
                    name: o.name,
                    club: o.club || null,
                    photo: o.photo || null,
                    order: oi,
                  })),
                },
              })),
            },
          },
        });
        return created.id;
      }

      await tx.poll.update({ where: { id }, data: pollFields });
      const existing = await tx.pollQuestion.findMany({
        where: { pollId: id },
        include: { options: { select: { id: true } } },
      });
      const existingIds = new Set(existing.map((q) => q.id));
      const keptQuestionIds = new Set(data.questions.map((q) => q.id).filter((v): v is string => !!v && existingIds.has(v)));

      // Removed questions (and, through the cascade, their candidates and votes).
      await tx.pollQuestion.deleteMany({
        where: { pollId: id, id: { notIn: [...keptQuestionIds] } },
      });

      for (const [qi, q] of data.questions.entries()) {
        const current = q.id && existingIds.has(q.id) ? existing.find((e) => e.id === q.id) : undefined;
        if (!current) {
          await tx.pollQuestion.create({
            data: {
              pollId: id,
              title: q.title,
              picks: q.picks,
              ranked: q.ranked,
              allowWriteIn: q.allowWriteIn,
              order: qi,
              options: {
                create: q.options.map((o, oi) => ({
                  name: o.name,
                  club: o.club || null,
                  photo: o.photo || null,
                  order: oi,
                })),
              },
            },
          });
          continue;
        }

        await tx.pollQuestion.update({
          where: { id: current.id },
          data: { title: q.title, picks: q.picks, ranked: q.ranked, allowWriteIn: q.allowWriteIn, order: qi },
        });
        const currentOptionIds = new Set(current.options.map((o) => o.id));
        const keptOptionIds = q.options.map((o) => o.id).filter((v): v is string => !!v && currentOptionIds.has(v));
        await tx.pollOption.deleteMany({
          where: {
            questionId: current.id,
            id: { notIn: keptOptionIds },
            // Answers proposed by voters after this form was opened are kept.
            ...(loadedAt ? { createdAt: { lte: loadedAt } } : {}),
          },
        });
        for (const [oi, o] of q.options.entries()) {
          const fields = { name: o.name, club: o.club || null, photo: o.photo || null, order: oi };
          if (o.id && currentOptionIds.has(o.id)) {
            await tx.pollOption.update({ where: { id: o.id }, data: fields });
          } else {
            await tx.pollOption.create({ data: { ...fields, questionId: current.id } });
          }
        }
      }
      return id;
    });

    await logAdminAction({
      adminId: admin.id,
      action: id ? "update" : "create",
      entityType: "poll",
      entityId: pollId ?? undefined,
    });
  } catch (error) {
    console.error("Failed to save poll:", error);
    return { success: false, message: "Une erreur est survenue lors de l'enregistrement." };
  }

  refreshPublic();
  if (!id) redirect(`/admin/sondages/${pollId}`);
  return { success: true, message: "Sondage enregistré." };
}

export async function deletePoll(id: string) {
  const admin = await requireAdmin();
  await prisma.poll.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAdminAction({ adminId: admin.id, action: "delete", entityType: "poll", entityId: id });
  refreshPublic();
  return {
    success: true as const,
    message: "Sondage déplacé dans la corbeille. Il n'est plus visible sur le site.",
  };
}

export async function restorePoll(id: string) {
  const admin = await requireAdmin();
  await prisma.poll.update({ where: { id }, data: { deletedAt: null } });
  await logAdminAction({ adminId: admin.id, action: "restore", entityType: "poll", entityId: id });
  refreshPublic();
  return { success: true as const, message: "Sondage restauré." };
}

/** Wipes every ballot of a poll (e.g. after test votes) — the poll itself is kept. */
export async function resetPollVotes(id: string) {
  const admin = await requireAdmin();
  const { count } = await prisma.pollBallot.deleteMany({ where: { pollId: id } });
  await logAdminAction({ adminId: admin.id, action: "update", entityType: "poll", entityId: id });
  refreshPublic();
  return { success: true as const, message: `${count} vote${count > 1 ? "s" : ""} supprimé${count > 1 ? "s" : ""}.` };
}
