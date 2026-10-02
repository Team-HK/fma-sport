import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { FilterTabs } from "@/components/sections/FilterTabs";
import { ArticleCard } from "@/components/sections/ArticleCard";
import { getPublishedArticles } from "@/lib/queries";
import { AFRICAN_COUNTRIES } from "@/lib/constants";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Football africain",
  description: "Actualités, résultats et talents du football africain.",
};

export default async function FootballAfricainPage({
  searchParams,
}: {
  searchParams: Promise<{ pays?: string }>;
}) {
  const { pays } = await searchParams;
  const country = pays && AFRICAN_COUNTRIES.includes(pays as (typeof AFRICAN_COUNTRIES)[number])
    ? pays
    : undefined;

  const allArticles = country
    ? await getPublishedArticles({ country })
    : await getPublishedArticles({ category: "AFRIQUE" });

  return (
    <>
      <PageHeader
        title="Football africain"
        description="Actualités, résultats, calendriers et talents du continent africain."
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <FilterTabs
          basePath="/football-africain"
          paramName="pays"
          active={pays}
          options={AFRICAN_COUNTRIES.map((c) => ({ value: c, label: c }))}
        />

        {allArticles.length === 0 ? (
          <p className="mt-12 text-center text-muted-foreground">
            Aucun article pour cette sélection pour le moment.
          </p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {allArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
