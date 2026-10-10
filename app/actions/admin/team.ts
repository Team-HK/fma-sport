"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/audit-log";

const teamMemberSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  department: z.string().optional(),
  photo: z.string().optional(),
  bio: z.string().optional(),
  order: z.coerce.number().int().default(0),
  visible: z.coerce.boolean().optional(),
});

export type TeamMemberActionState = { success: boolean; message: string };

export async function upsertTeamMember(
  id: string | null,
  _prevState: TeamMemberActionState,
  formData: FormData
): Promise<TeamMemberActionState> {
  const admin = await requireAdmin();
  const raw = Object.fromEntries(formData.entries());
  const parsed = teamMemberSchema.safeParse({ ...raw, visible: raw.visible === "true" });
  if (!parsed.success) {
    return { success: false, message: "Merci de vérifier les champs obligatoires." };
  }
  const data = parsed.data;
  const payload = {
    name: data.name,
    role: data.role,
    department: data.department || null,
    photo: data.photo || null,
    bio: data.bio || null,
    order: data.order,
    visible: Boolean(data.visible),
  };

  try {
    if (id) {
      await prisma.teamMember.update({ where: { id }, data: payload });
      await logAdminAction({ adminId: admin.id, action: "update", entityType: "team_member", entityId: id });
      revalidatePath("/admin/equipe");
      revalidatePath("/", "layout");
      revalidatePath("/equipe");
      return { success: true, message: "Membre mis à jour." };
    }

    const created = await prisma.teamMember.create({ data: payload });
    await logAdminAction({
      adminId: admin.id,
      action: "create",
      entityType: "team_member",
      entityId: created.id,
    });
  } catch (error) {
    console.error("Failed to save team member:", error);
    return { success: false, message: "Une erreur est survenue lors de l'enregistrement." };
  }

  revalidatePath("/admin/equipe");
  revalidatePath("/", "layout");
  revalidatePath("/equipe");
  redirect("/admin/equipe");
}

export async function deleteTeamMember(id: string) {
  const admin = await requireAdmin();
  await prisma.teamMember.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAdminAction({ adminId: admin.id, action: "delete", entityType: "team_member", entityId: id });
  revalidatePath("/admin/equipe");
  revalidatePath("/equipe");
  // Public pages are ISR-cached: refresh them (lists, detail pages, home)
  revalidatePath("/", "layout");
}

export async function restoreTeamMember(id: string) {
  const admin = await requireAdmin();
  await prisma.teamMember.update({ where: { id }, data: { deletedAt: null } });
  await logAdminAction({ adminId: admin.id, action: "restore", entityType: "team_member", entityId: id });
  revalidatePath("/admin/equipe");
  revalidatePath("/equipe");
  // Public pages are ISR-cached: refresh them (lists, detail pages, home)
  revalidatePath("/", "layout");
}
