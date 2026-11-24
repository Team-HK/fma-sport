import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CategoryRowControls, NewCategoryButton } from "./CategoryControls";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const [categories, counts] = await Promise.all([
    prisma.articleCategory.findMany({ orderBy: [{ order: "asc" }, { label: "asc" }] }),
    prisma.article.groupBy({ by: ["category"], where: { deletedAt: null }, _count: { _all: true } }),
  ]);
  const publicCount = Object.fromEntries(counts.map((c) => [c.category, c._count._all]));
  // Includes trashed articles: they still block a deletion.
  const allCounts = await prisma.article.groupBy({ by: ["category"], _count: { _all: true } });
  const totalCount = Object.fromEntries(allCounts.map((c) => [c.category, c._count._all]));

  return (
    <div>
      <Link
        href="/admin/articles"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Retour aux articles
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Catégories d&apos;articles ({categories.length})</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Créez, renommez, réordonnez ou désactivez les catégories. L&apos;ordre est celui des filtres du site. Une
            catégorie désactivée n&apos;est plus proposée, mais les articles qui l&apos;utilisent la gardent.
          </p>
        </div>
        <NewCategoryButton />
      </div>

      <div className="mt-6 space-y-3">
        {categories.map((category, index) => (
          <Card key={category.slug} className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-foreground">{category.label}</p>
                <StatusBadge tone={category.active ? "success" : "neutral"}>
                  {category.active ? "Active" : "Désactivée"}
                </StatusBadge>
                {category.locked && (
                  <span
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground"
                    title="Cette catégorie alimente une page dédiée du site"
                  >
                    <Lock className="h-3 w-3" aria-hidden="true" />
                    Page dédiée
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                <span className="font-mono">{category.slug}</span> · {publicCount[category.slug] ?? 0} article
                {(publicCount[category.slug] ?? 0) > 1 ? "s" : ""}
              </p>
            </div>
            <CategoryRowControls
              slug={category.slug}
              label={category.label}
              active={category.active}
              locked={category.locked}
              articleCount={totalCount[category.slug] ?? 0}
              isFirst={index === 0}
              isLast={index === categories.length - 1}
            />
          </Card>
        ))}
        {categories.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">Aucune catégorie. Créez la première.</p>
        )}
      </div>
    </div>
  );
}
