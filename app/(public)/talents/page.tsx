import type { Metadata } from "next";
import type { PlayerPosition } from "@prisma/client";
import { PageHeader } from "@/components/sections/PageHeader";
import { PlayerCard } from "@/components/sections/PlayerCard";
import { FilterTabs } from "@/components/sections/FilterTabs";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdSlot } from "@/components/sections/AdSlot";
import { prisma } from "@/lib/prisma";
import { parsePage } from "@/lib/pagination";

export const metadata: Metadata = {
  title: "Nos talents",
  description: "Découvrez les jeunes footballeurs mis en avant par FMA SPORT.",
};

const PAGE_SIZE = 24;

const POSITION_GROUPS: Record<string, { label: string; positions: PlayerPosition[] }> = {
  gardiens: { label: "Gardiens", positions: ["GARDIEN"] },
  defenseurs: { label: "Défenseurs", positions: ["DEFENSEUR_CENTRAL", "LATERAL_DROIT", "LATERAL_GAUCHE"] },
  milieux: { label: "Milieux", positions: ["MILIEU_DEFENSIF", "MILIEU_CENTRAL", "MILIEU_OFFENSIF"] },
  attaquants: { label: "Attaquants", positions: ["AILIER_DROIT", "AILIER_GAUCHE", "AVANT_CENTRE"] },
};

export default async function TalentsPage({
  searchParams,
}: {
  searchParams: Promise<{ poste?: string; page?: string }>;
}) {
  const { poste, page } = await searchParams;
  const group = poste ? POSITION_GROUPS[poste] : undefined;
  const currentPage = parsePage(page);

  const where = {
    status: "PUBLISHED" as const,
    deletedAt: null,
    ...(group ? { position: { in: group.positions } } : {}),
  };

  const [total, players] = await Promise.all([
    prisma.player.count({ where }).catch(() => 0),
    prisma.player
      .findMany({
        where,
        orderBy: [{ isDemo: "asc" }, { updatedAt: "desc" }],
        skip: (currentPage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      })
      .catch(() => []),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <PageHeader
        title="Nos talents"
        description="Les jeunes footballeurs repérés et accompagnés par FMA SPORT, au Sénégal et en Afrique de l'Ouest."
      />

      <AdSlot placement="TALENTS" className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <FilterTabs
            basePath="/talents"
            paramName="poste"
            allLabel="Tous"
            active={group ? poste : undefined}
            options={Object.entries(POSITION_GROUPS).map(([value, g]) => ({ value, label: g.label }))}
          />
          <p className="text-sm text-muted-foreground">
            {total} talent{total > 1 ? "s" : ""}
          </p>
        </div>

        {players.length === 0 ? (
          <p className="mt-10 text-center text-muted-foreground">Aucun talent publié pour le moment.</p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {players.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        )}

        <div className="mt-10">
          <AdminPagination currentPage={currentPage} totalPages={totalPages} />
        </div>
      </div>
    </>
  );
}
