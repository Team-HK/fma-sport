import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/sections/PageHeader";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getPublicPolls, isPollOpen } from "@/lib/polls";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Sondages",
  description: "Votez pour vos joueurs préférés : Ballon d'Or européen, africain et plus encore sur FMA SPORT.",
  alternates: { canonical: "/sondages" },
};

export default async function PollsPage() {
  const polls = await getPublicPolls().catch(() => []);

  return (
    <>
      <PageHeader
        title="Sondages"
        description="Donnez votre avis et votez pour vos joueurs préférés."
      />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {polls.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">Aucun sondage pour le moment. Revenez bientôt !</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {polls.map((poll) => {
              const open = isPollOpen(poll);
              return (
                <Link key={poll.id} href={`/sondages/${poll.slug}`} className="group block">
                  <Card className="h-full overflow-hidden">
                    {poll.coverImage && (
                      <div className="relative aspect-[16/9] bg-muted">
                        <Image
                          src={poll.coverImage}
                          alt={poll.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 480px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <StatusBadge tone={open ? "success" : "neutral"}>{open ? "Vote ouvert" : "Clos"}</StatusBadge>
                      <h2 className="mt-2 font-heading text-lg font-semibold text-foreground group-hover:text-primary">
                        {poll.title}
                      </h2>
                      {poll.description && (
                        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{poll.description}</p>
                      )}
                      <p className="mt-3 text-sm font-semibold text-primary">
                        {open ? "Voter →" : "Voir les résultats →"}
                      </p>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
