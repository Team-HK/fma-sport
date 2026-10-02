"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/audit-log";

const heroSlideSchema = z.object({
  imageUrl: z.string().min(1, "L'image est obligatoire."),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  order: z.coerce.number().int().optional(),
  active: z.coerce.boolean().optional(),
});

export type HeroSlideActionState = { success: boolean; message: string };

export async function upsertHeroSlide(
  id: string | null,
  _prevState: HeroSlideActionState,
  formData: FormData
): Promise<HeroSlideActionState> {
  const admin = await requireAdmin();
  const raw = Object.fromEntries(formData.entries());
  const parsed = heroSlideSchema.safeParse({ ...raw, active: raw.active === "true" });
  if (!parsed.success) {
    return { success: false, message: "Merci de vérifier les champs obligatoires." };
  }
  const data = parsed.data;

  const payload = {
    imageUrl: data.imageUrl,
    title: data.title || null,
    subtitle: data.subtitle || null,
    ctaLabel: data.ctaLabel || null,
    ctaHref: data.ctaHref || null,
    order: data.order ?? 0,
    active: Boolean(data.active),
  };

  try {
    if (id) {
      await prisma.heroSlide.update({ where: { id }, data: payload });
      await logAdminAction({
        adminId: admin.id,
        action: "update",
        entityType: "hero_slide",
        entityId: id,
      });
      revalidatePath("/admin/referentiels/carousel");
      revalidatePath("/");
      return { success: true, message: "Diapositive mise à jour." };
    }

    const created = await prisma.heroSlide.create({ data: payload });
    await logAdminAction({
      adminId: admin.id,
      action: "create",
      entityType: "hero_slide",
      entityId: created.id,
    });
  } catch (error) {
    console.error("Failed to save hero slide:", error);
    return { success: false, message: "Une erreur est survenue lors de l'enregistrement." };
  }

  revalidatePath("/admin/referentiels/carousel");
  revalidatePath("/");
  redirect("/admin/referentiels/carousel");
}

export async function deleteHeroSlide(id: string) {
  const admin = await requireAdmin();
  await prisma.heroSlide.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAdminAction({ adminId: admin.id, action: "delete", entityType: "hero_slide", entityId: id });
  revalidatePath("/admin/referentiels/carousel");
  revalidatePath("/");
}

export async function restoreHeroSlide(id: string) {
  const admin = await requireAdmin();
  await prisma.heroSlide.update({ where: { id }, data: { deletedAt: null } });
  await logAdminAction({ adminId: admin.id, action: "restore", entityType: "hero_slide", entityId: id });
  revalidatePath("/admin/referentiels/carousel");
  revalidatePath("/");
}
