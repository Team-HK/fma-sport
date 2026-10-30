import Image from "next/image";
import { Crown, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OptionResult, PollResults as PollResultsData } from "@/lib/polls";

function Avatar({ option, size }: { option: Pick<OptionResult, "name" | "photo">; size: number }) {
  const initials = option.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
  return (
    <span
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted font-heading text-sm font-semibold text-muted-foreground"
      style={{ width: size, height: size }}
    >
      {option.photo ? (
        <Image src={option.photo} alt="" fill sizes={`${size}px`} className="object-cover" unoptimized />
      ) : (
        initials
      )}
    </span>
  );
}

/** Standings per question; questions sit side by side on wide screens. */
export function PollResults({ results }: { results: PollResultsData }) {
  if (results.totalBallots === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-muted/50 px-4 py-10 text-center text-sm text-muted-foreground">
        Aucun vote pour le moment. Les résultats apparaîtront dès les premières participations.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        <strong className="font-semibold text-foreground">{results.totalBallots}</strong> participant
        {results.totalBallots > 1 ? "s" : ""}
      </p>
      <div className={cn("grid gap-5", results.questions.length > 1 && "lg:grid-cols-2")}>
        {results.questions.map((question) => {
          // Single-choice and unranked questions are plain vote counts; only rankings use points.
          const usesPoints = question.ranked && question.picks > 1;
          const score = (o: OptionResult) => (usesPoints ? o.points : o.voters);
          const unit = (n: number) => (usesPoints ? `${n} pt${n > 1 ? "s" : ""}` : `${n} vote${n > 1 ? "s" : ""}`);
          const leader = Math.max(1, ...question.options.map(score));
          const [first, ...others] = question.options;
          return (
            <section
              key={question.questionId}
              aria-labelledby={`result-${question.questionId}`}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <h3
                id={`result-${question.questionId}`}
                className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground"
              >
                <Trophy className="h-5 w-5 text-accent" aria-hidden="true" />
                {question.title}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {question.respondents} participation{question.respondents > 1 ? "s" : ""}
                {question.ranked && question.picks > 1
                  ? ` · classement : 1er = ${question.picks} points, dernier = 1 point`
                  : ""}
              </p>

              {first && (
                <div className="mt-4 flex items-center gap-4 rounded-xl bg-primary p-4 text-on-primary">
                  <div className="relative">
                    <Avatar option={first} size={56} />
                    <Crown
                      className="absolute -right-1 -top-2 h-5 w-5 rotate-12 text-amber-300"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-white/70">En tête</p>
                    <p className="truncate font-heading text-lg font-semibold">{first.name}</p>
                    {first.club && <p className="truncate text-sm text-white/75">{first.club}</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-heading text-2xl font-bold tabular-nums">{first.share} %</p>
                    <p className="text-xs tabular-nums text-white/70">{unit(score(first))}</p>
                  </div>
                </div>
              )}

              <ol className="mt-3 space-y-1.5">
                {others.map((option, index) => (
                  <li key={option.optionId} className="flex items-center gap-3 rounded-lg px-1 py-1.5">
                    <span className="w-5 shrink-0 text-center text-sm font-semibold tabular-nums text-muted-foreground">
                      {index + 2}
                    </span>
                    <Avatar option={option} size={32} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-sm font-medium text-foreground">{option.name}</p>
                        <p className="shrink-0 text-sm tabular-nums text-muted-foreground">
                          <span className="font-semibold text-foreground">{option.share} %</span> · {unit(score(option))}
                        </p>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary/70"
                          style={{ width: `${Math.max(2, (score(option) / leader) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}
