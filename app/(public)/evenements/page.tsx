import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/sections/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getPublishedEvents } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Événements",
  description: "Les événements organisés ou soutenus par FMA SPORT.",
};

export default async function EvenementsPage() {
  const events = await getPublishedEvents().catch(() => []);

  return (
    <>
      <PageHeader
        title="Événements"
        description="Les événements organisés ou soutenus par FMA SPORT."
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {events.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Aucun événement programmé pour le moment.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden p-0">
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                  {event.poster && (
                    <Image
                      src={event.poster}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-heading text-lg font-semibold text-foreground">
                    {event.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{formatDate(event.date)}</p>
                  <p className="text-sm text-muted-foreground">{event.location}</p>
                  <Button href={`/evenements/${event.slug}`} variant="secondary" size="sm" className="mt-4">
                    Voir les informations
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
