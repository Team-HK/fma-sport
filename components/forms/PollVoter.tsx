"use client";

import { useActionState, useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PollResults } from "@/components/sections/PollResults";
import { submitPollVote, type PollVoteState } from "@/app/actions/poll-vote";
import type { PollResults as PollResultsData } from "@/lib/polls";

type PollData = {
  id: string;
  showResults: boolean;
  open: boolean;
  endsAt: string | null;
  questions: {
    id: string;
    title: string;
    picks: number;
    ranked: boolean;
    options: { id: string; name: string; club: string | null; photo: string | null }[];
  }[];
};

const initialState: PollVoteState = { success: false, message: "" };

const selectClass =
  "w-full rounded-[10px] border border-border bg-card px-3 py-2.5 text-base text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30";

const ordinal = (rank: number) => (rank === 1 ? "1er" : `${rank}e`);

/** localStorage as an external store, so "already voted" is read without a state-in-effect. */
function useVotedFlag(key: string) {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener("storage", callback);
      return () => window.removeEventListener("storage", callback);
    },
    () => {
      try {
        return localStorage.getItem(key) === "1";
      } catch {
        return false;
      }
    },
    () => false
  );
}

export function PollVoter({ poll }: { poll: PollData }) {
  const storageKey = `poll_voted_${poll.id}`;
  const votedBefore = useVotedFlag(storageKey);
  const [state, formAction, isPending] = useActionState(submitPollVote.bind(null, poll.id), initialState);
  const [choices, setChoices] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(poll.questions.map((q) => [q.id, Array<string>(q.picks).fill("")]))
  );
  const [results, setResults] = useState<PollResultsData | null>(null);

  const alreadyVoted = votedBefore || state.success || /déjà voté/i.test(state.message);

  useEffect(() => {
    if (state.success || /déjà voté/i.test(state.message)) {
      try {
        localStorage.setItem(storageKey, "1");
      } catch {
        // Storage unavailable: the server-side cookie still blocks a second vote.
      }
    }
  }, [state, storageKey]);

  const showResultsNow = poll.showResults && (alreadyVoted || !poll.open);
  useEffect(() => {
    if (!showResultsNow) return;
    let cancelled = false;
    fetch(`/api/polls/${poll.id}/results`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: PollResultsData | null) => {
        if (!cancelled && data) setResults(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [showResultsNow, poll.id, state.success]);

  if (alreadyVoted || !poll.open) {
    return (
      <div className="space-y-8">
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">
            {alreadyVoted
              ? state.success
                ? state.message
                : "Vous avez déjà voté pour ce sondage. Merci pour votre participation !"
              : "Ce sondage est clos. Merci à tous les participants !"}
          </p>
        </div>
        {poll.showResults ? (
          results ? (
            <PollResults results={results} />
          ) : (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Chargement des résultats…
            </p>
          )
        ) : (
          <p className="text-sm text-muted-foreground">Les résultats seront annoncés prochainement.</p>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-8">
      <p className="text-sm text-muted-foreground">
        Choisissez vos joueurs dans l&apos;ordre de préférence. Vous pouvez laisser une question vide pour la passer.
        {poll.endsAt &&
          ` Fin du vote le ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" }).format(new Date(poll.endsAt))}.`}
      </p>

      {poll.questions.map((question) => {
        const picked = choices[question.id] ?? [];
        return (
          <fieldset key={question.id} className="rounded-xl border border-border bg-card p-5">
            <legend className="px-2 font-heading text-lg font-semibold text-foreground">{question.title}</legend>
            <p className="mb-4 text-sm text-muted-foreground">
              Votez pour {question.picks} joueur{question.picks > 1 ? "s" : ""}
              {question.ranked && question.picks > 1 ? ", du meilleur au moins bon" : ""}.
            </p>
            <div className="space-y-3">
              {picked.map((selected, index) => {
                const rank = index + 1;
                const chosenOption = question.options.find((o) => o.id === selected);
                return (
                  <div key={rank} className="flex items-center gap-3">
                    <span className="w-10 shrink-0 text-center font-heading text-sm font-bold text-muted-foreground">
                      {question.picks > 1 ? ordinal(rank) : "—"}
                    </span>
                    <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-muted">
                      {chosenOption?.photo && (
                        <Image src={chosenOption.photo} alt="" fill sizes="36px" className="object-cover" unoptimized />
                      )}
                    </span>
                    <select
                      name={`q_${question.id}_${rank}`}
                      aria-label={`${question.title} — choix ${rank}`}
                      value={selected}
                      onChange={(e) =>
                        setChoices((current) => ({
                          ...current,
                          [question.id]: (current[question.id] ?? []).map((v, i) => (i === index ? e.target.value : v)),
                        }))
                      }
                      className={selectClass}
                    >
                      <option value="">Choisir un joueur…</option>
                      {question.options.map((option) => (
                        <option
                          key={option.id}
                          value={option.id}
                          disabled={picked.some((other, i) => i !== index && other === option.id)}
                        >
                          {option.name}
                          {option.club ? ` — ${option.club}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      {state.message && !state.success && (
        <p role="alert" className="rounded-lg bg-destructive-soft px-4 py-3 text-sm text-destructive-soft-foreground">
          {state.message}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isPending} className="w-full sm:w-auto">
        {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {isPending ? "Envoi du vote…" : "Valider mon vote"}
      </Button>
    </form>
  );
}
