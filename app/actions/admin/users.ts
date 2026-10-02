"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/audit-log";

const createUserSchema = z.object({
  name: z.string().min(1, "Le nom est obligatoire."),
  email: z.string().email("Email invalide."),
  password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères."),
  role: z.enum(["SUPER_ADMIN", "EDITOR"]),
});

export type UserActionState = { success: boolean; message: string };

export async function createAdminUser(
  _prevState: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const superAdmin = await requireSuperAdmin();
  const parsed = createUserSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "Champs invalides." };
  }
  const data = parsed.data;

  const existing = await prisma.adminUser.findUnique({ where: { email: data.email } });
  if (existing) {
    return { success: false, message: "Un compte existe déjà avec cet email." };
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const created = await prisma.adminUser.create({
    data: { name: data.name, email: data.email, passwordHash, role: data.role },
  });
  await logAdminAction({
    adminId: superAdmin.id,
    action: "create",
    entityType: "admin_user",
    entityId: created.id,
  });

  revalidatePath("/admin/utilisateurs");
  redirect("/admin/utilisateurs");
}

export async function toggleAdminUserActive(id: string, active: boolean) {
  const superAdmin = await requireSuperAdmin();
  if (id === superAdmin.id) {
    throw new Error("Vous ne pouvez pas désactiver votre propre compte.");
  }
  await prisma.adminUser.update({ where: { id }, data: { active } });
  await logAdminAction({
    adminId: superAdmin.id,
    action: active ? "activate" : "deactivate",
    entityType: "admin_user",
    entityId: id,
  });
  revalidatePath("/admin/utilisateurs");
}

export async function updateAdminUserRole(id: string, role: "SUPER_ADMIN" | "EDITOR") {
  const superAdmin = await requireSuperAdmin();
  if (id === superAdmin.id) {
    throw new Error("Vous ne pouvez pas changer votre propre rôle.");
  }
  await prisma.adminUser.update({ where: { id }, data: { role } });
  await logAdminAction({
    adminId: superAdmin.id,
    action: "update_role",
    entityType: "admin_user",
    entityId: id,
    metadata: { role },
  });
  revalidatePath("/admin/utilisateurs");
}
