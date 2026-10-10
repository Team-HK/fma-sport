"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { slugify } from "@/lib/utils";
import { logAdminAction } from "@/lib/audit-log";

const eventSchema = z.object({
  name: z.string().min(1),
  date: z.string().min(1),
  location: z.string().min(1),
  price: z.string().optional(),
  registrationConditions: z.string().optional(),
  contact: z.string().optional(),
  poster: z.string().optional(),
  results: z.string().optional(),
  photos: z.string().optional(),
  videos: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "RESULTS_PUBLISHED"]),
});

export type EventActionState = { success: boolean; message: string };

export async function upsertEvent(
  id: string | null,
  _prevState: EventActionState,
  formData: FormData
): Promise<EventActionState> {
  const admin = await requireAdmin();
  const parsed = eventSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { success: false, message: "Merci de vérifier les champs obligatoires." };
  }
  const data = parsed.data;
  const toLines = (value?: string) =>
    value ? value.split("\n").map((line) => line.trim()).filter(Boolean) : [];
  const photos = toLines(data.photos);
  const videos = toLines(data.videos);

  try {
    if (id) {
      await prisma.event.update({
        where: { id },
        data: {
          name: data.name,
          date: new Date(data.date),
          location: data.location,
          price: data.price || null,
          registrationConditions: data.registrationConditions || null,
          contact: data.contact || null,
          poster: data.poster || null,
          results: data.results || null,
          photos,
          videos,
          status: data.status,
        },
      });
      await logAdminAction({ adminId: admin.id, action: "update", entityType: "event", entityId: id });
      revalidatePath("/admin/evenements");
      revalidatePath("/", "layout");
      revalidatePath("/evenements");
      return { success: true, message: "Événement mis à jour." };
    }

    const created = await prisma.event.create({
      data: {
        name: data.name,
        slug: slugify(data.name),
        date: new Date(data.date),
        location: data.location,
        price: data.price || null,
        registrationConditions: data.registrationConditions || null,
        contact: data.contact || null,
        poster: data.poster || null,
        results: data.results || null,
        photos,
        videos,
        status: data.status,
      },
    });
    await logAdminAction({
      adminId: admin.id,
      action: "create",
      entityType: "event",
      entityId: created.id,
    });
  } catch (error) {
    console.error("Failed to save event:", error);
    return { success: false, message: "Une erreur est survenue lors de l'enregistrement." };
  }

  revalidatePath("/admin/evenements");
  revalidatePath("/", "layout");
  revalidatePath("/evenements");
  redirect("/admin/evenements");
}

export async function deleteEvent(id: string) {
  const admin = await requireAdmin();
  await prisma.event.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAdminAction({ adminId: admin.id, action: "delete", entityType: "event", entityId: id });
  revalidatePath("/admin/evenements");
  revalidatePath("/evenements");
  // Public pages are ISR-cached: refresh them (lists, detail pages, home)
  revalidatePath("/", "layout");
}

export async function restoreEvent(id: string) {
  const admin = await requireAdmin();
  await prisma.event.update({ where: { id }, data: { deletedAt: null } });
  await logAdminAction({ adminId: admin.id, action: "restore", entityType: "event", entityId: id });
  revalidatePath("/admin/evenements");
  revalidatePath("/evenements");
  // Public pages are ISR-cached: refresh them (lists, detail pages, home)
  revalidatePath("/", "layout");
}
