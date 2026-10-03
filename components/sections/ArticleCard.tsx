import Link from "next/link";
import Image from "next/image";
import type { Article } from "@prisma/client";
import { ARTICLE_CATEGORY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export function ArticleCard({
  article,
  priority = false,
}: {
  article: Article;
  priority?: boolean;
}) {
  return (
    <article className="group">
      <Link href={`/actualites/${article.slug}`} className="block">
        <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
          {article.coverImage && (
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          )}
        </div>
        <div className="pt-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-accent">
            {ARTICLE_CATEGORY_LABELS[article.category] ?? article.category}
          </p>
          <h3 className="mt-1.5 line-clamp-2 font-heading text-lg font-semibold leading-snug text-foreground group-hover:text-accent">
            {article.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{article.excerpt}</p>
          {article.publishedAt && (
            <p className="mt-3 text-xs text-muted-foreground">
              <time dateTime={article.publishedAt.toISOString()}>{formatDate(article.publishedAt)}</time>
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}
