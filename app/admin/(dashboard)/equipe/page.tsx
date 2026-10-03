import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AdminListToolbar } from "@/components/admin/AdminListToolbar";
import { AdminItemRow } from "@/components/admin/AdminItemRow";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { parsePage, paginationArgs, ADMIN_PAGE_SIZE } from "@/lib/pagination";
import { Trash2, Archive } from "lucide-react";
import { DeleteTeamMemberButton, RestoreTeamMemberButton } from "./RowActions";
import { EditTeamMemberModal } from "./EditTeamMemberModal";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; corbeille?: string; page?: string }>;
}) {
  const { q, corbeille, page } = await searchParams;
  const showTrash = corbeille === "1";

  const where: Prisma.TeamMemberWhereInput = {
    deletedAt: showTrash ? { not: null } : null,
    ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
  };

  const [total, members] = await Promise.all([
    prisma.teamMember.count({ where }),
    prisma.teamMember.findMany({ where, orderBy: [{ order: "asc" }, { createdAt: "desc" }], ...paginationArgs(page) }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-foreground">Équipe</h1>
        <div className="flex items-center gap-2">
          <Button href={showTrash ? "/admin/equipe" : "/admin/equipe?corbeille=1"} variant="ghost" size="sm">
            {showTrash ? (
              <>
                <Archive className="h-4 w-4" aria-hidden="true" /> Voir l&apos;équipe active
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Corbeille
              </>
            )}
          </Button>
          {!showTrash && <Button href="/admin/equipe/new">Nouveau membre</Button>}
        </div>
      </div>

      {!showTrash && (
        <div className="mt-4">
          <AdminListToolbar searchPlaceholder="Rechercher un membre..." />
        </div>
      )}

      <div className="mt-6 space-y-3">
        {members.map((m) => (
          <AdminItemRow
            key={m.id}
            thumbnail={m.photo}
            badges={
              <>
                {m.department && <StatusBadge tone="info">{m.department}</StatusBadge>}
                <StatusBadge tone={m.visible ? "success" : "neutral"}>
                  {m.visible ? "Visible sur le site" : "Masqué"}
                </StatusBadge>
              </>
            }
            title={m.name}
            meta={m.role}
            actions={
              showTrash ? (
                <RestoreTeamMemberButton id={m.id} />
              ) : (
                <>
                  <EditTeamMemberModal member={m} />
                  <DeleteTeamMemberButton id={m.id} />
                </>
              )
            }
          />
        ))}
        {members.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            {showTrash ? "La corbeille est vide." : "Aucun membre pour cette recherche."}
          </p>
        )}
      </div>
      <AdminPagination currentPage={parsePage(page)} totalPages={totalPages} />
    </div>
  );
}
