"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/Input";

type StatRow = {
  season: string;
  competition: string;
  matches: string;
  goals: string;
  assists: string;
  minutes: string;
};

const EMPTY_ROW: StatRow = {
  season: "",
  competition: "",
  matches: "0",
  goals: "0",
  assists: "0",
  minutes: "0",
};

const NUMBER_COLUMNS = [
  { key: "matches", label: "MJ", title: "Matchs joués" },
  { key: "goals", label: "Buts", title: "Buts" },
  { key: "assists", label: "PD", title: "Passes décisives" },
  { key: "minutes", label: "Min.", title: "Minutes jouées" },
] as const;

const cellInput =
  "w-full rounded-lg border border-border bg-card px-2.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30";

/**
 * Editable "Statistiques par saison" table. Submits through one hidden `stats`
 * field (one `saison | compétition | MJ | buts | PD | minutes` line per row),
 * which the player action turns back into PlayerStat rows.
 */
export function StatsEditor({
  defaultValue = [],
}: {
  defaultValue?: {
    season: string;
    competition: string;
    matches: number;
    goals: number;
    assists: number;
    minutesPlayed: number;
  }[];
}) {
  const [rows, setRows] = useState<StatRow[]>(() =>
    defaultValue
      .slice()
      .sort((a, b) => b.season.localeCompare(a.season))
      .map((s) => ({
        season: s.season,
        competition: s.competition,
        matches: String(s.matches),
        goals: String(s.goals),
        assists: String(s.assists),
        minutes: String(s.minutesPlayed),
      }))
  );

  function update(index: number, patch: Partial<StatRow>) {
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  const serialized = rows
    .filter((r) => r.season.trim() && r.competition.trim())
    .map((r) =>
      [r.season, r.competition, r.matches, r.goals, r.assists, r.minutes]
        .map((cell) => cell.replace(/[|\n]/g, " ").trim())
        .join(" | ")
    )
    .join("\n");

  const totals = rows.reduce(
    (acc, r) => ({
      matches: acc.matches + (Number(r.matches) || 0),
      goals: acc.goals + (Number(r.goals) || 0),
      assists: acc.assists + (Number(r.assists) || 0),
      minutes: acc.minutes + (Number(r.minutes) || 0),
    }),
    { matches: 0, goals: 0, assists: 0, minutes: 0 }
  );

  return (
    <div>
      <Label>Statistiques par saison</Label>
      <input type="hidden" name="stats" value={serialized} />

      <div className="overflow-x-auto rounded-[10px] border border-border">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="px-2.5 py-2 font-semibold">Saison</th>
              <th scope="col" className="px-2.5 py-2 font-semibold">Compétition</th>
              {NUMBER_COLUMNS.map((c) => (
                <th key={c.key} scope="col" title={c.title} className="w-20 px-2.5 py-2 font-semibold">
                  {c.label}
                </th>
              ))}
              <th scope="col" className="w-10 px-2.5 py-2">
                <span className="sr-only">Supprimer</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row, index) => (
              <tr key={index}>
                <td className="px-2 py-1.5">
                  <input
                    value={row.season}
                    onChange={(e) => update(index, { season: e.target.value })}
                    placeholder="2025/2026"
                    aria-label="Saison"
                    className={cellInput}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    value={row.competition}
                    onChange={(e) => update(index, { competition: e.target.value })}
                    placeholder="Championnat"
                    aria-label="Compétition"
                    className={cellInput}
                  />
                </td>
                {NUMBER_COLUMNS.map((c) => (
                  <td key={c.key} className="px-2 py-1.5">
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={row[c.key]}
                      onChange={(e) => update(index, { [c.key]: e.target.value })}
                      aria-label={c.title}
                      className={cellInput + " tabular-nums"}
                    />
                  </td>
                ))}
                <td className="px-2 py-1.5 text-right">
                  <button
                    type="button"
                    onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
                    aria-label="Supprimer cette ligne"
                    className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive-soft hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-sm text-muted-foreground">
                  Aucune statistique. Ajoutez une ligne par saison et compétition.
                </td>
              </tr>
            )}
          </tbody>
          {rows.length > 1 && (
            <tfoot className="bg-muted/60 text-sm font-semibold text-foreground">
              <tr>
                <td className="px-2.5 py-2" colSpan={2}>Total</td>
                <td className="px-2.5 py-2 tabular-nums">{totals.matches}</td>
                <td className="px-2.5 py-2 tabular-nums">{totals.goals}</td>
                <td className="px-2.5 py-2 tabular-nums">{totals.assists}</td>
                <td className="px-2.5 py-2 tabular-nums">{totals.minutes}</td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <button
        type="button"
        onClick={() => setRows((current) => [...current, { ...EMPTY_ROW }])}
        className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Ajouter une ligne
      </button>
      <p className="mt-1.5 text-xs text-muted-foreground">
        MJ = matchs joués, PD = passes décisives. Les lignes sans saison ou sans compétition sont ignorées.
      </p>
    </div>
  );
}
