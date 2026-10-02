import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AdminListToolbar } from "@/components/admin/AdminListToolbar";
import { AdminItemRow } from "@/components/admin/AdminItemRow";
import { Trash2, Archive } from "lucide-react";
import { DeleteAdButton, RestoreAdButton, ToggleAdButton } from "./RowActions";
import { EditAdModal } from "./EditAdModal";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const PLACEMENTS = ["HOME", "ACTUALITES", "ARTICLE", "VIDEOS", "TALENTS", "FOOTER"];

export default async function AdminAdsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; placement?: string; corbeille?: string }>;
}) {
  const { q, placement, corbeille } = await searchParams;
  const showTrash = corbeille === "1";

  const where: Prisma.AdvertisementWhereInput = {
    deletedAt: showTrash ? { not: null } : null,
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    ...(placement ? { placement: placement as never } : {}),
  };

  const ads = await prisma.advertisement.findMany({ where, orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-foreground">Publicités</h1>
        <div className="flex items-center gap-2">
          <Button
            href={showTrash ? "/admin/publicites" : "/admin/publicites?corbeille=1"}
            variant="ghost"
            size="sm"
          >
            {showTrash ? (
              <>
                <Archive className="h-4 w-4" aria-hidden="true" /> Voir les publicités actives
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Corbeille
              </>
            )}
          </Button>
          {!showTrash && <Button href="/admin/publicites/new">Nouvelle publicité</Button>}
        </div>
      </div>

      {!showTrash && (
        <div className="mt-4">
          <AdminListToolbar
            searchPlaceholder="Rechercher une publicité..."
            filters={[
              {
                param: "placement",
                label: "Tous les emplacements",
                options: PLACEMENTS.map((p) => ({ value: p, label: p })),
              },
            ]}
          />
        </div>
      )}

      <div className="mt-6 space-y-3">
        {ads.map((ad) => (
          <AdminItemRow
            key={ad.id}
            thumbnail={ad.format === "VIDEO" ? undefined : ad.mediaUrl}
            badges={
              <>
                <StatusBadge tone="info">{ad.format}</StatusBadge>
                <StatusBadge tone="info">{ad.placement}</StatusBadge>
                <StatusBadge tone={ad.active ? "success" : "neutral"}>
                  {ad.active ? "Active" : "Inactive"}
                </StatusBadge>
              </>
            }
            title={ad.title}
            actions={
              showTrash ? (
                <RestoreAdButton id={ad.id} />
              ) : (
                <>
                  <ToggleAdButton id={ad.id} active={ad.active} />
                  <EditAdModal ad={ad} />
                  <DeleteAdButton id={ad.id} />
                </>
              )
            }
          />
        ))}
        {ads.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            {showTrash ? "La corbeille est vide." : "Aucune publicité pour cette recherche."}
          </p>
        )}
      </div>
    </div>
  );
}
