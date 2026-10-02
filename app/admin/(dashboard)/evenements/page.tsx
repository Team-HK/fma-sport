import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AdminListToolbar } from "@/components/admin/AdminListToolbar";
import { AdminItemRow } from "@/components/admin/AdminItemRow";
import { statusMeta } from "@/lib/admin-ui";
import { formatDate } from "@/lib/utils";
import { Trash2, Archive } from "lucide-react";
import { DeleteEventButton, RestoreEventButton } from "./RowActions";
import { EditEventModal } from "./EditEventModal";
import { RegistrationsModal } from "./RegistrationsModal";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; corbeille?: string }>;
}) {
  const { q, status, corbeille } = await searchParams;
  const showTrash = corbeille === "1";

  const where: Prisma.EventWhereInput = {
    deletedAt: showTrash ? { not: null } : null,
    ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    ...(status ? { status: status as never } : {}),
  };

  const events = await prisma.event.findMany({
    where,
    orderBy: { date: "desc" },
    include: { registrations: { orderBy: { createdAt: "desc" } } },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-foreground">Événements</h1>
        <div className="flex items-center gap-2">
          <Button
            href={showTrash ? "/admin/evenements" : "/admin/evenements?corbeille=1"}
            variant="ghost"
            size="sm"
          >
            {showTrash ? (
              <>
                <Archive className="h-4 w-4" aria-hidden="true" /> Voir les événements actifs
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Corbeille
              </>
            )}
          </Button>
          {!showTrash && <Button href="/admin/evenements/new">Nouvel événement</Button>}
        </div>
      </div>

      {!showTrash && (
        <div className="mt-4">
          <AdminListToolbar
            searchPlaceholder="Rechercher un événement..."
            filters={[
              {
                param: "status",
                label: "Tous les statuts",
                options: [
                  { value: "DRAFT", label: "Brouillon" },
                  { value: "PUBLISHED", label: "Publié" },
                  { value: "RESULTS_PUBLISHED", label: "Résultats publiés" },
                ],
              },
            ]}
          />
        </div>
      )}

      <div className="mt-6 space-y-3">
        {events.map((event) => {
          const meta = statusMeta(event.status);
          return (
            <AdminItemRow
              key={event.id}
              thumbnail={event.poster}
              badges={<StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>}
              title={event.name}
              meta={
                <>
                  {formatDate(event.date)} — {event.location}
                </>
              }
              actions={
                showTrash ? (
                  <RestoreEventButton id={event.id} />
                ) : (
                  <>
                    <RegistrationsModal eventName={event.name} registrations={event.registrations} />
                    <EditEventModal event={event} />
                    <DeleteEventButton id={event.id} />
                  </>
                )
              }
            />
          );
        })}
        {events.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            {showTrash ? "La corbeille est vide." : "Aucun événement pour cette recherche."}
          </p>
        )}
      </div>
    </div>
  );
}
