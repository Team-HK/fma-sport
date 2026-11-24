import { prisma } from "@/lib/prisma";
import { cachedQuery } from "@/lib/cache";
import { DEFAULT_ARTICLE_CATEGORIES } from "@/lib/constants";

export type ArticleCategoryItem = {
  slug: string;
  label: string;
  order: number;
  active: boolean;
  locked: boolean;
};

const DEFAULTS: ArticleCategoryItem[] = DEFAULT_ARTICLE_CATEGORIES.map((c, index) => ({
  slug: c.slug,
  label: c.label,
  order: index + 1,
  active: true,
  locked: c.locked,
}));

/** Prisma "table does not exist": the migration hasn't run yet, fall back to the defaults. */
function isMissingTable(error: unknown) {
  const code = (error as { code?: string } | null)?.code;
  return code === "P2021" || code === "P2022";
}

/** Every category, ordered (cached; expired by the admin actions). */
export const getArticleCategories = cachedQuery("getArticleCategories", async (): Promise<ArticleCategoryItem[]> => {
  try {
    const rows = await prisma.articleCategory.findMany({
      orderBy: [{ order: "asc" }, { label: "asc" }],
      select: { slug: true, label: true, order: true, active: true, locked: true },
    });
    return rows.length > 0 ? rows : DEFAULTS;
  } catch (error) {
    if (isMissingTable(error)) return DEFAULTS;
    throw error;
  }
});

/** slug -> label, including inactive categories (articles keep showing their label). */
export async function getCategoryLabels(): Promise<Record<string, string>> {
  const categories = await getArticleCategories().catch(() => DEFAULTS);
  return Object.fromEntries(categories.map((c) => [c.slug, c.label]));
}

/** Categories visitors can filter by: active ones only. */
export async function getActiveCategories(): Promise<ArticleCategoryItem[]> {
  const categories = await getArticleCategories().catch(() => DEFAULTS);
  return categories.filter((c) => c.active);
}

/** Builds a stable code from a label: "Coupe d'Afrique" -> "COUPE_D_AFRIQUE". */
export function categorySlugFromLabel(label: string): string {
  const base = label
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
  return base || "CATEGORIE";
}
