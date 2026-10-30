import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/sections/PageHeader";
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
    poll.description ?? `Votez pour vos joueurs préférés : ${poll.questions.map((q) => q.title).join(", ")}.`;
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

export default async function PollPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const poll = await getPublicPollBySlug(slug);
  if (!poll) notFound();

  return (
    <>
      <PageHeader title={poll.title} description={poll.description ?? undefined} />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <PollVoter
          poll={{
            id: poll.id,
            showResults: poll.showResults,
            // Evaluated here so the cached page doesn't need the clock on the client.
            open: isPollOpen(poll),
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
