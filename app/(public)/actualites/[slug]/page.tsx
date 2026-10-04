import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Eye } from "lucide-react";
import { ArticleCard } from "@/components/sections/ArticleCard";
import { ShareButtons } from "@/components/sections/ShareButtons";
import { AdSlot } from "@/components/sections/AdSlot";
import { Logo } from "@/components/ui/Logo";
import { getArticleBySlug, getRelatedArticles } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { ARTICLE_CATEGORY_LABELS, SITE_URL } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;

type Params = { slug: string };

const WORDS_PER_MINUTE = 200;

function readingMinutes(html: string) {
  const words = html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(date);
}

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
      type: "article",
      title: article.title,
      description: article.excerpt,
      images: article.coverImage ? [article.coverImage] : undefined,
      publishedTime: article.publishedAt?.toISOString(),
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
  const writer =
    article.writer && article.writer.visible && !article.writer.deletedAt ? article.writer : null;
  const categoryLabel = ARTICLE_CATEGORY_LABELS[article.category] ?? article.category;
  const minutes = readingMinutes(article.content);
  const wasUpdated =
    article.publishedAt && article.updatedAt.getTime() - article.publishedAt.getTime() > 60 * 60 * 1000;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: article.coverImage ? [article.coverImage] : undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    mainEntityOfPage: `${SITE_URL}/actualites/${article.slug}`,
    articleSection: categoryLabel,
    author: writer
      ? { "@type": "Person", name: writer.name, url: `${SITE_URL}/equipe/${writer.id}` }
      : { "@type": "Organization", name: "La Rédaction FMA SPORT" },
    publisher: { "@type": "Organization", name: "FMA SPORT", url: SITE_URL },
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
        <nav aria-label="Fil d'Ariane" className="text-xs text-muted-foreground">
          <Link href="/" className="hover:text-accent">Accueil</Link>
          <span className="mx-1.5">/</span>
          <Link href="/actualites" className="hover:text-accent">Actualités</Link>
          <span className="mx-1.5">/</span>
          <Link
            href={`/actualites?categorie=${article.category}`}
            className="hover:text-accent"
          >
            {categoryLabel}
          </Link>
        </nav>

        <p className="mt-6 text-xs font-bold uppercase tracking-widest text-accent">
          {categoryLabel}
          {article.competition && <span className="text-muted-foreground"> · {article.competition}</span>}
          {article.country && article.country !== categoryLabel && (
            <span className="text-muted-foreground"> · {article.country}</span>
          )}
        </p>
        <h1 className="mt-3 font-heading text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
          {article.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{article.excerpt}</p>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-border py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-card">
              {writer?.photo ? (
                <Image src={writer.photo} alt="" fill sizes="40px" className="object-cover" unoptimized />
              ) : (
                <Logo size={28} />
              )}
            </div>
            <div className="text-sm leading-tight">
              <p className="font-semibold text-foreground">
                Par{" "}
                {writer ? (
                  <Link href={`/equipe/${writer.id}`} className="hover:text-accent">
                    {writer.name}
                  </Link>
                ) : (
                  "La Rédaction FMA SPORT"
                )}
              </p>
              {writer && <p className="text-xs text-muted-foreground">{writer.role}</p>}
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            {article.publishedAt && (
              <p>
                Publié le{" "}
                <time dateTime={article.publishedAt.toISOString()}>
                  {formatDate(article.publishedAt)} à {formatTime(article.publishedAt)}
                </time>
              </p>
            )}
            {wasUpdated && (
              <p>
                Mis à jour le{" "}
                <time dateTime={article.updatedAt.toISOString()}>
                  {formatDate(article.updatedAt)} à {formatTime(article.updatedAt)}
                </time>
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground sm:ml-auto">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {minutes} min de lecture
            </span>
            {article.views > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                {article.views.toLocaleString("fr-FR")} lectures
              </span>
            )}
          </div>
        </div>
      </header>

      {article.coverImage && (
        <figure className="mx-auto mt-8 max-w-4xl px-4 sm:px-6">
          <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
            />
          </div>
          <figcaption className="mt-2 text-xs text-muted-foreground">
            {article.coverImage.includes("images.unsplash.com") ? "Photo : Unsplash" : "© FMA SPORT"}
          </figcaption>
        </figure>
      )}

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div
          className="max-w-none text-[1.0625rem] leading-[1.8] text-foreground [&_a]:text-accent [&_a]:underline [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:font-heading [&_h3]:text-xl [&_h3]:font-semibold [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {article.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Link
                key={tag}
                href={`/recherche?q=${encodeURIComponent(tag)}`}
                className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-accent hover:text-accent"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 border-t border-border pt-6">
          <ShareButtons title={article.title} />
        </div>
      </div>

      <AdSlot placement="ARTICLE" className="mx-auto max-w-3xl px-4 pb-10 sm:px-6" />

      {related.length > 0 && (
        <section className="border-t border-border bg-card py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-6 border-l-4 border-accent pl-3 font-heading text-xl font-bold uppercase tracking-wide text-foreground">
              À lire aussi
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
