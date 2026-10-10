"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/audit-log";

const videoSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  thumbnail: z.string().optional(),
  platform: z.string().min(1),
  url: z.string().min(1),
  category: z.string().min(1),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  playerId: z.string().optional(),
});

export type VideoActionState = { success: boolean; message: string };

export async function upsertVideo(
  id: string | null,
  _prevState: VideoActionState,
  formData: FormData
): Promise<VideoActionState> {
  const admin = await requireAdmin();
  const parsed = videoSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { success: false, message: "Merci de vérifier les champs obligatoires." };
  }
  const data = parsed.data;
  const playerId = data.playerId || null;

  try {
    if (id) {
      const existing = await prisma.video.findUnique({ where: { id }, select: { publishedAt: true } });
      await prisma.video.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description,
          thumbnail: data.thumbnail || null,
          platform: data.platform as never,
          url: data.url,
          category: data.category as never,
          status: data.status,
          playerId,
          // Keep the original publication date when an already-published video is edited.
          publishedAt: data.status === "PUBLISHED" ? (existing?.publishedAt ?? new Date()) : null,
        },
      });
      await logAdminAction({ adminId: admin.id, action: "update", entityType: "video", entityId: id });
      revalidatePath("/admin/videos");
      revalidatePath("/", "layout");
      revalidatePath("/videos");
      return { success: true, message: "Vidéo mise à jour." };
    }

    const created = await prisma.video.create({
      data: {
        title: data.title,
        description: data.description,
        thumbnail: data.thumbnail || null,
        platform: data.platform as never,
        url: data.url,
        category: data.category as never,
        status: data.status,
        playerId,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      },
    });
    await logAdminAction({
      adminId: admin.id,
      action: "create",
      entityType: "video",
      entityId: created.id,
    });
  } catch (error) {
    console.error("Failed to save video:", error);
    return { success: false, message: "Une erreur est survenue lors de l'enregistrement." };
  }

  revalidatePath("/admin/videos");
  revalidatePath("/", "layout");
  revalidatePath("/videos");
  redirect("/admin/videos");
}

export async function deleteVideo(id: string) {
  const admin = await requireAdmin();
  await prisma.video.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAdminAction({ adminId: admin.id, action: "delete", entityType: "video", entityId: id });
  revalidatePath("/admin/videos");
  revalidatePath("/videos");
  // Public pages are ISR-cached: refresh them (lists, detail pages, home)
  revalidatePath("/", "layout");
  return { success: true as const, message: "Vidéo déplacée dans la corbeille. Elle n'est plus visible sur le site." };
}

export async function restoreVideo(id: string) {
  const admin = await requireAdmin();
  await prisma.video.update({ where: { id }, data: { deletedAt: null } });
  await logAdminAction({ adminId: admin.id, action: "restore", entityType: "video", entityId: id });
  revalidatePath("/admin/videos");
  revalidatePath("/videos");
  // Public pages are ISR-cached: refresh them (lists, detail pages, home)
  revalidatePath("/", "layout");
  return { success: true as const, message: "Vidéo restaurée." };
}
