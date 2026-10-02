import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AdminListToolbar } from "@/components/admin/AdminListToolbar";
import { AdminItemRow } from "@/components/admin/AdminItemRow";
import { VIDEO_CATEGORY_LABELS, VIDEO_PLATFORM_LABELS } from "@/lib/constants";
import { statusMeta } from "@/lib/admin-ui";
import { Trash2, Archive } from "lucide-react";
import { DeleteVideoButton, RestoreVideoButton } from "./RowActions";
import { EditVideoModal } from "./EditVideoModal";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminVideosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; category?: string; corbeille?: string }>;
}) {
  const { q, status, category, corbeille } = await searchParams;
  const showTrash = corbeille === "1";

  const where: Prisma.VideoWhereInput = {
    deletedAt: showTrash ? { not: null } : null,
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    ...(status ? { status: status as never } : {}),
    ...(category ? { category: category as never } : {}),
  };

  const videos = await prisma.video.findMany({ where, orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-foreground">Vidéos</h1>
        <div className="flex items-center gap-2">
          <Button href={showTrash ? "/admin/videos" : "/admin/videos?corbeille=1"} variant="ghost" size="sm">
            {showTrash ? (
              <>
                <Archive className="h-4 w-4" aria-hidden="true" /> Voir les vidéos actives
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Corbeille
              </>
            )}
          </Button>
          {!showTrash && <Button href="/admin/videos/new">Nouvelle vidéo</Button>}
        </div>
      </div>

      {!showTrash && (
        <div className="mt-4">
          <AdminListToolbar
            searchPlaceholder="Rechercher une vidéo..."
            filters={[
              {
                param: "status",
                label: "Tous les statuts",
                options: [
                  { value: "DRAFT", label: "Brouillon" },
                  { value: "PUBLISHED", label: "Publié" },
                ],
              },
              {
                param: "category",
                label: "Toutes les catégories",
                options: Object.entries(VIDEO_CATEGORY_LABELS).map(([value, label]) => ({
                  value,
                  label,
                })),
              },
            ]}
          />
        </div>
      )}

      <div className="mt-6 space-y-3">
        {videos.map((v) => {
          const meta = statusMeta(v.status);
          return (
            <AdminItemRow
              key={v.id}
              thumbnail={v.thumbnail}
              badges={
                <>
                  <StatusBadge tone="info">
                    {VIDEO_CATEGORY_LABELS[v.category] ?? v.category}
                  </StatusBadge>
                  <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                </>
              }
              title={v.title}
              meta={VIDEO_PLATFORM_LABELS[v.platform] ?? v.platform}
              actions={
                showTrash ? (
                  <RestoreVideoButton id={v.id} />
                ) : (
                  <>
                    <EditVideoModal video={v} />
                    <DeleteVideoButton id={v.id} />
                  </>
                )
              }
            />
          );
        })}
        {videos.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            {showTrash ? "La corbeille est vide." : "Aucune vidéo pour cette recherche."}
          </p>
        )}
      </div>
    </div>
  );
}
