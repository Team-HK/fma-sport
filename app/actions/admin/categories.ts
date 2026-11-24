"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminAction } from "@/lib/audit-log";
import { expirePublicContent } from "@/lib/cache";
import { categorySlugFromLabel } from "@/lib/article-categories";

export type CategoryActionState = { success: boolean; message: string };

const labelSchema = z
  .string()
  .transform((v) => v.replace(/\s+/g, " ").trim())
  .pipe(z.string().min(2, "Le nom doit contenir au moins 2 caractères.").max(40, "Le nom est limité à 40 caractères."));

function refresh() {
  revalidatePath("/admin/categories");
  revalidatePath("/admin/articles");
  revalidatePath("/", "layout");
  expirePublicContent();
}

/** True when another category already uses this label (case and accents ignored). */
async function labelTaken(label: string, exceptSlug?: string) {
  const key = categorySlugFromLabel(label);
  const all = await prisma.articleCategory.findMany({ select: { slug: true, label: true } });
  return all.some((c) => c.slug !== exceptSlug && categorySlugFromLabel(c.label) === key);
}

export async function createCategory(
  _prev: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const admin = await requireAdmin();
  const parsed = labelSchema.safeParse(formData.get("label") ?? "");
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Nom invalide." };
  const label = parsed.data;

  if (await labelTaken(label)) return { success: false, message: "Une catégorie porte déjà ce nom." };

  // Stable code used on articles and in URLs; suffix it if the generated one is taken.
  const base = categorySlugFromLabel(label);
  let slug = base;
  for (let n = 2; await prisma.articleCategory.findUnique({ where: { slug }, select: { slug: true } }); n++) {
    slug = `${base}_${n}`;
  }
  const last = await prisma.articleCategory.aggregate({ _max: { order: true } });

  try {
    await prisma.articleCategory.create({ data: { slug, label, order: (last._max.order ?? 0) + 1 } });
    await logAdminAction({ adminId: admin.id, action: "create", entityType: "article_category", entityId: slug });
  } catch (error) {
    console.error("Failed to create category:", error);
    return { success: false, message: "Une erreur est survenue lors de l'enregistrement." };
  }
  refresh();
  return { success: true, message: `Catégorie « ${label} » créée.` };
}

export async function updateCategory(
  slug: string,
  _prev: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const admin = await requireAdmin();
  const parsed = labelSchema.safeParse(formData.get("label") ?? "");
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Nom invalide." };
  const label = parsed.data;

  const current = await prisma.articleCategory.findUnique({ where: { slug } });
  if (!current) return { success: false, message: "Cette catégorie n'existe plus." };
  if (await labelTaken(label, slug)) return { success: false, message: "Une autre catégorie porte déjà ce nom." };

  try {
    await prisma.articleCategory.update({ where: { slug }, data: { label } });
    await logAdminAction({ adminId: admin.id, action: "update", entityType: "article_category", entityId: slug });
  } catch (error) {
    console.error("Failed to update category:", error);
    return { success: false, message: "Une erreur est survenue lors de l'enregistrement." };
  }
  refresh();
  return { success: true, message: "Catégorie mise à jour." };
}

/** Moves a category one step up or down in the display order (menus and filters). */
export async function moveCategory(slug: string, direction: "up" | "down") {
  const admin = await requireAdmin();
  const all = await prisma.articleCategory.findMany({ orderBy: [{ order: "asc" }, { label: "asc" }], select: { slug: true } });
  const index = all.findIndex((c) => c.slug === slug);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= all.length) return { success: true as const };

  // Rewrite the whole order (1..n) so duplicated or gapped values can never block a move.
  const reordered = [...all];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
  await prisma.$transaction(
    reordered.map((c, i) => prisma.articleCategory.update({ where: { slug: c.slug }, data: { order: i + 1 } }))
  );
  await logAdminAction({ adminId: admin.id, action: "update", entityType: "article_category", entityId: slug });
  refresh();
  return { success: true as const };
}

export async function toggleCategoryActive(slug: string, active: boolean) {
  const admin = await requireAdmin();
  const category = await prisma.articleCategory.findUnique({ where: { slug } });
  if (!category) return { success: false as const, message: "Cette catégorie n'existe plus." };
  if (category.locked && !active) {
    return {
      success: false as const,
      message: `« ${category.label} » alimente une page du site : elle ne peut pas être désactivée.`,
    };
  }
  await prisma.articleCategory.update({ where: { slug }, data: { active } });
  await logAdminAction({ adminId: admin.id, action: active ? "restore" : "delete", entityType: "article_category", entityId: slug });
  refresh();
  return {
    success: true as const,
    message: active
      ? `« ${category.label} » est de nouveau proposée.`
      : `« ${category.label} » n'est plus proposée pour de nouveaux articles ni dans les filtres. Les articles existants la gardent.`,
  };
}

export async function deleteCategory(slug: string) {
  const admin = await requireAdmin();
  const category = await prisma.articleCategory.findUnique({
    where: { slug },
    include: { _count: { select: { articles: true } } },
  });
  if (!category) return { success: false as const, message: "Cette catégorie n'existe plus." };
  if (category.locked) {
    return { success: false as const, message: `« ${category.label} » alimente une page du site : elle ne peut pas être supprimée.` };
  }
  if (category._count.articles > 0) {
    const n = category._count.articles;
    return {
      success: false as const,
      message: `${n} article${n > 1 ? "s utilisent" : " utilise"} « ${category.label} » (corbeille comprise). Changez leur catégorie, ou désactivez-la plutôt que de la supprimer.`,
    };
  }
  await prisma.articleCategory.delete({ where: { slug } });
  await logAdminAction({ adminId: admin.id, action: "delete", entityType: "article_category", entityId: slug });
  refresh();
  return { success: true as const, message: `Catégorie « ${category.label} » supprimée.` };
}
