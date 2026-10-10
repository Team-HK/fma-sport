import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PlayerForm } from "../PlayerForm";

export const dynamic = "force-dynamic";

export default async function EditPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const player = await prisma.player.findUnique({ where: { id }, include: { stats: true } });
  if (!player || player.deletedAt) notFound();

  return (
    <div>
      <Link
        href="/admin/joueurs"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Retour aux joueurs
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            {player.firstName} {player.lastName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Modifier le profil — {player.status === "PUBLISHED" ? "publié" : "brouillon"}
          </p>
        </div>
        {player.status === "PUBLISHED" && (
          <Link
            href={`/joueurs/${player.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-border px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Voir la fiche publique
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        )}
      </div>

      <div className="mt-6">
        <PlayerForm player={player} cancelHref="/admin/joueurs" />
      </div>
    </div>
  );
}
