import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/sections/PageHeader";
import { ArticleCard } from "@/components/sections/ArticleCard";
import { ShareButtons } from "@/components/sections/ShareButtons";
import { AdSlot } from "@/components/sections/AdSlot";
import { Badge } from "@/components/ui/Badge";
import { getArticleBySlug, getRelatedArticles } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { ARTICLE_CATEGORY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 300;

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.coverImage ? [article.coverImage] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  prisma.article.update({ where: { slug }, data: { views: { increment: 1 } } }).catch(() => {});

  const related = await getRelatedArticles(article.category, article.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: article.coverImage ? [article.coverImage] : undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    mainEntityOfPage: `${SITE_URL}/actualites/${article.slug}`,
    publisher: { "@type": "Organization", name: "FMA SPORT", url: SITE_URL },
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader
        title={article.title}
        description={`${ARTICLE_CATEGORY_LABELS[article.category] ?? article.category} · ${
          article.publishedAt ? formatDate(article.publishedAt) : ""
        }`}
      />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Badge>{ARTICLE_CATEGORY_LABELS[article.category] ?? article.category}</Badge>

        {article.coverImage && (
          <div className="relative mt-6 aspect-video overflow-hidden rounded-xl bg-muted">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}

        <div
          className="prose prose-neutral mt-8 max-w-none text-foreground [&_p]:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <div className="mt-10 border-t border-border pt-6">
          <ShareButtons title={article.title} />
        </div>
      </div>

      <AdSlot placement="ARTICLE" className="mx-auto max-w-3xl px-4 pb-10 sm:px-6" />

      {related.length > 0 && (
        <section className="bg-card py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-6 font-heading text-2xl font-bold text-foreground">
              Articles similaires
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ArticleCard key={item.id} article={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
