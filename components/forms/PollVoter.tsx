"use client";

import { useActionState, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Check, CheckCircle2, Clock, Loader2, Plus, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PollResults } from "@/components/sections/PollResults";
import { submitPollVote, type PollVoteState } from "@/app/actions/poll-vote";
import { cn } from "@/lib/utils";
import { canSeeResults, type PollIdentification, type PollResultsVisibility } from "@/lib/poll-rules";
import type { PollResults as PollResultsData } from "@/lib/polls";

type Option = { id: string; name: string; club: string | null; photo: string | null };
type Question = {
  id: string;
  title: string;
  picks: number;
  ranked: boolean;
  allowWriteIn: boolean;
  options: Option[];
};

type PollData = {
  id: string;
  resultsVisibility: PollResultsVisibility;
  identification: PollIdentification;
  open: boolean;
  endsAt: string | null;
  questions: Question[];
};

export type PollSubmit = (prev: PollVoteState, formData: FormData) => Promise<PollVoteState>;
export type PollResultsLoader = () => Promise<PollResultsData | null>;

const initialState: PollVoteState = { success: false, message: "" };

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

function Avatar({ option, size = 44 }: { option: Option; size?: number }) {
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

export function PollVoter({
  poll,
  submit,
  loadResults,
}: {
  poll: PollData;
  /** Replaces the real vote action (used by the local mock preview). */
  submit?: PollSubmit;
  /** Replaces the results API call (used by the local mock preview). */
  loadResults?: PollResultsLoader;
}) {
  const storageKey = `poll_voted_${poll.id}`;
  const votedBefore = useVotedFlag(storageKey);
  const [state, formAction, isPending] = useActionState(submit ?? submitPollVote.bind(null, poll.id), initialState);
  // Ordered ids picked for each question (first pick first).
  const [choices, setChoices] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(poll.questions.map((q) => [q.id, []]))
  );
  const [results, setResults] = useState<PollResultsData | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [contact, setContact] = useState("");
  // Answers typed by the visitor (write-in), per question. Ids look like `new:<text>`.
  const [extras, setExtras] = useState<Record<string, Option[]>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  // Stamped once on mount (after hydration): when the visitor started filling the ballot.
  const startedAtRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (startedAtRef.current) startedAtRef.current.value = String(Date.now());
  }, []);

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

  const showResultsNow = canSeeResults(poll.resultsVisibility, { open: poll.open, voted: alreadyVoted });
  useEffect(() => {
    if (!showResultsNow) return;
    let cancelled = false;
    (loadResults
      ? loadResults()
      : fetch(`/api/polls/${poll.id}/results`, { cache: "no-store" }).then((response) =>
          response.ok ? (response.json() as Promise<PollResultsData>) : null
        )
    )
      .then((data: PollResultsData | null) => {
        if (!cancelled && data) setResults(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [showResultsNow, poll.id, state.success, loadResults]);

  function toggle(question: Question, optionId: string) {
    const picked = choices[question.id] ?? [];
    setHint(null);
    if (picked.includes(optionId)) {
      setChoices({ ...choices, [question.id]: picked.filter((id) => id !== optionId) });
    } else if (question.picks === 1) {
      setChoices({ ...choices, [question.id]: [optionId] });
    } else if (picked.length >= question.picks) {
      setHint(`« ${question.title} » : ${question.picks} choix maximum. Retirez-en un pour en changer.`);
    } else {
      setChoices({ ...choices, [question.id]: [...picked, optionId] });
    }
  }

  const writeInCount = Object.values(extras).reduce((sum, list) => sum + list.length, 0);

  function addWriteIn(question: Question) {
    const text = (drafts[question.id] ?? "").replace(/\s+/g, " ").trim().slice(0, 60);
    if (text.length < 2) {
      setHint("Saisissez au moins 2 caractères pour votre réponse.");
      return;
    }
    const known = [...question.options, ...(extras[question.id] ?? [])].find(
      (o) => o.name.toLowerCase() === text.toLowerCase()
    );
    if (known) {
      if (!(choices[question.id] ?? []).includes(known.id)) toggle(question, known.id);
    } else {
      if (writeInCount >= 3) {
        setHint("Vous pouvez proposer 3 réponses libres au maximum.");
        return;
      }
      const picked = choices[question.id] ?? [];
      if (question.picks > 1 && picked.length >= question.picks) {
        setHint(`« ${question.title} » : ${question.picks} choix maximum. Retirez-en un pour en ajouter un autre.`);
        return;
      }
      const option: Option = { id: `new:${text}`, name: text, club: null, photo: null };
      setExtras({ ...extras, [question.id]: [...(extras[question.id] ?? []), option] });
      setChoices({ ...choices, [question.id]: question.picks === 1 ? [option.id] : [...picked, option.id] });
      setHint(null);
    }
    setDrafts({ ...drafts, [question.id]: "" });
  }

  function move(questionId: string, index: number, direction: -1 | 1) {
    const list = [...(choices[questionId] ?? [])];
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    setChoices({ ...choices, [questionId]: list });
  }

  if (alreadyVoted || !poll.open) {
    return (
      <div className="space-y-6">
        <div role="status" className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-success" aria-hidden="true" />
          <div>
            <p className="font-heading text-base font-semibold text-foreground">
              {alreadyVoted ? "Merci pour votre participation !" : "Ce sondage est clos"}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {alreadyVoted
                ? state.success
                  ? state.message
                  : "Vous avez déjà voté pour ce sondage : un seul vote par personne."
                : "Les votes ne sont plus acceptés. Voici le classement final."}
            </p>
          </div>
        </div>
        {showResultsNow ? (
          results ? (
            <PollResults results={results} />
          ) : (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Chargement des résultats…
            </p>
          )
        ) : (
          poll.resultsVisibility !== "NEVER" && (
            <p className="text-sm text-muted-foreground">Les résultats seront publiés à la clôture du sondage.</p>
          )
        )}
      </div>
    );
  }

  const progress = poll.questions.map((q) => {
    const count = choices[q.id]?.length ?? 0;
    return { question: q, count, complete: count === q.picks, partial: count > 0 && count < q.picks };
  });
  const partial = progress.find((p) => p.partial);
  const completeCount = progress.filter((p) => p.complete).length;
  const needsContact = poll.identification !== "NONE";
  const contactOk = !needsContact || contact.trim().length > 0;
  const canSubmit = completeCount > 0 && !partial && contactOk;
  const blocker = partial
    ? `Complétez « ${partial.question.title} » (${partial.count}/${partial.question.picks}) ou retirez vos choix.`
    : completeCount === 0
      ? "Faites au moins un choix pour voter."
      : !contactOk
        ? poll.identification === "EMAIL"
          ? "Saisissez votre adresse e-mail pour voter."
          : "Saisissez votre numéro de téléphone pour voter."
        : null;

  return (
    <div className="space-y-10">
    <form action={formAction} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      {/* Honeypot: invisible to people, filled in by bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Ne pas remplir
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <input ref={startedAtRef} type="hidden" name="startedAt" defaultValue="" />
      {poll.questions.flatMap((q) =>
        Array.from({ length: q.picks }, (_, i) => (
          <input key={`${q.id}-${i}`} type="hidden" name={`q_${q.id}_${i + 1}`} value={choices[q.id]?.[i] ?? ""} />
        ))
      )}

      <div className="min-w-0 space-y-6">
        {progress.map(({ question, count, complete }, qi) => {
          const picked = choices[question.id] ?? [];
          const full = picked.length >= question.picks && question.picks > 1;
          return (
            <fieldset key={question.id} className="min-w-0 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <legend className="sr-only">{question.title}</legend>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                    Question {qi + 1} sur {poll.questions.length}
                  </p>
                  <h2 className="mt-0.5 font-heading text-xl font-semibold text-foreground">{question.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {question.picks === 1
                      ? "Choisissez une réponse."
                      : question.ranked
                        ? `Choisissez ${question.picks} réponses dans l'ordre : le premier clic est votre favori.`
                        : `Choisissez ${question.picks} réponses.`}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold tabular-nums",
                    complete
                      ? "bg-success/15 text-success"
                      : count > 0
                        ? "bg-accent/15 text-accent"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {complete ? <Check className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" /> : null}
                  {count}/{question.picks}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {[...question.options, ...(extras[question.id] ?? [])].map((option) => {
                  const rank = picked.indexOf(option.id) + 1;
                  const selected = rank > 0;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role={question.picks === 1 ? "radio" : "checkbox"}
                      aria-checked={selected}
                      onClick={() => toggle(question, option.id)}
                      className={cn(
                        "relative flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition-all",
                        selected
                          ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary"
                          : "border-border bg-card hover:border-primary/50 hover:bg-muted/60",
                        full && !selected && "opacity-50"
                      )}
                    >
                      <Avatar option={option} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-foreground">{option.name}</span>
                        {option.club && (
                          <span className="block truncate text-xs text-muted-foreground">{option.club}</span>
                        )}
                      </span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                          selected ? "border-primary bg-primary text-on-primary" : "border-border text-transparent"
                        )}
                      >
                        {selected ? question.ranked && question.picks > 1 ? rank : <Check className="h-4 w-4" /> : "·"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {question.allowWriteIn && (
                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    maxLength={60}
                    value={drafts[question.id] ?? ""}
                    onChange={(e) => setDrafts({ ...drafts, [question.id]: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addWriteIn(question);
                      }
                    }}
                    placeholder="Une autre réponse ? Saisissez-la ici"
                    aria-label={`${question.title} : proposer votre propre réponse`}
                    className="min-h-11 min-w-0 flex-1 rounded-xl border border-dashed border-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                  <button
                    type="button"
                    onClick={() => addWriteIn(question)}
                    className="flex min-h-11 cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Ajouter
                  </button>
                </div>
              )}

              {question.ranked && picked.length > 1 && (
                <div className="mt-5 rounded-xl bg-muted/60 p-4">
                  <p className="text-sm font-semibold text-foreground">Mon classement</p>
                  <ol className="mt-2 space-y-1.5">
                    {picked.map((id, index) => {
                      const option = [...question.options, ...(extras[question.id] ?? [])].find((o) => o.id === id);
                      if (!option) return null;
                      return (
                        <li key={id} className="flex items-center gap-2 rounded-lg bg-card px-3 py-2 text-sm">
                          <span className="w-5 text-center font-bold tabular-nums text-primary">{index + 1}</span>
                          <span className="min-w-0 flex-1 truncate font-medium text-foreground">{option.name}</span>
                          <button
                            type="button"
                            aria-label={`Monter ${option.name}`}
                            disabled={index === 0}
                            onClick={() => move(question.id, index, -1)}
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-muted disabled:opacity-30"
                          >
                            <ArrowUp className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Descendre ${option.name}`}
                            disabled={index === picked.length - 1}
                            onClick={() => move(question.id, index, 1)}
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-muted disabled:opacity-30"
                          >
                            <ArrowDown className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Retirer ${option.name}`}
                            onClick={() => toggle(question, id)}
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-destructive hover:bg-destructive-soft"
                          >
                            <X className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
            </fieldset>
          );
        })}
      </div>

      <aside className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm lg:sticky lg:top-24">
        <h2 className="font-heading text-lg font-semibold text-foreground">Mon bulletin</h2>
        <ul className="space-y-3">
          {progress.map(({ question, count, complete }) => (
            <li key={question.id}>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate font-medium text-foreground">{question.title}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {count}/{question.picks}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full transition-all", complete ? "bg-success" : "bg-primary/70")}
                  style={{ width: `${(count / question.picks) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>

        {needsContact && (
          <div>
            <label htmlFor="poll-contact" className="mb-1.5 block text-sm font-medium text-foreground">
              {poll.identification === "EMAIL" ? "Votre adresse e-mail *" : "Votre numéro de téléphone *"}
            </label>
            <input
              id="poll-contact"
              name="contact"
              type={poll.identification === "EMAIL" ? "email" : "tel"}
              inputMode={poll.identification === "EMAIL" ? "email" : "tel"}
              autoComplete={poll.identification === "EMAIL" ? "email" : "tel"}
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder={poll.identification === "EMAIL" ? "vous@exemple.com" : "+221 77 000 00 00"}
              className="min-h-11 w-full rounded-xl border border-border bg-card px-4 text-base text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Sert uniquement à éviter les votes multiples. Il n&apos;est pas conservé en clair.
            </p>
          </div>
        )}

        {(hint || blocker) && (
          <p className="text-sm text-muted-foreground" role="note">
            {hint ?? blocker}
          </p>
        )}
        {state.message && !state.success && (
          <p
            role="alert"
            className="rounded-lg bg-destructive-soft px-3 py-2.5 text-sm text-destructive-soft-foreground"
          >
            {state.message}
          </p>
        )}

        <Button type="submit" size="lg" disabled={isPending || !canSubmit} className="w-full">
          {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {isPending ? "Envoi du vote…" : "Valider mon vote"}
        </Button>

        <ul className="space-y-1.5 border-t border-border pt-4 text-xs text-muted-foreground">
          <li className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            Un seul vote par personne. Vous ne pourrez pas le modifier.
          </li>
          {poll.endsAt && (
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              Fin du vote le{" "}
              {new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" }).format(
                new Date(poll.endsAt)
              )}
              .
            </li>
          )}
        </ul>
      </aside>
    </form>
    {showResultsNow && (
      <section aria-labelledby="live-results">
        <h2 id="live-results" className="mb-4 font-heading text-xl font-semibold text-foreground">
          Résultats en direct
        </h2>
        {results ? (
          <PollResults results={results} />
        ) : (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Chargement des résultats…
          </p>
        )}
      </section>
    )}
    </div>
  );
}
