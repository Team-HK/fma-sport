import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AdminListToolbar } from "@/components/admin/AdminListToolbar";
import { AdminItemRow } from "@/components/admin/AdminItemRow";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { ARTICLE_CATEGORY_LABELS } from "@/lib/constants";
import { statusMeta } from "@/lib/admin-ui";
import { formatDate } from "@/lib/utils";
import { parsePage, paginationArgs, ADMIN_PAGE_SIZE } from "@/lib/pagination";
import { Trash2, Archive } from "lucide-react";
import { DeleteArticleButton, RestoreArticleButton, TogglePublishButton } from "./ArticleRowActions";
import { EditArticleModal } from "./EditArticleModal";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; category?: string; corbeille?: string; page?: string }>;
}) {
  const { q, status, category, corbeille, page } = await searchParams;
  const showTrash = corbeille === "1";

  const where: Prisma.ArticleWhereInput = {
    deletedAt: showTrash ? { not: null } : null,
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    ...(status ? { status: status as never } : {}),
    ...(category ? { category: category as never } : {}),
  };

  const [total, articles, writers] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.findMany({ where, orderBy: { createdAt: "desc" }, ...paginationArgs(page) }),
    prisma.teamMember.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, role: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-foreground">Articles</h1>
        <div className="flex items-center gap-2">
          <Button
            href={showTrash ? "/admin/articles" : "/admin/articles?corbeille=1"}
            variant="ghost"
            size="sm"
          >
            {showTrash ? (
              <>
                <Archive className="h-4 w-4" aria-hidden="true" /> Voir les articles actifs
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Corbeille
              </>
            )}
          </Button>
          {!showTrash && <Button href="/admin/articles/new">Nouvel article</Button>}
        </div>
      </div>

      {!showTrash && (
        <div className="mt-4">
          <AdminListToolbar
            searchPlaceholder="Rechercher un article..."
            filters={[
              {
                param: "status",
                label: "Tous les statuts",
                options: [
                  { value: "DRAFT", label: "Brouillon" },
                  { value: "SCHEDULED", label: "Programmé" },
                  { value: "PUBLISHED", label: "Publié" },
                ],
              },
              {
                param: "category",
                label: "Toutes les catégories",
                options: Object.entries(ARTICLE_CATEGORY_LABELS).map(([value, label]) => ({
                  value,
                  label,
                })),
              },
            ]}
          />
        </div>
      )}

      <div className="mt-6 space-y-3">
        {articles.map((article) => {
          const meta = statusMeta(article.status);
          return (
            <AdminItemRow
              key={article.id}
              thumbnail={article.coverImage}
              badges={
                <>
                  <StatusBadge tone="info">
                    {ARTICLE_CATEGORY_LABELS[article.category] ?? article.category}
                  </StatusBadge>
                  <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                </>
              }
              title={article.title}
              meta={
                <>
                  {article.publishedAt ? formatDate(article.publishedAt) : "Non publié"} ·{" "}
                  {article.views} vues
                </>
              }
              actions={
                showTrash ? (
                  <RestoreArticleButton id={article.id} />
                ) : (
                  <>
                    <TogglePublishButton id={article.id} status={article.status} />
                    <EditArticleModal article={article} writers={writers} />
                    <DeleteArticleButton id={article.id} />
                  </>
                )
              }
            />
          );
        })}
        {articles.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            {showTrash ? "La corbeille est vide." : "Aucun article pour cette recherche."}
          </p>
        )}
      </div>
      <AdminPagination currentPage={parsePage(page)} totalPages={totalPages} />
    </div>
  );
}
