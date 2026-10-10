"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/audit-log";

const siteSettingsSchema = z.object({
  phone: z.string().optional(),
  phone2: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  facebookUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  tiktokUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  snapchatUrl: z.string().optional(),
  xUrl: z.string().optional(),
});

export type SiteSettingsActionState = { success: boolean; message: string };

export async function upsertSiteSettings(
  _prevState: SiteSettingsActionState,
  formData: FormData
): Promise<SiteSettingsActionState> {
  const admin = await requireAdmin();
  const raw = Object.fromEntries(formData.entries());
  const parsed = siteSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, message: "Merci de vérifier les champs." };
  }
  const data = parsed.data;

  const payload = {
    phone: data.phone || null,
    phone2: data.phone2 || null,
    whatsapp: data.whatsapp || null,
    email: data.email || null,
    address: data.address || null,
    facebookUrl: data.facebookUrl || null,
    instagramUrl: data.instagramUrl || null,
    tiktokUrl: data.tiktokUrl || null,
    youtubeUrl: data.youtubeUrl || null,
    snapchatUrl: data.snapchatUrl || null,
    xUrl: data.xUrl || null,
  };

  try {
    await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: payload,
      create: { id: "singleton", ...payload },
    });
    await logAdminAction({
      adminId: admin.id,
      action: "update",
      entityType: "site_settings",
      entityId: "singleton",
    });
  } catch (error) {
    console.error("Failed to save site settings:", error);
    return { success: false, message: "Une erreur est survenue lors de l'enregistrement." };
  }

  revalidatePath("/admin/referentiels");
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/contact");
  return { success: true, message: "Coordonnées mises à jour." };
}
