"use client";

import { useActionState, useEffect, useRef } from "react";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import Link from "next/link";
import { ImageField } from "@/components/ui/ImageField";
import { StatsEditor } from "@/components/admin/StatsEditor";
import { POSITION_LABELS, STRONG_FOOT_LABELS } from "@/lib/constants";
import { upsertPlayer, type PlayerActionState } from "@/app/actions/admin/players";
import type { Player, PlayerStat } from "@prisma/client";

const initialState: PlayerActionState = { success: false, message: "" };

export function PlayerForm({
  player,
  onSuccess,
  cancelHref,
}: {
  player?: Player & { stats?: PlayerStat[] };
  onSuccess?: () => void;
  cancelHref?: string;
}) {
  const action = upsertPlayer.bind(null, player?.id ?? null);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const didRun = useRef(false);

  useEffect(() => {
    if (state.success && didRun.current) onSuccess?.();
    didRun.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      {state.message && (
        <p role="alert" className={state.success ? "text-sm text-success" : "text-sm text-destructive"}>
          {state.message}
        </p>
      )}

      <Tabs
        tabs={[
          {
            id: "identite",
            label: "Identité",
            content: (
              <div className="space-y-4">
                <ImageField id="photo" name="photo" label="Photo" defaultValue={player?.photo} />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input id="firstName" name="firstName" defaultValue={player?.firstName} required />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input id="lastName" name="lastName" defaultValue={player?.lastName} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nationality">Nationalité *</Label>
                    <Input id="nationality" name="nationality" defaultValue={player?.nationality} required />
                  </div>
                  <div>
                    <Label htmlFor="flag">Drapeau (emoji)</Label>
                    <Input id="flag" name="flag" defaultValue={player?.flag ?? ""} placeholder="🇸🇳" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="birthDate">Date de naissance *</Label>
                  <Input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    defaultValue={
                      player?.birthDate ? new Date(player.birthDate).toISOString().slice(0, 10) : ""
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Biographie</Label>
                  <Textarea id="bio" name="bio" rows={4} defaultValue={player?.bio ?? ""} />
                </div>
                <div>
                  <Label htmlFor="strengths">Points forts (un par ligne)</Label>
                  <Textarea
                    id="strengths"
                    name="strengths"
                    rows={4}
                    defaultValue={player?.strengths.join("\n") ?? ""}
                    placeholder={"Vitesse de projection\nQualité de centre\nEndurance"}
                  />
                </div>
                <div>
                  <Label htmlFor="careerHistory">Parcours (une étape par ligne)</Label>
                  <Textarea
                    id="careerHistory"
                    name="careerHistory"
                    rows={4}
                    defaultValue={player?.careerHistory.join("\n") ?? ""}
                    placeholder={"2021–2023 · Académie de quartier\n2023–2025 · Club formateur\n2025– · Club actuel"}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Statut *</Label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={player?.status ?? "DRAFT"}
                    required
                    className="w-full rounded-[10px] border border-border bg-card px-4 py-3 text-base text-foreground"
                  >
                    <option value="DRAFT">Brouillon</option>
                    <option value="PUBLISHED">Publié</option>
                  </select>
                </div>
              </div>
            ),
          },
          {
            id: "football",
            label: "Football",
            content: (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="position">Poste principal *</Label>
                    <select
                      id="position"
                      name="position"
                      defaultValue={player?.position ?? ""}
                      required
                      className="w-full rounded-[10px] border border-border bg-card px-4 py-3 text-base text-foreground"
                    >
                      <option value="">Sélectionner...</option>
                      {Object.entries(POSITION_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="secondaryPosition">Poste secondaire</Label>
                    <select
                      id="secondaryPosition"
                      name="secondaryPosition"
                      defaultValue={player?.secondaryPosition ?? ""}
                      className="w-full rounded-[10px] border border-border bg-card px-4 py-3 text-base text-foreground"
                    >
                      <option value="">Aucun</option>
                      {Object.entries(POSITION_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="strongFoot">Pied fort *</Label>
                    <select
                      id="strongFoot"
                      name="strongFoot"
                      defaultValue={player?.strongFoot ?? ""}
                      required
                      className="w-full rounded-[10px] border border-border bg-card px-4 py-3 text-base text-foreground"
                    >
                      <option value="">Sélectionner...</option>
                      {Object.entries(STRONG_FOOT_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="height">Taille (cm)</Label>
                    <Input id="height" name="height" type="number" defaultValue={player?.height ?? ""} />
                  </div>
                  <div>
                    <Label htmlFor="weight">Poids (kg)</Label>
                    <Input id="weight" name="weight" type="number" defaultValue={player?.weight ?? ""} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="club">Club actuel</Label>
                    <Input id="club" name="club" defaultValue={player?.club ?? ""} />
                  </div>
                  <div>
                    <Label htmlFor="previousClub">Ancien club</Label>
                    <Input id="previousClub" name="previousClub" defaultValue={player?.previousClub ?? ""} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="number">Numéro</Label>
                  <Input id="number" name="number" type="number" defaultValue={player?.number ?? ""} />
                </div>
                <StatsEditor defaultValue={player?.stats ?? []} />
              </div>
            ),
          },
          {
            id: "documents",
            label: "Documents",
            content: (
              <div className="space-y-4">
                <ImageField
                  id="cvUrl"
                  name="cvUrl"
                  label="CV football"
                  defaultValue={player?.cvUrl}
                  accept="application/pdf,image/*"
                />
                <div>
                  <Label htmlFor="documentUrls">Documents sportifs (une URL par ligne)</Label>
                  <Textarea
                    id="documentUrls"
                    name="documentUrls"
                    rows={3}
                    defaultValue={player?.documentUrls.join("\n") ?? ""}
                  />
                </div>
              </div>
            ),
          },
        ]}
      />

      <div
        className={
          cancelHref
            ? "sticky bottom-0 z-10 -mx-5 flex items-center justify-between gap-3 border-t border-border bg-card/95 px-5 py-3 backdrop-blur sm:-mx-6 sm:px-6"
            : "flex justify-end border-t border-border pt-4"
        }
      >
        {cancelHref && (
          <Link
            href={cancelHref}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Retour à la liste
          </Link>
        )}
        <div className="flex items-center gap-3">
          {cancelHref && state.message && (
            <span className={state.success ? "text-sm text-success" : "text-sm text-destructive"}>
              {state.message}
            </span>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </div>
    </form>
  );
}
