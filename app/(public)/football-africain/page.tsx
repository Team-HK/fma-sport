import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { FilterTabs } from "@/components/sections/FilterTabs";
import { ArticleCard } from "@/components/sections/ArticleCard";
import { getPublishedArticles } from "@/lib/queries";
import { NewsWire } from "@/components/sections/NewsWire";
import Link from "next/link";
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
    ? await getPublishedArticles({ country, take: 24 })
    : await getPublishedArticles({ category: "AFRIQUE", take: 24 });

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
          <NewsWire
            regions={["senegal", "afrique"]}
            title="Sénégal & Afrique : l'actu en continu"
            limit={20}
            className="mt-8"
          />
        ) : (
          <div className="mt-8 grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="grid gap-6 sm:grid-cols-2">
                {allArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
              {allArticles.length === 24 && (
                <Link
                  href="/actualites"
                  className="mt-8 inline-block text-sm font-semibold text-accent hover:underline"
                >
                  Toutes les actualités →
                </Link>
              )}
            </div>
            <NewsWire regions={["senegal", "afrique"]} title="En continu" limit={12} />
          </div>
        )}
      </div>
    </>
  );
}
