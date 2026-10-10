import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, Mail, FolderOpen, Handshake, Check } from "lucide-react";
import { getPlayerBySlug, getSimilarPlayers } from "@/lib/queries";
import {
  POSITION_LABELS,
  POSITION_ROLE_DESCRIPTIONS,
  STRONG_FOOT_LABELS,
  SITE_URL,
} from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { VideoCard } from "@/components/sections/VideoCard";
import { PlayerCard } from "@/components/sections/PlayerCard";
import { PitchPosition } from "@/components/sections/PitchPosition";
import { PlayerPhotoPlaceholder } from "@/components/sections/PlayerPhotoPlaceholder";
import { Flag } from "@/components/ui/Flag";
import { ShareButtons } from "@/components/sections/ShareButtons";
import { formatDate } from "@/lib/utils";
import { absoluteUrl } from "@/lib/seo";

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
  const fullName = `${player.firstName} ${player.lastName}`;
  const positionLabel = POSITION_LABELS[player.position] ?? player.position;
  const title = `${fullName} — ${positionLabel}${player.club ? ` ${player.club}` : ""}, profil et stats`;
  const description =
    player.bio ??
    `${player.firstName} ${player.lastName}, joueur ${player.nationality}${player.club ? ` à ${player.club}` : ""}. Profil, statistiques et actualités sur FMA SPORT.`;
  return {
    title,
    description,
    keywords: [
      fullName,
      `${player.lastName} ${player.firstName}`,
      `${fullName} football`,
      positionLabel,
      player.nationality,
      ...(player.club ? [player.club] : []),
      "FMA SPORT",
    ],
    alternates: { canonical: `/joueurs/${player.slug}` },
    openGraph: {
      title,
      url: `/joueurs/${player.slug}`,
      description,
      type: "profile",
      images: player.photo ? [{ url: player.photo, alt: `${fullName}, ${positionLabel}${player.club ? ` à ${player.club}` : ""}` }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: player.photo ? [player.photo] : undefined,
    },
  };
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-l-4 border-accent pl-3 font-heading text-base font-bold uppercase tracking-wide text-foreground">
      {children}
    </h2>
  );
}

export default async function PlayerProfilePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const player = await getPlayerBySlug(slug);

  if (!player || player.status !== "PUBLISHED") {
    notFound();
  }

  const fullName = `${player.firstName} ${player.lastName}`;
  const positionLabel = POSITION_LABELS[player.position] ?? player.position;
  const age = Math.floor(
    (Date.now() - new Date(player.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );

  const stats = [...player.stats].sort((a, b) => b.season.localeCompare(a.season));
  const totals = stats.reduce(
    (acc, s) => ({
      matches: acc.matches + s.matches,
      goals: acc.goals + s.goals,
      assists: acc.assists + s.assists,
      minutes: acc.minutes + s.minutesPlayed,
    }),
    { matches: 0, goals: 0, assists: 0, minutes: 0 }
  );
  const contributions = totals.goals + totals.assists;
  const minutesPerMatch = totals.matches ? Math.round(totals.minutes / totals.matches) : 0;
  const contributionsPer90 = totals.minutes ? (contributions / totals.minutes) * 90 : 0;
  const minutesPerContribution = contributions ? Math.round(totals.minutes / contributions) : null;

  const career =
    player.careerHistory.length > 0
      ? player.careerHistory
      : [player.previousClub && `Ancien club · ${player.previousClub}`, player.club && `Club actuel · ${player.club}`].filter(
          (step): step is string => Boolean(step)
        );

  const similar = await getSimilarPlayers(player).catch(() => []);

  const keyFacts = [
    { label: "Âge", value: `${age} ans` },
    player.height ? { label: "Taille", value: `${(player.height / 100).toFixed(2).replace(".", ",")} m` } : null,
    player.weight ? { label: "Poids", value: `${player.weight} kg` } : null,
    { label: "Pied fort", value: STRONG_FOOT_LABELS[player.strongFoot] ?? player.strongFoot },
    player.number ? { label: "Numéro", value: `#${player.number}` } : null,
  ].filter((f): f is { label: string; value: string } => f !== null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/joueurs/${player.slug}#person`,
    name: fullName,
    givenName: player.firstName,
    familyName: player.lastName,
    alternateName: `${player.lastName} ${player.firstName}`,
    knowsAbout: "Football",
    url: `${SITE_URL}/joueurs/${player.slug}`,
    image: player.photo
      ? {
          "@type": "ImageObject",
          url: absoluteUrl(player.photo),
          contentUrl: absoluteUrl(player.photo),
          caption: `${fullName}, ${positionLabel}${player.club ? ` à ${player.club}` : ""}`,
          name: fullName,
        }
      : undefined,
    description: player.bio ?? undefined,
    nationality: player.nationality,
    jobTitle: positionLabel,
    affiliation: player.club ? { "@type": "SportsTeam", name: player.club } : undefined,
    birthDate: player.birthDate.toISOString().slice(0, 10),
    height: player.height ? `${player.height} cm` : undefined,
    weight: player.weight ? `${player.weight} kg` : undefined,
  };

  const profileJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${SITE_URL}/joueurs/${player.slug}`,
    name: `${fullName} — profil joueur FMA SPORT`,
    dateModified: player.updatedAt.toISOString(),
    primaryImageOfPage: player.photo ? { "@type": "ImageObject", url: absoluteUrl(player.photo) } : undefined,
    mainEntity: { "@id": `${SITE_URL}/joueurs/${player.slug}#person` },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Nos talents", item: `${SITE_URL}/talents` },
      { "@type": "ListItem", position: 3, name: fullName, item: `${SITE_URL}/joueurs/${player.slug}` },
    ],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, profileJsonLd, breadcrumbJsonLd]) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-on-primary">
        {player.number && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 -top-10 select-none font-heading text-[16rem] font-bold leading-none text-white/[0.04] sm:text-[22rem]"
          >
            {player.number}
          </span>
        )}
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <nav aria-label="Fil d'Ariane" className="text-xs text-white/60">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <span className="mx-1.5">/</span>
            <Link href="/talents" className="hover:text-white">Nos talents</Link>
            <span className="mx-1.5">/</span>
            <span className="text-white/80">{fullName}</span>
          </nav>

          <div className="mt-6 flex flex-col gap-8 md:flex-row md:items-end">
            <div className="relative aspect-[4/5] w-full max-w-[280px] shrink-0 overflow-hidden rounded-xl bg-white/5">
              {player.photo ? (
                <Image
                  src={player.photo}
                  alt={`${fullName}, ${positionLabel}${player.club ? ` à ${player.club}` : ""} — photo FMA SPORT`}
                  title={fullName}
                  fill
                  sizes="280px"
                  priority
                  className="object-cover"
                />
              ) : (
                <PlayerPhotoPlaceholder player={player} className="bg-white/5" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-accent">
                {positionLabel}
                {player.club && <span className="text-white/70"> · {player.club}</span>}
              </p>
              <h1 className="mt-2 font-heading text-4xl font-bold leading-tight sm:text-5xl">
                {fullName}
                <Flag emoji={player.flag} className="ml-3 h-[0.6em]" />
              </h1>
              <p className="mt-1 text-white/70">{player.nationality} · Né le {formatDate(player.birthDate)}</p>

              <ul className="mt-6 flex flex-wrap gap-px overflow-hidden rounded-lg bg-white/10">
                {keyFacts.map((fact) => (
                  <li key={fact.label} className="min-w-[110px] flex-1 bg-primary px-4 py-3">
                    <span className="block text-[11px] uppercase tracking-wide text-white/60">{fact.label}</span>
                    <span className="mt-0.5 block font-heading text-lg font-semibold">{fact.value}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Button href="/contact" variant="accent" className="whitespace-normal text-left">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  Contacter FMA SPORT au sujet de ce joueur
                </Button>
                {player.cvUrl && (
                  <a
                    href={player.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-accent"
                  >
                    <FileText className="h-4 w-4" aria-hidden="true" />
                    Télécharger le CV football
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key numbers */}
      {stats.length > 0 && (
        <section className="border-b border-border bg-card">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-border sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: "Matchs", value: totals.matches },
              { label: "Buts", value: totals.goals },
              { label: "Passes décisives", value: totals.assists },
              { label: "Minutes jouées", value: totals.minutes.toLocaleString("fr-FR") },
              { label: "Min. par match", value: minutesPerMatch },
              { label: "Buts + passes / 90 min", value: contributionsPer90.toFixed(2).replace(".", ",") },
            ].map((item) => (
              <div key={item.label} className="bg-card px-4 py-5 text-center">
                <p className="font-heading text-2xl font-bold text-foreground sm:text-3xl">{item.value}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Main column */}
          <div className="min-w-0 space-y-12 lg:col-span-2">
            <section>
              <SectionTitle>Profil du joueur</SectionTitle>
              <div className="mt-4 space-y-4 leading-relaxed text-foreground">
                {player.bio ? (
                  player.bio.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)
                ) : (
                  <p>
                    {fullName} est un joueur {player.nationality.toLowerCase()} de {age} ans évoluant au
                    poste de {positionLabel.toLowerCase()}
                    {player.club ? `, actuellement à ${player.club}` : ""}.
                  </p>
                )}
              </div>

              {player.strengths.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Points forts
                  </h3>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {player.strengths.map((s) => (
                      <li key={s} className="flex items-start gap-2 text-sm text-foreground">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <section>
              <SectionTitle>Poste et rôle</SectionTitle>
              <div className="mt-4 grid gap-6 sm:grid-cols-2 sm:items-center">
                <PitchPosition position={player.position} secondaryPosition={player.secondaryPosition} />
                <div>
                  <p className="font-heading text-lg font-semibold text-foreground">{positionLabel}</p>
                  {POSITION_ROLE_DESCRIPTIONS[player.position] && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {POSITION_ROLE_DESCRIPTIONS[player.position]}
                    </p>
                  )}
                  {player.secondaryPosition && (
                    <p className="mt-3 text-sm text-foreground">
                      Peut également évoluer comme{" "}
                      <strong>{(POSITION_LABELS[player.secondaryPosition] ?? player.secondaryPosition).toLowerCase()}</strong>.
                    </p>
                  )}
                  <p className="mt-3 text-sm text-foreground">
                    Pied fort : <strong>{(STRONG_FOOT_LABELS[player.strongFoot] ?? player.strongFoot).toLowerCase()}</strong>
                  </p>
                </div>
              </div>
            </section>

            {stats.length > 0 && (
              <section>
                <SectionTitle>Statistiques par saison</SectionTitle>
                <div className="mt-4 overflow-x-auto rounded-lg border border-border">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th scope="col" className="px-4 py-3 font-semibold">Saison</th>
                        <th scope="col" className="px-4 py-3 font-semibold">Compétition</th>
                        <th scope="col" className="px-4 py-3 text-right font-semibold">MJ</th>
                        <th scope="col" className="px-4 py-3 text-right font-semibold">Buts</th>
                        <th scope="col" className="px-4 py-3 text-right font-semibold">PD</th>
                        <th scope="col" className="px-4 py-3 text-right font-semibold">Min.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {stats.map((s) => (
                        <tr key={s.id}>
                          <td className="px-4 py-3 font-medium text-foreground">{s.season}</td>
                          <td className="px-4 py-3 text-foreground">{s.competition}</td>
                          <td className="px-4 py-3 text-right tabular-nums">{s.matches}</td>
                          <td className="px-4 py-3 text-right tabular-nums">{s.goals}</td>
                          <td className="px-4 py-3 text-right tabular-nums">{s.assists}</td>
                          <td className="px-4 py-3 text-right tabular-nums">{s.minutesPlayed.toLocaleString("fr-FR")}</td>
                        </tr>
                      ))}
                    </tbody>
                    {stats.length > 1 && (
                      <tfoot className="bg-muted font-semibold">
                        <tr>
                          <td className="px-4 py-3" colSpan={2}>Total</td>
                          <td className="px-4 py-3 text-right tabular-nums">{totals.matches}</td>
                          <td className="px-4 py-3 text-right tabular-nums">{totals.goals}</td>
                          <td className="px-4 py-3 text-right tabular-nums">{totals.assists}</td>
                          <td className="px-4 py-3 text-right tabular-nums">{totals.minutes.toLocaleString("fr-FR")}</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  MJ : matchs joués · PD : passes décisives
                  {minutesPerContribution !== null &&
                    ` · Un but ou une passe décisive toutes les ${minutesPerContribution} minutes en moyenne.`}
                </p>
              </section>
            )}

            {career.length > 0 && (
              <section>
                <SectionTitle>Parcours</SectionTitle>
                <ol className="relative mt-5 space-y-5 border-l-2 border-border pl-6">
                  {career.map((step, i) => (
                    <li key={step} className="relative">
                      <span
                        aria-hidden="true"
                        className={`absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-card ${
                          i === career.length - 1 ? "bg-accent" : "bg-muted-foreground"
                        }`}
                      />
                      <p className="text-sm font-medium text-foreground">{step}</p>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {player.videos.length > 0 && (
              <section>
                <SectionTitle>Vidéos</SectionTitle>
                <div className="mt-4 grid gap-6 sm:grid-cols-2">
                  {player.videos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              </section>
            )}

            {player.documentUrls.length > 0 && (
              <section>
                <SectionTitle>Documents</SectionTitle>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {player.documentUrls.map((url, i) => (
                    <li key={url}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 text-sm font-medium text-foreground transition-colors hover:border-accent"
                      >
                        <FileText className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                        Document sportif {i + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="border-t border-border pt-6">
              <ShareButtons title={`${fullName} — ${positionLabel} | FMA SPORT`} />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-heading text-base font-bold uppercase tracking-wide text-foreground">
                Fiche technique
              </h2>
              <dl className="mt-4 divide-y divide-border text-sm">
                <Row label="Nom" value={fullName} />
                <Row label="Date de naissance" value={formatDate(player.birthDate)} />
                <Row label="Nationalité" value={player.nationality} />
                <Row label="Poste" value={positionLabel} />
                {player.secondaryPosition && (
                  <Row
                    label="Poste secondaire"
                    value={POSITION_LABELS[player.secondaryPosition] ?? player.secondaryPosition}
                  />
                )}
                <Row label="Pied fort" value={STRONG_FOOT_LABELS[player.strongFoot] ?? player.strongFoot} />
                {player.height && <Row label="Taille" value={`${player.height} cm`} />}
                {player.weight && <Row label="Poids" value={`${player.weight} kg`} />}
                {player.club && <Row label="Club actuel" value={player.club} />}
                {player.previousClub && <Row label="Ancien club" value={player.previousClub} />}
                {player.number && <Row label="Numéro" value={`#${player.number}`} />}
              </dl>
              <p className="mt-4 text-xs text-muted-foreground">
                Profil mis à jour le {formatDate(player.updatedAt)}
              </p>
            </section>

            <section className="rounded-xl bg-primary p-6 text-on-primary">
              <h2 className="font-heading text-base font-bold uppercase tracking-wide">
                Recruteurs et clubs
              </h2>
              <p className="mt-2 text-sm text-white/75">
                Vous êtes intéressé par ce profil ? FMA SPORT Management vous accompagne.
              </p>
              <ol className="mt-5 space-y-4 text-sm">
                {[
                  { icon: Mail, title: "Prise de contact", text: "Écrivez-nous en précisant le joueur et votre structure." },
                  { icon: FolderOpen, title: "Dossier complet", text: "Vidéos de match, statistiques détaillées et CV football." },
                  { icon: Handshake, title: "Mise en relation", text: "Échange avec le joueur et son entourage, conformément aux règles applicables." },
                ].map((step) => (
                  <li key={step.title} className="flex gap-3">
                    <step.icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                    <span>
                      <span className="block font-semibold">{step.title}</span>
                      <span className="text-white/70">{step.text}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <Link
                href="/contact"
                className="mt-6 inline-block text-sm font-semibold text-accent hover:text-white"
              >
                Nous contacter →
              </Link>
            </section>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-16 border-t border-border pt-10">
            <div className="flex items-center justify-between">
              <SectionTitle>Autres talents à découvrir</SectionTitle>
              <Link href="/talents" className="text-sm font-semibold text-accent hover:underline">
                Tous les talents →
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-6 lg:grid-cols-4">
              {similar.map((p) => (
                <PlayerCard key={p.id} player={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}
