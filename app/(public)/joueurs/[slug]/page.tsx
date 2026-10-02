import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPlayerBySlug } from "@/lib/queries";
import { POSITION_LABELS, STRONG_FOOT_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { VideoCard } from "@/components/sections/VideoCard";
import { formatDate } from "@/lib/utils";
import { FileText } from "lucide-react";

export const revalidate = 300;

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const player = await getPlayerBySlug(slug);
  if (!player) return {};
  return {
    title: `${player.firstName} ${player.lastName}`,
    description: player.bio ?? undefined,
  };
}

export default async function PlayerProfilePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const player = await getPlayerBySlug(slug);

  if (!player || player.status !== "PUBLISHED") {
    notFound();
  }

  const age = Math.floor(
    (Date.now() - new Date(player.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );

  return (
    <div>
      <section className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row lg:px-8">
          <div className="relative aspect-[4/5] w-full max-w-xs shrink-0 overflow-hidden rounded-xl bg-muted">
            {player.photo && (
              <Image
                src={player.photo}
                alt={`${player.firstName} ${player.lastName}`}
                fill
                sizes="320px"
                priority
                className="object-cover"
              />
            )}
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
              {player.firstName} {player.lastName}{" "}
              {player.flag && <span aria-hidden="true">{player.flag}</span>}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              {POSITION_LABELS[player.position] ?? player.position}
              {player.club ? ` — ${player.club}` : ""}
            </p>
            {player.bio && <p className="mt-4 max-w-2xl text-foreground">{player.bio}</p>}
            <Button href="/contact" className="mt-6">
              Contacter FMA.SPORT au sujet de ce joueur
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          <Card className="p-6">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Informations personnelles
            </h2>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Date de naissance" value={formatDate(player.birthDate)} />
              <Row label="Âge" value={`${age} ans`} />
              <Row label="Nationalité" value={player.nationality} />
              {player.height && <Row label="Taille" value={`${player.height} cm`} />}
              {player.weight && <Row label="Poids" value={`${player.weight} kg`} />}
            </dl>
          </Card>

          <Card className="p-6">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Informations football
            </h2>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Poste principal" value={POSITION_LABELS[player.position] ?? player.position} />
              {player.secondaryPosition && (
                <Row
                  label="Poste secondaire"
                  value={POSITION_LABELS[player.secondaryPosition] ?? player.secondaryPosition}
                />
              )}
              <Row label="Pied fort" value={STRONG_FOOT_LABELS[player.strongFoot] ?? player.strongFoot} />
              {player.club && <Row label="Club actuel" value={player.club} />}
              {player.previousClub && <Row label="Ancien club" value={player.previousClub} />}
              {player.number && <Row label="Numéro" value={`#${player.number}`} />}
            </dl>
          </Card>

          <Card className="p-6">
            <h2 className="font-heading text-lg font-semibold text-foreground">Statistiques</h2>
            {player.stats.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">Pas encore de statistiques.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {player.stats.map((stat) => (
                  <div key={stat.id} className="border-t border-border pt-3 first:border-0 first:pt-0">
                    <p className="text-sm font-semibold text-foreground">
                      {stat.competition} — {stat.season}
                    </p>
                    <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <Row label="Matchs" value={String(stat.matches)} />
                      <Row label="Buts" value={String(stat.goals)} />
                      <Row label="Passes D." value={String(stat.assists)} />
                      <Row label="Minutes" value={String(stat.minutesPlayed)} />
                    </dl>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {player.videos.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 font-heading text-2xl font-bold text-foreground">Vidéos</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {player.videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </div>
        )}

        {(player.cvUrl || player.documentUrls.length > 0) && (
          <div className="mt-12">
            <h2 className="mb-6 font-heading text-2xl font-bold text-foreground">Documents</h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {player.cvUrl && (
                <li>
                  <a
                    href={player.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <FileText className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    CV football
                  </a>
                </li>
              )}
              {player.documentUrls.map((url, i) => (
                <li key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <FileText className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    Document sportif {i + 1}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}
