import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AdminListToolbar } from "@/components/admin/AdminListToolbar";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { formatDate } from "@/lib/utils";
import { parsePage, paginationArgs, ADMIN_PAGE_SIZE } from "@/lib/pagination";
import { Trash2, Archive } from "lucide-react";
import { MessageRowActions, RestoreMessageButton } from "./RowActions";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  CONTACT: "Contact général",
  PARTNERSHIP: "Partenariat",
  MEDIA: "Média",
  PLAYER: "Au sujet d'un joueur",
};

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; corbeille?: string; page?: string }>;
}) {
  const { q, type, corbeille, page } = await searchParams;
  const showTrash = corbeille === "1";

  const where: Prisma.ContactMessageWhereInput = {
    deletedAt: showTrash ? { not: null } : null,
    ...(q
      ? {
          OR: [
            { fullName: { contains: q, mode: "insensitive" } },
            { subject: { contains: q, mode: "insensitive" } },
            { message: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(type ? { type: type as never } : {}),
  };

  const [total, messages] = await Promise.all([
    prisma.contactMessage.count({ where }),
    prisma.contactMessage.findMany({ where, orderBy: { createdAt: "desc" }, ...paginationArgs(page) }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-foreground">Messages</h1>
        <Button
          href={showTrash ? "/admin/messages" : "/admin/messages?corbeille=1"}
          variant="ghost"
          size="sm"
        >
          {showTrash ? (
            <>
              <Archive className="h-4 w-4" aria-hidden="true" /> Voir les messages actifs
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4" aria-hidden="true" /> Corbeille
            </>
          )}
        </Button>
      </div>

      {!showTrash && (
        <div className="mt-4">
          <AdminListToolbar
            searchPlaceholder="Rechercher un message..."
            filters={[
              {
                param: "type",
                label: "Tous les types",
                options: Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label })),
              },
            ]}
          />
        </div>
      )}

      <div className="mt-6 space-y-3">
        {messages.map((m) => (
          <Card key={m.id} className={m.read && !showTrash ? "p-4 opacity-70" : "p-4"}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <StatusBadge tone="info">{TYPE_LABELS[m.type] ?? m.type}</StatusBadge>
                  {!m.read && !showTrash && <StatusBadge tone="warning">Non lu</StatusBadge>}
                  <span className="text-xs text-muted-foreground">{formatDate(m.createdAt)}</span>
                </div>
                <p className="mt-1 font-semibold text-foreground">
                  {m.fullName} — {m.subject}
                </p>
                <p className="text-sm text-muted-foreground">
                  {m.email}
                  {m.phone ? ` · ${m.phone}` : ""}
                </p>
                <p className="mt-2 whitespace-pre-line text-sm text-foreground">{m.message}</p>
              </div>
              {showTrash ? (
                <RestoreMessageButton id={m.id} />
              ) : (
                <MessageRowActions id={m.id} read={m.read} />
              )}
            </div>
          </Card>
        ))}
        {messages.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            {showTrash ? "La corbeille est vide." : "Aucun message pour cette recherche."}
          </p>
        )}
      </div>
      <AdminPagination currentPage={parsePage(page)} totalPages={totalPages} />
    </div>
  );
}
