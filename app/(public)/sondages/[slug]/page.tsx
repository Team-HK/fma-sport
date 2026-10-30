import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, ChevronLeft, ListChecks } from "lucide-react";
import { PollVoter } from "@/components/forms/PollVoter";
import { getPublicPollBySlug, isPollOpen } from "@/lib/polls";

export const revalidate = 300;

// Render each poll on its first visit, then serve it from the cache (ISR).
export async function generateStaticParams() {
  return [];
}

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const poll = await getPublicPollBySlug(slug);
  if (!poll) return {};
  const description =
    poll.description ?? `Participez au sondage « ${poll.title} » et donnez votre avis sur FMA SPORT.`;
  return {
    title: poll.title,
    description,
    alternates: { canonical: `/sondages/${poll.slug}` },
    openGraph: {
      title: poll.title,
      description,
      url: `/sondages/${poll.slug}`,
      images: poll.coverImage ? [{ url: poll.coverImage, alt: poll.title }] : undefined,
    },
  };
}

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" }).format(date);

export default async function PollPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const poll = await getPublicPollBySlug(slug);
  if (!poll) notFound();

  const open = isPollOpen(poll);

  return (
    <>
      <section className="relative overflow-hidden bg-primary text-on-primary">
        {poll.coverImage && (
          <Image
            src={poll.coverImage}
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover opacity-25"
            unoptimized
          />
        )}
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <Link
            href="/sondages"
            className="inline-flex items-center gap-1 text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Tous les sondages
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span
              className={
                open
                  ? "rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-200"
                  : "rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/80"
              }
            >
              {open ? "Vote ouvert" : "Sondage clos"}
            </span>
          </div>
          <h1 className="mt-3 max-w-3xl font-heading text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            {poll.title}
          </h1>
          {poll.description && <p className="mt-4 max-w-2xl text-lg text-white/80">{poll.description}</p>}
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/75">
            <li className="flex items-center gap-2">
              <ListChecks className="h-4 w-4" aria-hidden="true" />
              {poll.questions.length} question{poll.questions.length > 1 ? "s" : ""}
            </li>
            {poll.endsAt && (
              <li className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4" aria-hidden="true" />
                {open ? "Fin du vote" : "Terminé"} le {formatDate(poll.endsAt)}
              </li>
            )}
          </ul>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <PollVoter
          poll={{
            id: poll.id,
            showResults: poll.showResults,
            // Evaluated here so the cached page doesn't need the clock on the client.
            open,
            endsAt: poll.endsAt ? poll.endsAt.toISOString() : null,
            questions: poll.questions.map((q) => ({
              id: q.id,
              title: q.title,
              picks: q.picks,
              ranked: q.ranked,
              options: q.options.map((o) => ({ id: o.id, name: o.name, club: o.club, photo: o.photo })),
            })),
          }}
        />
      </div>
    </>
  );
}
