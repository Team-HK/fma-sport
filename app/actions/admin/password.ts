"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/audit-log";
import { passwordWeakness } from "@/lib/password-policy";

export type PasswordActionState = { success: boolean; message: string };

/** Lets a signed-in administrator change their own password (current password required). */
export async function changeOwnPassword(
  _prev: PasswordActionState,
  formData: FormData
): Promise<PasswordActionState> {
  const admin = await requireAdmin();
  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!current || !next || !confirm) return { success: false, message: "Tous les champs sont obligatoires." };
  if (next !== confirm) return { success: false, message: "La confirmation ne correspond pas au nouveau mot de passe." };

  const user = await prisma.adminUser.findUnique({ where: { id: admin.id } });
  if (!user || !user.active) return { success: false, message: "Compte introuvable." };

  if (!(await bcrypt.compare(current, user.passwordHash))) {
    return { success: false, message: "Le mot de passe actuel est incorrect." };
  }
  if (await bcrypt.compare(next, user.passwordHash)) {
    return { success: false, message: "Le nouveau mot de passe doit être différent de l'actuel." };
  }
  const problem = passwordWeakness(next, user.email);
  if (problem) return { success: false, message: problem };

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(next, 12) },
  });
  await logAdminAction({ adminId: user.id, action: "password_change", entityType: "admin_user", entityId: user.id });

  return { success: true, message: "Mot de passe modifié. Utilisez-le à votre prochaine connexion." };
}
