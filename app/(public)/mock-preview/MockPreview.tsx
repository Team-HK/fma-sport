"use client";

import { useCallback, useRef, useState } from "react";
import { PageHeader } from "@/components/sections/PageHeader";
import { PollResults } from "@/components/sections/PollResults";
import { PollVoter } from "@/components/forms/PollVoter";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { PollForm, type PollFormData } from "@/app/admin/(dashboard)/sondages/PollForm";
import { cn } from "@/lib/utils";
import type { PollResults as PollResultsData } from "@/lib/polls";
import type { PollVoteState } from "@/app/actions/poll-vote";
import type { PollActionState } from "@/app/actions/admin/polls";

/* ------------------------------------------------------------------ fake data */

type Q = {
  id: string;
  title: string;
  picks: number;
  ranked: boolean;
  options: { id: string; name: string; club: string | null; photo: string | null }[];
};

const opt = (q: string, i: number, name: string, club: string | null) => ({ id: `${q}-${i}`, name, club, photo: null });

const QUESTIONS: Q[] = [
  {
    id: "best",
    title: "Quel est le meilleur joueur du mois ?",
    picks: 1,
    ranked: true,
    options: [
      opt("best", 1, "Ibrahima Ndiaye", "Dakar Sacré-Cœur"),
      opt("best", 2, "Moussa Diallo", "Teungueth FC"),
      opt("best", 3, "Cheikh Sarr", "Génération Foot"),
      opt("best", 4, "Abdou Faye", "AS Pikine"),
    ],
  },
  {
    id: "top",
    title: "Top 3 des meilleurs buteurs",
    picks: 3,
    ranked: true,
    options: [
      opt("top", 1, "Mamadou Gueye", "Jaraaf"),
      opt("top", 2, "Pape Thiam", "Casa Sports"),
      opt("top", 3, "Omar Ba", "Guédiawaye FC"),
      opt("top", 4, "Lamine Cissé", "US Gorée"),
      opt("top", 5, "Assane Mbaye", "Diambars"),
      opt("top", 6, "Babacar Seck", "Stade de Mbour"),
    ],
  },
  {
    id: "content",
    title: "Quels contenus voulez-vous voir en plus ? (2 choix)",
    picks: 2,
    ranked: false,
    options: [
      opt("content", 1, "Interviews de joueurs", null),
      opt("content", 2, "Reportages terrain", null),
      opt("content", 3, "Analyses tactiques", null),
      opt("content", 4, "Détection de jeunes talents", null),
    ],
  },
];

const POLL = {
  id: "mock-poll",
  showResults: true,
  open: true,
  endsAt: "2026-12-31T18:00:00.000Z" as string | null,
  questions: QUESTIONS,
};

// Deterministic fake "crowd" so the standings look realistic.
function crowdPoints(questionId: string, index: number) {
  return Math.round(((questionId.length * 37 + index * 53) % 90) + 40 + (QUESTIONS.length - index) * 6);
}

function buildResults(ballot: Record<string, string[]> | null): PollResultsData {
  const questions = QUESTIONS.map((q) => {
    const rows = q.options.map((o, index) => {
      const crowd = crowdPoints(q.id, index);
      const mine = ballot?.[q.id]?.indexOf(o.id) ?? -1;
      const myPoints = mine >= 0 ? q.picks - mine : 0;
      return {
        optionId: o.id,
        name: o.name,
        club: o.club,
        photo: o.photo,
        voters: Math.round(crowd / 3) + (mine >= 0 ? 1 : 0),
        firstPlaces: Math.round(crowd / 12) + (mine === 0 ? 1 : 0),
        points: crowd + myPoints,
        share: 0,
      };
    });
    const total = rows.reduce((sum, r) => sum + r.points, 0);
    for (const r of rows) r.share = Math.round((r.points / total) * 1000) / 10;
    rows.sort((a, b) => b.points - a.points);
    return {
      questionId: q.id,
      title: q.title,
      picks: q.picks,
      ranked: q.ranked,
      respondents: 214 + (ballot ? 1 : 0),
      options: rows,
    };
  });
  return { totalBallots: 214 + (ballot ? 1 : 0), questions };
}

const ADMIN_POLL: PollFormData = {
  id: "mock-poll",
  title: "Sondage de la communauté (exemple)",
  description: "Un sondage d'exemple pour tester le vote.",
  coverImage: null,
  status: "OPEN",
  startsAt: null,
  endsAt: null,
  showResults: true,
  hasVotes: true,
  questions: QUESTIONS.map((q) => ({ ...q })),
};

const SAMPLE_ARTICLE = `
<h2 style="text-align:center">Un talent sénégalais s'impose dans le championnat</h2>
<p style="text-align:center"><em>Par la rédaction FMA SPORT</em></p>
<p>À seulement 18 ans, le jeune attaquant s'impose comme l'un des grands espoirs du <strong>football sénégalais</strong>. Son aisance technique et sa vision du jeu impressionnent partout en Europe.</p>
<p>Les supporters sénégalais suivent aussi de près les performances de nos talents, de Dakar à Saint-Louis.</p>
<blockquote><p>« Le football africain n'a jamais eu autant de jeunes joueurs prêts à marquer l'histoire. »</p></blockquote>
<ul><li>Détection de talents</li><li>Accompagnement sportif</li><li>Visibilité auprès des recruteurs</li></ul>
`;

/* ------------------------------------------------------------------ preview */

const TABS = [
  { id: "vote", label: "Sondage — côté visiteur" },
  { id: "results", label: "Résultats" },
  { id: "admin", label: "Admin — sondage" },
  { id: "editor", label: "Admin — éditeur d'article" },
] as const;

export function MockPreview() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("vote");
  const ballot = useRef<Record<string, string[]> | null>(null);

  // Same rules as the real server action, against local memory instead of the database.
  const submit = useCallback(async (_prev: PollVoteState, formData: FormData): Promise<PollVoteState> => {
    await new Promise((resolve) => setTimeout(resolve, 900));
    const picked: Record<string, string[]> = {};
    for (const q of QUESTIONS) {
      const chosen: string[] = [];
      for (let rank = 1; rank <= q.picks; rank++) {
        const value = formData.get(`q_${q.id}_${rank}`);
        if (typeof value === "string" && value) chosen.push(value);
      }
      if (chosen.length === 0) continue;
      if (chosen.length !== q.picks) {
        return {
          success: false,
          message: `« ${q.title} » : choisissez ${q.picks} réponse(s) (ou aucune pour passer cette question).`,
        };
      }
      picked[q.id] = chosen;
    }
    if (Object.keys(picked).length === 0) return { success: false, message: "Choisissez au moins une réponse pour voter." };
    ballot.current = picked;
    return { success: true, message: "Merci ! Votre vote a bien été pris en compte." };
  }, []);

  const loadResults = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return buildResults(ballot.current);
  }, []);

  const saveAdmin = useCallback(async (): Promise<PollActionState> => {
    await new Promise((resolve) => setTimeout(resolve, 700));
    return { success: true, message: "Sondage enregistré. (simulation : rien n'est sauvegardé)" };
  }, []);

  return (
    <>
      <PageHeader
        title="Aperçu local — données fictives"
        description="Les vrais composants du sondage et de l'éditeur d'articles, branchés sur une API simulée. Rien n'est écrit en base. Cette page n'existe pas en production."
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div role="tablist" aria-label="Aperçus" className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "cursor-pointer rounded-[10px] border px-4 py-2 text-sm font-medium transition-colors",
                tab === t.id
                  ? "border-primary bg-primary text-on-primary"
                  : "border-border bg-card text-foreground hover:bg-muted"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {tab === "vote" && (
            <div>
              <h2 className="mb-1 font-heading text-2xl font-bold text-foreground">Sondage de la communauté (exemple)</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Choisissez vos réponses (essayez de laisser une question à moitié remplie), puis validez.
              </p>
              <PollVoter poll={POLL} submit={submit} loadResults={loadResults} />
            </div>
          )}

          {tab === "results" && (
            <div>
              <PollResults results={buildResults(ballot.current)} />
            </div>
          )}

          {tab === "admin" && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <h2 className="mb-5 font-heading text-lg font-semibold text-foreground">Modifier le sondage</h2>
              <PollForm poll={ADMIN_POLL} save={saveAdmin} />
            </div>
          )}

          {tab === "editor" && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <RichTextEditor
                name="content"
                label="Contenu *"
                defaultValue={SAMPLE_ARTICLE}
                onUploadImage={async (file) => URL.createObjectURL(file)}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
