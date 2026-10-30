import Image from "next/image";
import { Trophy } from "lucide-react";
import type { PollResults as PollResultsData } from "@/lib/polls";

/** Standings per question: bar length = points relative to the leader. */
export function PollResults({ results, compact = false }: { results: PollResultsData; compact?: boolean }) {
  if (results.totalBallots === 0) {
    return (
      <p className="rounded-xl bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
        Aucun vote pour le moment.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">
        {results.totalBallots} participant{results.totalBallots > 1 ? "s" : ""}
      </p>
      {results.questions.map((question) => {
        const leader = Math.max(1, ...question.options.map((o) => o.points));
        return (
          <section key={question.questionId} aria-labelledby={`result-${question.questionId}`}>
            <h3 id={`result-${question.questionId}`} className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
              <Trophy className="h-4.5 w-4.5 text-accent" aria-hidden="true" />
              {question.title}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {question.respondents} vote{question.respondents > 1 ? "s" : ""}
              {question.ranked ? ` · points : 1er = ${question.picks}, dernier = 1` : ""}
            </p>
            <ol className="mt-3 space-y-2">
              {question.options.slice(0, compact ? 10 : undefined).map((option, index) => (
                <li key={option.optionId} className="rounded-xl border border-border bg-card p-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 shrink-0 text-center font-heading text-sm font-bold text-muted-foreground">
                      {index + 1}
                    </span>
                    {option.photo && (
                      <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-muted">
                        <Image src={option.photo} alt="" fill sizes="36px" className="object-cover" unoptimized />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {option.name}
                        {option.club && <span className="font-normal text-muted-foreground"> · {option.club}</span>}
                      </p>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.max(2, (option.points / leader) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold tabular-nums text-foreground">{option.share} %</p>
                      <p className="text-xs tabular-nums text-muted-foreground">
                        {option.points} pt{option.points > 1 ? "s" : ""} · {option.firstPlaces} × 1er
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
