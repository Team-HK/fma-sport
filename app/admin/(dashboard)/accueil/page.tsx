import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AdminListToolbar } from "@/components/admin/AdminListToolbar";
import { AdminItemRow } from "@/components/admin/AdminItemRow";
import { Trash2, Archive } from "lucide-react";
import { DeleteHeroSlideButton, RestoreHeroSlideButton } from "./RowActions";
import { EditHeroSlideModal } from "./EditHeroSlideModal";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminHeroSlidesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; corbeille?: string }>;
}) {
  const { q, corbeille } = await searchParams;
  const showTrash = corbeille === "1";

  const where: Prisma.HeroSlideWhereInput = {
    deletedAt: showTrash ? { not: null } : null,
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
  };

  const slides = await prisma.heroSlide.findMany({ where, orderBy: [{ order: "asc" }, { createdAt: "desc" }] });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Carousel d&apos;accueil</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Images et textes affichés dans le grand bandeau en haut de la page d&apos;accueil.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            href={showTrash ? "/admin/accueil" : "/admin/accueil?corbeille=1"}
            variant="ghost"
            size="sm"
          >
            {showTrash ? (
              <>
                <Archive className="h-4 w-4" aria-hidden="true" /> Voir les diapositives actives
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Corbeille
              </>
            )}
          </Button>
          {!showTrash && <Button href="/admin/accueil/new">Nouvelle diapositive</Button>}
        </div>
      </div>

      {!showTrash && (
        <div className="mt-4">
          <AdminListToolbar searchPlaceholder="Rechercher une diapositive..." filters={[]} />
        </div>
      )}

      <div className="mt-6 space-y-3">
        {slides.map((slide) => (
          <AdminItemRow
            key={slide.id}
            thumbnail={slide.imageUrl}
            badges={
              <>
                <StatusBadge tone="info">Ordre {slide.order}</StatusBadge>
                <StatusBadge tone={slide.active ? "success" : "neutral"}>
                  {slide.active ? "Active" : "Inactive"}
                </StatusBadge>
              </>
            }
            title={slide.title || "(sans titre — logo par défaut)"}
            meta={slide.subtitle ?? undefined}
            actions={
              showTrash ? (
                <RestoreHeroSlideButton id={slide.id} />
              ) : (
                <>
                  <EditHeroSlideModal slide={slide} />
                  <DeleteHeroSlideButton id={slide.id} />
                </>
              )
            }
          />
        ))}
        {slides.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">
            {showTrash
              ? "La corbeille est vide."
              : "Aucune diapositive configurée — le site affiche les images par défaut."}
          </p>
        )}
      </div>
    </div>
  );
}
