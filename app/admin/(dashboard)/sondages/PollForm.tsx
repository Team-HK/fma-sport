"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowDown, ArrowUp, ListPlus, Plus, Trash2 } from "lucide-react";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageField } from "@/components/ui/ImageField";
import { savePoll, type PollActionState } from "@/app/actions/admin/polls";
import {
  IDENTIFICATION_LABELS,
  RESULTS_VISIBILITY_LABELS,
  type PollIdentification,
  type PollResultsVisibility,
} from "@/lib/poll-rules";

type OptionDraft = { key: string; id?: string; name: string; club: string; photo: string; custom?: boolean };
type QuestionDraft = {
  key: string;
  id?: string;
  title: string;
  picks: number;
  ranked: boolean;
  allowWriteIn: boolean;
  options: OptionDraft[];
  bulk: string;
  showBulk: boolean;
};

export type PollFormData = {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  status: "DRAFT" | "OPEN" | "CLOSED";
  startsAt: Date | null;
  endsAt: Date | null;
  resultsVisibility: PollResultsVisibility;
  identification: PollIdentification;
  maxBallotsPerDevice: number;
  maxBallotsPerIpPerHour: number;
  minFillSeconds: number;
  /** ISO time the form was loaded: voters' own answers added later are never deleted by this save. */
  loadedAt: string;
  hasVotes: boolean;
  questions: {
    id: string;
    title: string;
    picks: number;
    ranked: boolean;
    allowWriteIn: boolean;
    options: { id: string; name: string; club: string | null; photo: string | null; custom: boolean }[];
  }[];
};

const initialState: PollActionState = { success: false, message: "" };

let counter = 0;
const nextKey = () => `k${++counter}`;

const newOption = (name = "", club = ""): OptionDraft => ({ key: nextKey(), name, club, photo: "" });
const newQuestion = (title = "", picks = 1): QuestionDraft => ({
  key: nextKey(),
  title,
  picks,
  ranked: true,
  allowWriteIn: false,
  options: [],
  bulk: "",
  showBulk: false,
});

const toLocalInput = (date: Date | null) =>
  date ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "";

type QuestionType = "single" | "ranked" | "multiple";

const questionType = (q: Pick<QuestionDraft, "picks" | "ranked">): QuestionType =>
  q.picks === 1 ? "single" : q.ranked ? "ranked" : "multiple";

const selectClass =
  "w-full rounded-[10px] border border-border bg-card px-4 py-3 text-base text-foreground";

export function PollForm({
  poll,
  save,
}: {
  poll?: PollFormData;
  /** Replaces the real save action (used by the local mock preview). */
  save?: (prev: PollActionState, formData: FormData) => Promise<PollActionState>;
}) {
  const action = save ?? savePoll.bind(null, poll?.id ?? null);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [questions, setQuestions] = useState<QuestionDraft[]>(() =>
    poll
      ? poll.questions.map((q) => ({
          key: nextKey(),
          id: q.id,
          title: q.title,
          picks: q.picks,
          ranked: q.ranked,
          allowWriteIn: q.allowWriteIn,
          bulk: "",
          showBulk: false,
          options: q.options.map((o) => ({
            key: nextKey(),
            id: o.id,
            name: o.name,
            club: o.club ?? "",
            photo: o.photo ?? "",
            custom: o.custom,
          })),
        }))
      : [newQuestion()]
  );

  function updateQuestion(key: string, patch: Partial<QuestionDraft>) {
    setQuestions((current) => current.map((q) => (q.key === key ? { ...q, ...patch } : q)));
  }

  function updateOption(qKey: string, oKey: string, patch: Partial<OptionDraft>) {
    setQuestions((current) =>
      current.map((q) =>
        q.key === qKey ? { ...q, options: q.options.map((o) => (o.key === oKey ? { ...o, ...patch } : o)) } : q
      )
    );
  }

  function setQuestionType(key: string, type: QuestionType) {
    setQuestions((current) =>
      current.map((q) => {
        if (q.key !== key) return q;
        if (type === "single") return { ...q, picks: 1, ranked: true };
        return { ...q, picks: Math.max(2, q.picks), ranked: type === "ranked" };
      })
    );
  }

  function moveQuestion(index: number, direction: -1 | 1) {
    setQuestions((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const copy = [...current];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  }

  function addBulk(qKey: string) {
    setQuestions((current) =>
      current.map((q) => {
        if (q.key !== qKey) return q;
        const added = q.bulk
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => {
            const [name, ...rest] = line.split(/[,;|]/);
            return newOption(name.trim(), rest.join(", ").trim());
          });
        return { ...q, options: [...q.options, ...added], bulk: "", showBulk: false };
      })
    );
  }

  const structure = JSON.stringify(
    questions.map((q) => ({
      id: q.id,
      title: q.title,
      picks: q.picks,
      ranked: q.ranked,
      allowWriteIn: q.allowWriteIn,
      options: q.options.map((o) => ({ id: o.id, name: o.name, club: o.club, photo: o.photo })),
    }))
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.message && (
        <p role="alert" className={state.success ? "text-sm text-success" : "text-sm text-destructive"}>
          {state.message}
        </p>
      )}
      <input type="hidden" name="structure" value={structure} />
      <input type="hidden" name="loadedAt" value={poll?.loadedAt ?? ""} />

      <section className="space-y-4">
        <div>
          <Label htmlFor="title">Titre du sondage *</Label>
          <Input id="title" name="title" defaultValue={poll?.title} required placeholder="Ex. : Joueur du mois" />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={poll?.description ?? ""}
            placeholder="Expliquez en une phrase le but du sondage."
          />
        </div>
        <ImageField id="coverImage" name="coverImage" label="Image de couverture" defaultValue={poll?.coverImage} />
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="status">Statut *</Label>
            <select id="status" name="status" defaultValue={poll?.status ?? "DRAFT"} className={selectClass}>
              <option value="DRAFT">Brouillon (invisible)</option>
              <option value="OPEN">Ouvert aux votes</option>
              <option value="CLOSED">Clos (résultats seuls)</option>
            </select>
          </div>
          <div>
            <Label htmlFor="startsAt">Début (optionnel)</Label>
            <Input id="startsAt" name="startsAt" type="datetime-local" defaultValue={toLocalInput(poll?.startsAt ?? null)} />
          </div>
          <div>
            <Label htmlFor="endsAt">Fin (optionnel)</Label>
            <Input id="endsAt" name="endsAt" type="datetime-local" defaultValue={toLocalInput(poll?.endsAt ?? null)} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="resultsVisibility">Résultats visibles pour les visiteurs</Label>
            <select
              id="resultsVisibility"
              name="resultsVisibility"
              defaultValue={poll?.resultsVisibility ?? "AFTER_VOTE"}
              className={selectClass}
            >
              {(Object.keys(RESULTS_VISIBILITY_LABELS) as PollResultsVisibility[]).map((value) => (
                <option key={value} value={value}>
                  {RESULTS_VISIBILITY_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="identification">Identification des votants</Label>
            <select
              id="identification"
              name="identification"
              defaultValue={poll?.identification ?? "NONE"}
              className={selectClass}
            >
              {(Object.keys(IDENTIFICATION_LABELS) as PollIdentification[]).map((value) => (
                <option key={value} value={value}>
                  {IDENTIFICATION_LABELS[value]}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Un seul vote par adresse ou numéro. Il est enregistré sous forme chiffrée, jamais en clair.
            </p>
          </div>
        </div>

        <details className="rounded-xl border border-border bg-muted/40 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-foreground">
            Protection contre les abus (avancé)
          </summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="maxBallotsPerDevice">Votes max par appareil</Label>
              <Input
                id="maxBallotsPerDevice"
                name="maxBallotsPerDevice"
                type="number"
                min={1}
                max={1000}
                defaultValue={poll?.maxBallotsPerDevice ?? 10}
              />
              <p className="mt-1 text-xs text-muted-foreground">Même connexion et même navigateur.</p>
            </div>
            <div>
              <Label htmlFor="maxBallotsPerIpPerHour">Votes max par connexion et par heure</Label>
              <Input
                id="maxBallotsPerIpPerHour"
                name="maxBallotsPerIpPerHour"
                type="number"
                min={1}
                max={10000}
                defaultValue={poll?.maxBallotsPerIpPerHour ?? 30}
              />
              <p className="mt-1 text-xs text-muted-foreground">Sur mobile, plusieurs personnes partagent une connexion.</p>
            </div>
            <div>
              <Label htmlFor="minFillSeconds">Délai minimum pour voter (s)</Label>
              <Input
                id="minFillSeconds"
                name="minFillSeconds"
                type="number"
                min={0}
                max={60}
                defaultValue={poll?.minFillSeconds ?? 3}
              />
              <p className="mt-1 text-xs text-muted-foreground">0 pour désactiver. Bloque les robots.</p>
            </div>
          </div>
        </details>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-semibold text-foreground">Questions</h2>
        </div>

        {poll?.hasVotes && (
          <p className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
            Des votes existent déjà. Vous pouvez corriger un intitulé ou ajouter des réponses, mais retirer une réponse
            supprime les votes qu&apos;elle a reçus, et changer le nombre de choix peut fausser les résultats.
          </p>
        )}

        {questions.map((q, qi) => (
          <div key={q.key} className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-start gap-3">
              <div className="min-w-[200px] flex-1">
                <Label htmlFor={`q-title-${q.key}`}>Question {qi + 1} *</Label>
                <Input
                  id={`q-title-${q.key}`}
                  value={q.title}
                  onChange={(e) => updateQuestion(q.key, { title: e.target.value })}
                  placeholder="Ex. : Quel est votre match préféré ?"
                />
              </div>
              <div className="w-full sm:w-56">
                <Label htmlFor={`q-type-${q.key}`}>Type de question</Label>
                <select
                  id={`q-type-${q.key}`}
                  value={questionType(q)}
                  onChange={(e) => setQuestionType(q.key, e.target.value as QuestionType)}
                  className={selectClass}
                >
                  <option value="single">Un seul choix</option>
                  <option value="ranked">Classement (Top N)</option>
                  <option value="multiple">Plusieurs choix (sans ordre)</option>
                </select>
              </div>
              {q.picks > 1 && (
                <div className="w-28">
                  <Label htmlFor={`q-picks-${q.key}`}>Nombre de choix</Label>
                  <Input
                    id={`q-picks-${q.key}`}
                    type="number"
                    min={2}
                    max={20}
                    value={q.picks}
                    onChange={(e) =>
                      updateQuestion(q.key, { picks: Math.max(2, Math.min(20, Number(e.target.value) || 2)) })
                    }
                  />
                </div>
              )}
              <div className="flex items-end gap-1 pt-6">
                <button
                  type="button"
                  aria-label="Monter la question"
                  disabled={qi === 0}
                  onClick={() => moveQuestion(qi, -1)}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg hover:bg-muted disabled:opacity-30"
                >
                  <ArrowUp className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Descendre la question"
                  disabled={qi === questions.length - 1}
                  onClick={() => moveQuestion(qi, 1)}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg hover:bg-muted disabled:opacity-30"
                >
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Supprimer la question"
                  disabled={questions.length === 1}
                  onClick={() => setQuestions((current) => current.filter((x) => x.key !== q.key))}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-destructive hover:bg-destructive-soft disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              {questionType(q) === "single"
                ? "Le visiteur choisit une seule réponse."
                : questionType(q) === "ranked"
                  ? `Le visiteur classe ses ${q.picks} favoris : le 1er vaut ${q.picks} points, le dernier 1 point.`
                  : `Le visiteur choisit ${q.picks} réponses : chaque réponse compte 1 point.`}
            </p>

            <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={q.allowWriteIn}
                onChange={(e) => updateQuestion(q.key, { allowWriteIn: e.target.checked })}
              />
              Les visiteurs peuvent proposer leur propre réponse (saisie libre)
            </label>

            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-foreground">
                Réponses proposées ({q.options.length}){q.options.length < q.picks && (
                  <span className="ml-2 text-xs text-destructive">il en faut au moins {Math.max(2, q.picks)}</span>
                )}
              </p>
              {q.options.map((o, oi) => (
                <div key={o.key} className="flex flex-wrap items-center gap-2 rounded-lg bg-muted/50 p-2">
                  <span className="w-6 text-center text-xs text-muted-foreground">{oi + 1}</span>
                  {o.custom && (
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent">
                      Proposée par un votant
                    </span>
                  )}
                  <Input
                    aria-label={`Réponse ${oi + 1}`}
                    className="min-w-[160px] flex-1"
                    value={o.name}
                    onChange={(e) => updateOption(q.key, o.key, { name: e.target.value })}
                    placeholder="Intitulé de la réponse"
                  />
                  <Input
                    aria-label={`Détail de la réponse ${oi + 1}`}
                    className="min-w-[140px] flex-1"
                    value={o.club}
                    onChange={(e) => updateOption(q.key, o.key, { club: e.target.value })}
                    placeholder="Détail (optionnel) : club, équipe…"
                  />
                  <div className="w-full sm:w-64">
                    <ImageField
                      id={`photo-${o.key}`}
                      name={`photo-${o.key}`}
                      label="Photo"
                      defaultValue={o.photo}
                      onChange={(value) => updateOption(q.key, o.key, { photo: value })}
                    />
                  </div>
                  <button
                    type="button"
                    aria-label={`Retirer la réponse ${oi + 1}`}
                    onClick={() =>
                      setQuestions((current) =>
                        current.map((x) =>
                          x.key === q.key ? { ...x, options: x.options.filter((y) => y.key !== o.key) } : x
                        )
                      )
                    }
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-destructive hover:bg-destructive-soft"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ))}

              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  type="button"
                  variant="soft"
                  size="sm"
                  onClick={() => updateQuestion(q.key, { options: [...q.options, newOption()] })}
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  Ajouter une réponse
                </Button>
                <Button
                  type="button"
                  variant="soft"
                  size="sm"
                  onClick={() => updateQuestion(q.key, { showBulk: !q.showBulk })}
                >
                  <ListPlus className="h-3.5 w-3.5" aria-hidden="true" />
                  Coller une liste
                </Button>
              </div>

              {q.showBulk && (
                <div className="space-y-2 rounded-lg border border-border p-3">
                  <Label htmlFor={`bulk-${q.key}`}>Une réponse par ligne : « Intitulé, Détail »</Label>
                  <Textarea
                    id={`bulk-${q.key}`}
                    rows={5}
                    value={q.bulk}
                    onChange={(e) => updateQuestion(q.key, { bulk: e.target.value })}
                    placeholder={"Réponse A, détail\nRéponse B, détail\nRéponse C"}
                  />
                  <Button type="button" size="sm" onClick={() => addBulk(q.key)}>
                    Ajouter ces réponses
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}

        <Button type="button" variant="secondary" onClick={() => setQuestions((c) => [...c, newQuestion()])}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Ajouter une question
        </Button>
      </section>

      <div className="sticky bottom-0 z-10 -mx-5 flex items-center justify-between gap-3 border-t border-border bg-card/95 px-5 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <Link href="/admin/sondages" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Retour à la liste
        </Link>
        <div className="flex items-center gap-3">
          {state.message && (
            <span className={state.success ? "text-sm text-success" : "text-sm text-destructive"}>{state.message}</span>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </div>
    </form>
  );
}
