import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/sections/PageHeader";
import { FilterTabs } from "@/components/sections/FilterTabs";
import { ArticleCard } from "@/components/sections/ArticleCard";
import { getPublishedArticles } from "@/lib/queries";
import { ARTICLE_CATEGORY_LABELS } from "@/lib/constants";
import { AdSlot } from "@/components/sections/AdSlot";
import { formatDate } from "@/lib/utils";
import type { ArticleCategory } from "@prisma/client";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Actualités football",
  description:
    "L'actualité du football sénégalais, africain et international : résultats, mercato, analyses et portraits.",
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
  const [lead, ...rest] = articles;
  const mostRead = [...articles].sort((a, b) => b.views - a.views).slice(0, 5);

  return (
    <>
      <PageHeader
        title="Actualités football"
        description="L'actualité du football sénégalais, africain et international : résultats, mercato, analyses et portraits."
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

        {!lead ? (
          <p className="mt-12 text-center text-muted-foreground">
            Aucun article dans cette catégorie pour le moment.
          </p>
        ) : (
          <>
            <div className="mt-8 grid gap-8 lg:grid-cols-3">
              <Link href={`/actualites/${lead.slug}`} className="group lg:col-span-2">
                <article>
                  <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-muted">
                    {lead.coverImage && (
                      <Image
                        src={lead.coverImage}
                        alt={lead.title}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 66vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    )}
                  </div>
                  <p className="mt-4 text-xs font-bold uppercase tracking-widest text-accent">
                    {ARTICLE_CATEGORY_LABELS[lead.category] ?? lead.category}
                  </p>
                  <h2 className="mt-2 font-heading text-2xl font-bold leading-tight text-foreground group-hover:text-accent sm:text-3xl">
                    {lead.title}
                  </h2>
                  <p className="mt-3 text-base text-muted-foreground">{lead.excerpt}</p>
                  {lead.publishedAt && (
                    <p className="mt-3 text-xs text-muted-foreground">{formatDate(lead.publishedAt)}</p>
                  )}
                </article>
              </Link>

              <aside aria-labelledby="most-read-heading">
                <h2
                  id="most-read-heading"
                  className="border-l-4 border-accent pl-3 font-heading text-base font-bold uppercase tracking-wide text-foreground"
                >
                  Les plus lus
                </h2>
                <ol className="mt-4 divide-y divide-border">
                  {mostRead.map((item, i) => (
                    <li key={item.id}>
                      <Link href={`/actualites/${item.slug}`} className="group flex gap-4 py-3.5">
                        <span className="font-heading text-2xl font-bold leading-none text-accent/80">
                          {i + 1}
                        </span>
                        <span>
                          <span className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                            {ARTICLE_CATEGORY_LABELS[item.category] ?? item.category}
                          </span>
                          <span className="mt-0.5 line-clamp-2 block text-sm font-semibold text-foreground group-hover:text-accent">
                            {item.title}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </aside>
            </div>

            {rest.length > 0 && (
              <section className="mt-12 border-t border-border pt-8">
                <h2 className="border-l-4 border-accent pl-3 font-heading text-base font-bold uppercase tracking-wide text-foreground">
                  Toute l&apos;actualité
                </h2>
                <div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </>
  );
}
