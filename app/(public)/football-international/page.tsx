import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { FilterTabs } from "@/components/sections/FilterTabs";
import { ArticleCard } from "@/components/sections/ArticleCard";
import { getPublishedArticles } from "@/lib/queries";
import { INTERNATIONAL_COMPETITIONS } from "@/lib/constants";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Football international",
  description: "Championnats, compétitions et mercato du football international.",
};

export default async function FootballInternationalPage({
  searchParams,
}: {
  searchParams: Promise<{ competition?: string }>;
}) {
  const { competition } = await searchParams;
  const selected =
    competition &&
    INTERNATIONAL_COMPETITIONS.includes(
      competition as (typeof INTERNATIONAL_COMPETITIONS)[number]
    )
      ? competition
      : undefined;

  const articles = selected
    ? await getPublishedArticles({ competition: selected })
    : await getPublishedArticles({ category: "INTERNATIONAL" });

  return (
    <>
      <PageHeader
        title="Football international"
        description="Premier League, Liga, Ligue 1, Serie A, Bundesliga, Ligue des champions et plus encore."
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <FilterTabs
          basePath="/football-international"
          paramName="competition"
          active={competition}
          options={INTERNATIONAL_COMPETITIONS.map((c) => ({ value: c, label: c }))}
        />

        {articles.length === 0 ? (
          <p className="mt-12 text-center text-muted-foreground">
            Aucun article pour cette sélection pour le moment.
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
