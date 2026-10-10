import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/sections/PageHeader";
import { Card } from "@/components/ui/Card";
import { EventRegistrationForm } from "@/components/forms/EventRegistrationForm";
import { getEventBySlug } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import { resolveVideoSource } from "@/lib/video-embed";

export const revalidate = 300;

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return {};
  return { title: event.name };
}

export default async function EventDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) notFound();

  return (
    <>
      <PageHeader title={event.name} description={`${formatDate(event.date)} — ${event.location}`} />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            {event.poster && (
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted">
                <Image
                  src={event.poster}
                  alt={event.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 480px"
                  className="object-cover"
                />
              </div>
            )}

            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between border-b border-border pb-2">
                <dt className="text-muted-foreground">Date</dt>
                <dd className="font-medium text-foreground">{formatDate(event.date)}</dd>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <dt className="text-muted-foreground">Lieu</dt>
                <dd className="font-medium text-foreground">{event.location}</dd>
              </div>
              {event.price && (
                <div className="flex justify-between border-b border-border pb-2">
                  <dt className="text-muted-foreground">Prix</dt>
                  <dd className="font-medium text-foreground">{event.price}</dd>
                </div>
              )}
              {event.contact && (
                <div className="flex justify-between border-b border-border pb-2">
                  <dt className="text-muted-foreground">Contact</dt>
                  <dd className="font-medium text-foreground">{event.contact}</dd>
                </div>
              )}
            </dl>

            {event.registrationConditions && (
              <p className="mt-4 text-sm text-muted-foreground">
                {event.registrationConditions}
              </p>
            )}

            {event.results && (
              <div className="mt-6 rounded-lg bg-muted p-4">
                <h2 className="font-semibold text-foreground">Résultats</h2>
                <p className="mt-1 text-sm text-muted-foreground">{event.results}</p>
              </div>
            )}
          </div>

          {event.date >= new Date() ? (
            <Card className="h-fit p-6">
              <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
                S&apos;inscrire à cet événement
              </h2>
              <EventRegistrationForm eventId={event.id} />
            </Card>
          ) : (
            <Card className="h-fit p-6">
              <h2 className="font-heading text-lg font-semibold text-foreground">Inscriptions closes</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Cet événement est terminé. Consultez nos{" "}
                <Link href="/evenements" className="font-medium text-accent hover:underline">
                  prochains rendez-vous
                </Link>
                .
              </p>
            </Card>
          )}
        </div>

        {event.photos.length > 0 && (
          <section className="mt-12" aria-labelledby="event-photos">
            <h2 id="event-photos" className="font-heading text-xl font-semibold text-foreground">
              Photos
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {event.photos.map((src, index) => (
                <li key={src} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                  <Image
                    src={src}
                    alt={`${event.name} — photo ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 320px"
                    className="object-cover"
                    // Photos pasted from other sites aren't in next/image's allow-list.
                    unoptimized={!/^\/|\.public\.blob\.vercel-storage\.com\/|images\.unsplash\.com/.test(src)}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        {event.videos.length > 0 && (
          <section className="mt-12" aria-labelledby="event-videos">
            <h2 id="event-videos" className="font-heading text-xl font-semibold text-foreground">
              Vidéos
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {event.videos.map((url) => {
                const source = resolveVideoSource(url);
                if (source.type === "embed") {
                  return (
                    <iframe
                      key={url}
                      src={source.src}
                      title={`${event.name} — vidéo`}
                      loading="lazy"
                      allowFullScreen
                      className="aspect-video w-full rounded-xl bg-muted"
                    />
                  );
                }
                if (source.type === "file") {
                  return (
                    // eslint-disable-next-line jsx-a11y/media-has-caption
                    <video
                      key={url}
                      src={source.src}
                      controls
                      preload="metadata"
                      className="aspect-video w-full rounded-xl bg-foreground"
                    />
                  );
                }
                return (
                  <a
                    key={url}
                    href={source.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex aspect-video items-center justify-center rounded-xl bg-muted px-4 text-center text-sm font-medium text-primary hover:underline"
                  >
                    Voir la vidéo
                  </a>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
