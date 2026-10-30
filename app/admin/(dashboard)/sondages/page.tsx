import { Archive, Pencil, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AdminItemRow } from "@/components/admin/AdminItemRow";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { statusMeta } from "@/lib/admin-ui";
import { formatDate } from "@/lib/utils";
import { parsePage, paginationArgs, ADMIN_PAGE_SIZE } from "@/lib/pagination";
import { DeletePollButton, RestorePollButton } from "./RowActions";

export const dynamic = "force-dynamic";

export default async function AdminPollsPage({
  searchParams,
}: {
  searchParams: Promise<{ corbeille?: string; page?: string }>;
}) {
  const { corbeille, page } = await searchParams;
  const showTrash = corbeille === "1";
  const where = { deletedAt: showTrash ? { not: null } : null };

  const [total, polls] = await Promise.all([
    prisma.poll.count({ where }),
    prisma.poll.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { ballots: true, questions: true } } },
      ...paginationArgs(page),
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-foreground">Sondages ({total})</h1>
        <div className="flex items-center gap-2">
          <Button href={showTrash ? "/admin/sondages" : "/admin/sondages?corbeille=1"} variant="ghost" size="sm">
            {showTrash ? (
              <>
                <Archive className="h-4 w-4" aria-hidden="true" /> Voir les sondages actifs
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Corbeille
              </>
            )}
          </Button>
          {!showTrash && <Button href="/admin/sondages/new">Nouveau sondage</Button>}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {polls.map((poll) => {
          const meta = statusMeta(poll.status);
          return (
            <AdminItemRow
              key={poll.id}
              href={showTrash ? undefined : `/admin/sondages/${poll.id}`}
              thumbnail={poll.coverImage}
              badges={<StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>}
              title={poll.title}
              meta={
                showTrash && poll.deletedAt
                  ? `Supprimé le ${formatDate(poll.deletedAt)}`
                  : `${poll._count.questions} question${poll._count.questions > 1 ? "s" : ""} · ${poll._count.ballots} participant${poll._count.ballots > 1 ? "s" : ""}`
              }
              actions={
                showTrash ? (
                  <RestorePollButton id={poll.id} />
                ) : (
                  <>
                    <Button href={`/admin/sondages/${poll.id}`} variant="ghost" size="sm">
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      Modifier
                    </Button>
                    <DeletePollButton id={poll.id} />
                  </>
                )
              }
            />
          );
        })}
        {polls.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            {showTrash ? "La corbeille est vide." : "Aucun sondage. Créez le premier avec « Nouveau sondage »."}
          </p>
        )}
      </div>
      <AdminPagination currentPage={parsePage(page)} totalPages={totalPages} />
    </div>
  );
}
