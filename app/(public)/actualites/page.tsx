import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { FilterTabs } from "@/components/sections/FilterTabs";
import { ArticleCard } from "@/components/sections/ArticleCard";
import { getPublishedArticles } from "@/lib/queries";
import { ARTICLE_CATEGORY_LABELS } from "@/lib/constants";
import { AdSlot } from "@/components/sections/AdSlot";
import type { ArticleCategory } from "@prisma/client";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Actualités football",
  description: "Toutes les informations football du Sénégal, de l'Afrique et du monde.",
};

export default async function ActualitesPage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string }>;
}) {
  const { categorie } = await searchParams;
  const category =
    categorie && categorie in ARTICLE_CATEGORY_LABELS ? (categorie as ArticleCategory) : undefined;

  const articles = await getPublishedArticles({ category });

  return (
    <>
      <PageHeader
        title="Actualités football"
        description="Toutes les informations football du Sénégal, de l'Afrique et du monde."
      />

      <AdSlot placement="ACTUALITES" className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <FilterTabs
          basePath="/actualites"
          paramName="categorie"
          active={categorie}
          options={Object.entries(ARTICLE_CATEGORY_LABELS).map(([value, label]) => ({
            value,
            label,
          }))}
        />

        {articles.length === 0 ? (
          <p className="mt-12 text-center text-muted-foreground">
            Aucun article dans cette catégorie pour le moment.
          </p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
