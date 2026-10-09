"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { slugify } from "@/lib/utils";
import { logAdminAction } from "@/lib/audit-log";

const articleSchema = z.object({
  title: z.string().min(1),
  excerpt: z.string().min(1),
  content: z.string().min(1),
  coverImage: z.string().optional(),
  category: z.string().min(1),
  country: z.string().optional(),
  competition: z.string().optional(),
  tags: z.string().optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED"]),
  publishedAt: z.string().optional(),
  writerId: z.string().optional(),
});

export type ArticleActionState = { success: boolean; message: string };

export async function upsertArticle(
  id: string | null,
  _prevState: ArticleActionState,
  formData: FormData
): Promise<ArticleActionState> {
  const admin = await requireAdmin();
  const parsed = articleSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { success: false, message: "Merci de vérifier les champs obligatoires." };
  }

  const data = parsed.data;
  const tags = data.tags
    ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const publishedAt =
    data.status === "PUBLISHED"
      ? data.publishedAt
        ? new Date(data.publishedAt)
        : new Date()
      : data.status === "SCHEDULED" && data.publishedAt
        ? new Date(data.publishedAt)
        : null;

  try {
    if (id) {
      await prisma.article.update({
        where: { id },
        data: {
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          coverImage: data.coverImage || null,
          category: data.category as never,
          country: data.country || null,
          competition: data.competition || null,
          tags,
          status: data.status,
          publishedAt,
          writerId: data.writerId || null,
        },
      });
      await logAdminAction({
        adminId: admin.id,
        action: "update",
        entityType: "article",
        entityId: id,
      });
      revalidatePath("/admin/articles");
      revalidatePath("/actualites");
      return { success: true, message: "Article mis à jour." };
    } else {
      const created = await prisma.article.create({
        data: {
          title: data.title,
          slug: slugify(data.title),
          excerpt: data.excerpt,
          content: data.content,
          coverImage: data.coverImage || null,
          category: data.category as never,
          country: data.country || null,
          competition: data.competition || null,
          tags,
          status: data.status,
          publishedAt,
          authorId: admin.id,
          writerId: data.writerId || null,
        },
      });
      await logAdminAction({
        adminId: admin.id,
        action: "create",
        entityType: "article",
        entityId: created.id,
      });
    }
  } catch (error) {
    console.error("Failed to save article:", error);
    return { success: false, message: "Une erreur est survenue lors de l'enregistrement." };
  }

  revalidatePath("/admin/articles");
  revalidatePath("/actualites");
  redirect("/admin/articles");
}

export async function deleteArticle(id: string) {
  const admin = await requireAdmin();
  await prisma.article.update({ where: { id }, data: { deletedAt: new Date() } });
  await logAdminAction({ adminId: admin.id, action: "delete", entityType: "article", entityId: id });
  revalidatePath("/admin/articles");
  revalidatePath("/actualites");
  // Public pages are ISR-cached: refresh them (lists, detail pages, home)
  revalidatePath("/", "layout");
}

export async function restoreArticle(id: string) {
  const admin = await requireAdmin();
  await prisma.article.update({ where: { id }, data: { deletedAt: null } });
  await logAdminAction({ adminId: admin.id, action: "restore", entityType: "article", entityId: id });
  revalidatePath("/admin/articles");
  revalidatePath("/actualites");
  // Public pages are ISR-cached: refresh them (lists, detail pages, home)
  revalidatePath("/", "layout");
}

export async function toggleArticleStatus(id: string, status: "DRAFT" | "PUBLISHED") {
  const admin = await requireAdmin();
  await prisma.article.update({
    where: { id },
    data: { status, publishedAt: status === "PUBLISHED" ? new Date() : undefined },
  });
  await logAdminAction({
    adminId: admin.id,
    action: status === "PUBLISHED" ? "publish" : "unpublish",
    entityType: "article",
    entityId: id,
  });
  revalidatePath("/admin/articles");
  revalidatePath("/actualites");
}
