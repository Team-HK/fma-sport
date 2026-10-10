"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/audit-log";

const adSchema = z.object({
  title: z.string().min(1),
  format: z.string().min(1),
  placement: z.string().min(1),
  mediaUrl: z.string().min(1),
  linkUrl: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  active: z.coerce.boolean().optional(),
});

export type AdActionState = { success: boolean; message: string };

export async function upsertAd(
  id: string | null,
  _prevState: AdActionState,
  formData: FormData
): Promise<AdActionState> {
  const admin = await requireAdmin();
  const raw = Object.fromEntries(formData.entries());
  const parsed = adSchema.safeParse({ ...raw, active: raw.active === "true" });
  if (!parsed.success) {
    return { success: false, message: "Merci de vérifier les champs obligatoires." };
  }
  const data = parsed.data;

  const payload = {
    title: data.title,
    format: data.format as never,
    placement: data.placement as never,
    mediaUrl: data.mediaUrl,
    linkUrl: data.linkUrl || null,
    startDate: data.startDate ? new Date(data.startDate) : null,
    endDate: data.endDate ? new Date(data.endDate) : null,
    active: Boolean(data.active),
  };

  try {
    if (id) {
      await prisma.advertisement.update({ where: { id }, data: payload });
      await logAdminAction({
        adminId: admin.id,
        action: "update",
        entityType: "advertisement",
        entityId: id,
      });
      revalidatePath("/admin/publicites");
      revalidatePath("/", "layout");
      return { success: true, message: "Publicité mise à jour." };
    }

    const created = await prisma.advertisement.create({ data: payload });
    await logAdminAction({
      adminId: admin.id,
      action: "create",
      entityType: "advertisement",
      entityId: created.id,
    });
  } catch (error) {
    console.error("Failed to save ad:", error);
    return { success: false, message: "Une erreur est survenue lors de l'enregistrement." };
  }

  revalidatePath("/admin/publicites");
  revalidatePath("/", "layout");
  redirect("/admin/publicites");
}

export async function deleteAd(id: string) {
  const admin = await requireAdmin();
  await prisma.advertisement.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAdminAction({ adminId: admin.id, action: "delete", entityType: "advertisement", entityId: id });
  revalidatePath("/admin/publicites");
  // Public pages are ISR-cached: refresh them (lists, detail pages, home)
  revalidatePath("/", "layout");
}

export async function restoreAd(id: string) {
  const admin = await requireAdmin();
  await prisma.advertisement.update({ where: { id }, data: { deletedAt: null } });
  await logAdminAction({ adminId: admin.id, action: "restore", entityType: "advertisement", entityId: id });
  revalidatePath("/admin/publicites");
  // Public pages are ISR-cached: refresh them (lists, detail pages, home)
  revalidatePath("/", "layout");
}

export async function toggleAdActive(id: string, active: boolean) {
  const admin = await requireAdmin();
  await prisma.advertisement.update({ where: { id }, data: { active } });
  await logAdminAction({
    adminId: admin.id,
    action: active ? "activate" : "deactivate",
    entityType: "advertisement",
    entityId: id,
  });
  revalidatePath("/admin/publicites");
  revalidatePath("/", "layout");
}
