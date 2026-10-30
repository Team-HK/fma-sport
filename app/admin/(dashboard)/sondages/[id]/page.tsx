import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getPollResults } from "@/lib/polls";
import { PollResults } from "@/components/sections/PollResults";
import { PollForm } from "../PollForm";
import { ResetVotesButton } from "../RowActions";

export const dynamic = "force-dynamic";

export default async function EditPollPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const poll = await prisma.poll.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: "asc" }, include: { options: { orderBy: { order: "asc" } } } },
    },
  });
  if (!poll || poll.deletedAt) notFound();

  const results = await getPollResults(poll.id);

  return (
    <div>
      <Link
        href="/admin/sondages"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Retour aux sondages
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">{poll.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {results.totalBallots} participant{results.totalBallots > 1 ? "s" : ""}
          </p>
        </div>
        {poll.status !== "DRAFT" && (
          <Link
            href={`/sondages/${poll.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-border px-3.5 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            Voir le sondage
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        )}
      </div>

      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-semibold text-foreground">Résultats en direct</h2>
          <ResetVotesButton id={poll.id} votes={results.totalBallots} />
        </div>
        <div className="mt-4">
          <PollResults results={results} />
        </div>
      </section>

      <section className="mt-10 border-t border-border pt-8">
        <h2 className="mb-5 font-heading text-lg font-semibold text-foreground">Modifier le sondage</h2>
        <PollForm
          poll={{
            id: poll.id,
            title: poll.title,
            description: poll.description,
            coverImage: poll.coverImage,
            status: poll.status,
            startsAt: poll.startsAt,
            endsAt: poll.endsAt,
            showResults: poll.showResults,
            hasVotes: results.totalBallots > 0,
            questions: poll.questions.map((q) => ({
              id: q.id,
              title: q.title,
              picks: q.picks,
              ranked: q.ranked,
              options: q.options.map((o) => ({ id: o.id, name: o.name, club: o.club, photo: o.photo })),
            })),
          }}
        />
      </section>
    </div>
  );
}
