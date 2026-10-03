import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Ticket } from "lucide-react";
import type { Event } from "@prisma/client";
import { PageHeader } from "@/components/sections/PageHeader";
import { getPublishedEvents } from "@/lib/queries";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Événements",
  description:
    "Détections, tournois et masterclass organisés par FMA SPORT au Sénégal et en Afrique de l'Ouest.",
};

const dayFormat = new Intl.DateTimeFormat("fr-FR", { day: "2-digit" });
const monthFormat = new Intl.DateTimeFormat("fr-FR", { month: "short" });
const fullFormat = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

function EventCard({ event, past = false }: { event: Event; past?: boolean }) {
  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card transition-shadow duration-200 hover:shadow-md">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {event.poster && (
          <Image
            src={event.poster}
            alt={event.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className={`object-cover transition-transform duration-300 group-hover:scale-[1.03] ${past ? "grayscale-[40%]" : ""}`}
          />
        )}
        <div className="absolute left-3 top-3 flex flex-col items-center rounded-lg bg-card px-3 py-1.5 text-center shadow-sm">
          <span className="font-heading text-xl font-bold leading-none text-foreground">
            {dayFormat.format(event.date)}
          </span>
          <span className="text-[11px] font-semibold uppercase text-accent">
            {monthFormat.format(event.date).replace(".", "")}
          </span>
        </div>
        {event.status === "RESULTS_PUBLISHED" && (
          <span className="absolute right-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-on-accent">
            Résultats
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-heading text-lg font-semibold leading-snug text-foreground">{event.name}</h3>
        <p className="mt-1 text-sm capitalize text-muted-foreground">{fullFormat.format(event.date)}</p>
        <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {event.location}
          </li>
          {event.price && (
            <li className="flex items-start gap-2">
              <Ticket className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {event.price}
            </li>
          )}
        </ul>
        <Link
          href={`/evenements/${event.slug}`}
          className="mt-4 inline-block text-sm font-semibold text-accent hover:underline"
        >
          {past ? "Voir les résultats" : "Voir les informations"}
        </Link>
      </div>
    </article>
  );
}

export default async function EvenementsPage() {
  const events = await getPublishedEvents().catch(() => []);
  const now = new Date();
  const upcoming = events.filter((e) => e.date >= now);
  const past = events.filter((e) => e.date < now).reverse();

  return (
    <>
      <PageHeader
        title="Événements"
        description="Détections, tournois et masterclass : retrouvez tous les rendez-vous organisés par FMA SPORT au Sénégal et en Afrique de l'Ouest."
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section aria-labelledby="upcoming-heading">
          <h2
            id="upcoming-heading"
            className="border-l-4 border-accent pl-3 font-heading text-base font-bold uppercase tracking-wide text-foreground"
          >
            À venir
          </h2>
          {upcoming.length === 0 ? (
            <p className="mt-6 text-muted-foreground">
              Aucun événement programmé pour le moment. Suivez-nous sur les réseaux sociaux pour
              être informé des prochaines dates.
            </p>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>

        {past.length > 0 && (
          <section aria-labelledby="past-heading" className="mt-14 border-t border-border pt-10">
            <h2
              id="past-heading"
              className="border-l-4 border-accent pl-3 font-heading text-base font-bold uppercase tracking-wide text-foreground"
            >
              Événements passés &amp; résultats
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((event) => (
                <EventCard key={event.id} event={event} past />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
