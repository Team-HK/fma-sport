import Link from "next/link";
import Image from "next/image";
import type { Article } from "@prisma/client";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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
    <Card className="group overflow-hidden p-0">
      <Link href={`/actualites/${article.slug}`} className="block">
        <div className="relative aspect-video overflow-hidden bg-muted">
          {article.coverImage && (
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
        </div>
        <div className="p-5">
          <Badge>{ARTICLE_CATEGORY_LABELS[article.category] ?? article.category}</Badge>
          <h3 className="mt-3 line-clamp-2 font-heading text-lg font-semibold text-foreground group-hover:text-primary">
            {article.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{article.excerpt}</p>
          {article.publishedAt && (
            <p className="mt-3 text-xs text-muted-foreground">
              {formatDate(article.publishedAt)}
            </p>
          )}
        </div>
      </Link>
    </Card>
  );
}
