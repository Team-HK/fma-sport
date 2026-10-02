"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { slugify } from "@/lib/utils";
import { logAdminAction } from "@/lib/audit-log";

export async function updateCandidacyStatus(
  id: string,
  status: "PENDING" | "INFO_REQUESTED" | "ACCEPTED" | "REJECTED",
  adminNote?: string
) {
  const admin = await requireAdmin();
  await prisma.candidacy.update({ where: { id }, data: { status, adminNote } });
  await logAdminAction({
    adminId: admin.id,
    action: `candidacy:${status.toLowerCase()}`,
    entityType: "candidacy",
    entityId: id,
  });
  revalidatePath("/admin/joueurs");
}

export async function createPlayerFromCandidacy(candidacyId: string) {
  const admin = await requireAdmin();
  const candidacy = await prisma.candidacy.findUnique({ where: { id: candidacyId } });
  if (!candidacy) return;

  const slug = slugify(`${candidacy.firstName} ${candidacy.lastName}-${Date.now().toString(36)}`);

  const player = await prisma.player.create({
    data: {
      firstName: candidacy.firstName,
      lastName: candidacy.lastName,
      slug,
      photo: candidacy.photoUrl,
      nationality: candidacy.nationality,
      birthDate: candidacy.birthDate,
      height: candidacy.height,
      weight: candidacy.weight,
      position: candidacy.mainPosition,
      secondaryPosition: candidacy.secondaryPosition,
      strongFoot: candidacy.strongFoot,
      club: candidacy.currentClub,
      previousClub: candidacy.previousClub,
      cvUrl: candidacy.cvUrl,
      documentUrls: candidacy.documentUrls,
      status: "DRAFT",
      candidacyId: candidacy.id,
    },
  });

  await prisma.candidacy.update({ where: { id: candidacyId }, data: { status: "ACCEPTED" } });

  await logAdminAction({
    adminId: admin.id,
    action: "candidacy:accepted-player-created",
    entityType: "player",
    entityId: player.id,
  });

  revalidatePath("/admin/joueurs");
}

const playerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  nationality: z.string().min(1),
  flag: z.string().optional(),
  birthDate: z.string().min(1),
  position: z.string().min(1),
  secondaryPosition: z.string().optional(),
  strongFoot: z.string().min(1),
  height: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
  club: z.string().optional(),
  previousClub: z.string().optional(),
  number: z.coerce.number().optional(),
  photo: z.string().optional(),
  bio: z.string().optional(),
  cvUrl: z.string().optional(),
  documentUrls: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export type PlayerActionState = { success: boolean; message: string };

export async function upsertPlayer(
  id: string | null,
  _prevState: PlayerActionState,
  formData: FormData
): Promise<PlayerActionState> {
  const admin = await requireAdmin();
  const raw = Object.fromEntries(formData.entries());
  // Empty optional number inputs submit as "" which breaks z.coerce.number().optional().
  const cleaned = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, value === "" ? undefined : value])
  );
  const parsed = playerSchema.safeParse(cleaned);
  if (!parsed.success) {
    return { success: false, message: "Merci de vérifier les champs obligatoires." };
  }
  const data = parsed.data;
  const documentUrls = data.documentUrls
    ? data.documentUrls.split("\n").map((u) => u.trim()).filter(Boolean)
    : [];

  try {
    if (id) {
      await prisma.player.update({
        where: { id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          nationality: data.nationality,
          flag: data.flag || null,
          birthDate: new Date(data.birthDate),
          position: data.position as never,
          secondaryPosition: (data.secondaryPosition as never) || null,
          strongFoot: data.strongFoot as never,
          height: data.height,
          weight: data.weight,
          club: data.club || null,
          previousClub: data.previousClub || null,
          number: data.number,
          photo: data.photo || null,
          bio: data.bio || null,
          cvUrl: data.cvUrl || null,
          documentUrls,
          status: data.status,
        },
      });
      await logAdminAction({ adminId: admin.id, action: "update", entityType: "player", entityId: id });
      revalidatePath("/admin/joueurs");
      revalidatePath("/talents");
      return { success: true, message: "Profil mis à jour." };
    } else {
      const created = await prisma.player.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          slug: slugify(`${data.firstName} ${data.lastName}`),
          nationality: data.nationality,
          flag: data.flag || null,
          birthDate: new Date(data.birthDate),
          position: data.position as never,
          secondaryPosition: (data.secondaryPosition as never) || null,
          strongFoot: data.strongFoot as never,
          height: data.height,
          weight: data.weight,
          club: data.club || null,
          previousClub: data.previousClub || null,
          number: data.number,
          photo: data.photo || null,
          bio: data.bio || null,
          cvUrl: data.cvUrl || null,
          documentUrls,
          status: data.status,
        },
      });
      await logAdminAction({
        adminId: admin.id,
        action: "create",
        entityType: "player",
        entityId: created.id,
      });
    }
  } catch (error) {
    console.error("Failed to save player:", error);
    return { success: false, message: "Une erreur est survenue lors de l'enregistrement." };
  }

  revalidatePath("/admin/joueurs");
  revalidatePath("/talents");
  redirect("/admin/joueurs");
}

export async function deletePlayer(id: string) {
  const admin = await requireAdmin();
  await prisma.player.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAdminAction({ adminId: admin.id, action: "delete", entityType: "player", entityId: id });
  revalidatePath("/admin/joueurs");
  revalidatePath("/talents");
}

export async function restorePlayer(id: string) {
  const admin = await requireAdmin();
  await prisma.player.update({ where: { id }, data: { deletedAt: null } });
  await logAdminAction({ adminId: admin.id, action: "restore", entityType: "player", entityId: id });
  revalidatePath("/admin/joueurs");
  revalidatePath("/talents");
}
