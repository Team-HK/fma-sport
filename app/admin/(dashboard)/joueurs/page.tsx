import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs } from "@/components/ui/Tabs";
import { AdminListToolbar } from "@/components/admin/AdminListToolbar";
import { AdminItemRow } from "@/components/admin/AdminItemRow";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { statusMeta } from "@/lib/admin-ui";
import { formatDate } from "@/lib/utils";
import { parsePage, paginationArgs, ADMIN_PAGE_SIZE } from "@/lib/pagination";
import { Trash2, Archive, Pencil } from "lucide-react";
import { CandidacyRowActions } from "./CandidacyRowActions";
import { DeletePlayerButton, RestorePlayerButton } from "./PlayerRowActions";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminPlayersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; corbeille?: string; page?: string }>;
}) {
  const { q, status, corbeille, page } = await searchParams;
  const showTrash = corbeille === "1";

  const playerWhere = {
    deletedAt: showTrash ? { not: null } : null,
    ...(q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { club: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status ? { status: status as never } : {}),
  } satisfies Prisma.PlayerWhereInput;

  const [candidacies, totalPlayers, players] = await Promise.all([
    prisma.candidacy.findMany({
      where: { status: { in: ["PENDING", "INFO_REQUESTED"] } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.player.count({ where: playerWhere }),
    prisma.player.findMany({
      where: playerWhere,
      orderBy: { createdAt: "desc" },
      ...paginationArgs(page),
    }),
  ]);
  const totalPlayerPages = Math.max(1, Math.ceil(totalPlayers / ADMIN_PAGE_SIZE));

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">Joueurs</h1>

      <div className="mt-6">
        <Tabs
          tabs={[
            {
              id: "candidatures",
              label: `Candidatures (${candidacies.length})`,
              content: (
                <div className="space-y-3">
                  {candidacies.length === 0 && (
                    <p className="py-8 text-center text-muted-foreground">
                      Aucune candidature en attente.
                    </p>
                  )}
                  {candidacies.map((c) => {
                    const meta = statusMeta(c.status);
                    return (
                      <AdminItemRow
                        key={c.id}
                        href={`/admin/joueurs/candidatures/${c.id}`}
                        badges={<StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>}
                        title={`${c.firstName} ${c.lastName} — ${c.nationality}`}
                        meta={
                          <>
                            {c.email} · {c.phone} · {formatDate(c.createdAt)}
                          </>
                        }
                        actions={<CandidacyRowActions id={c.id} status={c.status} />}
                      />
                    );
                  })}
                </div>
              ),
            },
            {
              id: "profils",
              label: `Profils joueurs (${totalPlayers})`,
              content: (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Button
                      href={showTrash ? "/admin/joueurs" : "/admin/joueurs?corbeille=1"}
                      variant="ghost"
                      size="sm"
                    >
                      {showTrash ? (
                        <>
                          <Archive className="h-4 w-4" aria-hidden="true" /> Voir les profils actifs
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" aria-hidden="true" /> Corbeille
                        </>
                      )}
                    </Button>
                    {!showTrash && <Button href="/admin/joueurs/new">Nouveau profil</Button>}
                  </div>

                  {!showTrash && (
                    <div className="mt-4">
                      <AdminListToolbar
                        searchPlaceholder="Rechercher un joueur..."
                        filters={[
                          {
                            param: "status",
                            label: "Tous les statuts",
                            options: [
                              { value: "DRAFT", label: "Brouillon" },
                              { value: "PUBLISHED", label: "Publié" },
                            ],
                          },
                        ]}
                      />
                    </div>
                  )}

                  <div className="mt-4 space-y-3">
                    {players.map((p) => {
                      const meta = statusMeta(p.status);
                      return (
                        <AdminItemRow
                          key={p.id}
                          thumbnail={p.photo}
                          badges={<StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>}
                          title={`${p.firstName} ${p.lastName}`}
                          meta={showTrash && p.deletedAt ? `Supprimé le ${formatDate(p.deletedAt)}${p.club ? ` · ${p.club}` : ""}` : (p.club ?? undefined)}
                          actions={
                            showTrash ? (
                              <RestorePlayerButton id={p.id} />
                            ) : (
                              <>
                                <Button href={`/admin/joueurs/${p.id}`} variant="ghost" size="sm">
                                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                                  Modifier
                                </Button>
                                <DeletePlayerButton id={p.id} />
                              </>
                            )
                          }
                        />
                      );
                    })}
                    {players.length === 0 && (
                      <p className="py-8 text-center text-muted-foreground">
                        {showTrash ? "La corbeille est vide." : "Aucun profil pour cette recherche."}
                      </p>
                    )}
                  </div>
                  <AdminPagination currentPage={parsePage(page)} totalPages={totalPlayerPages} />
                </div>
              ),
            },
          ]}
          defaultTab={showTrash || candidacies.length === 0 || q || status || page ? "profils" : undefined}
        />
      </div>
    </div>
  );
}
