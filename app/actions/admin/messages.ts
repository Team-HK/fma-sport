"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/audit-log";

export async function markMessageRead(id: string, read: boolean) {
  await requireAdmin();
  await prisma.contactMessage.update({ where: { id }, data: { read } });
  revalidatePath("/admin/messages");
}

export async function deleteMessage(id: string) {
  const admin = await requireAdmin();
  await prisma.contactMessage.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAdminAction({ adminId: admin.id, action: "delete", entityType: "message", entityId: id });
  revalidatePath("/admin/messages");
  return { success: true as const, message: "Message déplacé dans la corbeille. Il n'est plus visible sur le site." };
}

export async function restoreMessage(id: string) {
  const admin = await requireAdmin();
  await prisma.contactMessage.update({ where: { id }, data: { deletedAt: null } });
  await logAdminAction({ adminId: admin.id, action: "restore", entityType: "message", entityId: id });
  revalidatePath("/admin/messages");
  return { success: true as const, message: "Message restauré." };
}
