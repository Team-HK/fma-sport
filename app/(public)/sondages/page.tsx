import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarClock, ListChecks, Vote } from "lucide-react";
import { getPublicPolls, isPollOpen } from "@/lib/polls";
import { cn } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Sondages",
  description: "Participez aux sondages de FMA SPORT et donnez votre avis.",
  alternates: { canonical: "/sondages" },
};

const formatDate = (date: Date) => new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);

export default async function PollsPage() {
  const polls = await getPublicPolls().catch(() => []);
  const open = polls.filter((poll) => isPollOpen(poll));
  const closed = polls.filter((poll) => !isPollOpen(poll));

  return (
    <>
      <section className="bg-primary text-on-primary">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">Sondages</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            Donnez votre avis, votez et découvrez les résultats de la communauté FMA SPORT.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        {polls.length === 0 && (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-16 text-center">
            <Vote className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
            <p className="mt-4 font-heading text-lg font-semibold text-foreground">Aucun sondage pour le moment</p>
            <p className="mt-1 text-sm text-muted-foreground">Revenez bientôt : le prochain arrive vite.</p>
          </div>
        )}

        {[
          { title: "Votes en cours", items: open },
          { title: "Sondages terminés", items: closed },
        ].map(
          (group) =>
            group.items.length > 0 && (
              <section key={group.title}>
                <h2 className="mb-5 font-heading text-xl font-semibold text-foreground">{group.title}</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((poll) => {
                    const isOpen = isPollOpen(poll);
                    return (
                      <Link
                        key={poll.id}
                        href={`/sondages/${poll.slug}`}
                        className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
                      >
                        <div className="relative aspect-[16/8] bg-primary">
                          {poll.coverImage ? (
                            <Image
                              src={poll.coverImage}
                              alt=""
                              fill
                              sizes="(max-width: 640px) 100vw, 400px"
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-white/30">
                              <Vote className="h-14 w-14" aria-hidden="true" />
                            </div>
                          )}
                          <span
                            className={cn(
                              "absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold",
                              isOpen ? "bg-emerald-500 text-white" : "bg-black/60 text-white"
                            )}
                          >
                            {isOpen ? "Vote ouvert" : "Clos"}
                          </span>
                        </div>
                        <div className="flex flex-1 flex-col p-5">
                          <h3 className="font-heading text-lg font-semibold text-foreground group-hover:text-primary">
                            {poll.title}
                          </h3>
                          {poll.description && (
                            <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{poll.description}</p>
                          )}
                          <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                            <li className="flex items-center gap-1.5">
                              <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
                              {poll.questions.length} question{poll.questions.length > 1 ? "s" : ""}
                            </li>
                            {poll.endsAt && (
                              <li className="flex items-center gap-1.5">
                                <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                                {isOpen ? "Jusqu'au" : "Terminé le"} {formatDate(poll.endsAt)}
                              </li>
                            )}
                          </ul>
                          <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-primary">
                            {isOpen ? "Voter" : "Voir les résultats"}
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )
        )}
      </div>
    </>
  );
}
