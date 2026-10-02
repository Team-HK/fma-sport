"use client";

import { useActionState, useState } from "react";
import { Input, Label, Textarea, FieldError } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CANDIDACY_STEPS } from "@/lib/validations/candidacy";
import { POSITION_LABELS, STRONG_FOOT_LABELS, COUNTRIES } from "@/lib/constants";
import { submitCandidacy, type CandidacyActionState } from "@/app/actions/candidacy";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const initialState: CandidacyActionState = { success: false, message: "" };

export function CandidacyForm() {
  const [step, setStep] = useState(1);
  const [hasPassport, setHasPassport] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [state, formAction, isPending] = useActionState(submitCandidacy, initialState);

  const totalSteps = CANDIDACY_STEPS.length;

  function goNext(form: HTMLFormElement) {
    const stepFields = Array.from(
      form.querySelectorAll<HTMLElement>(`[data-step="${step}"] [required]`)
    );
    const missing: string[] = [];
    for (const field of stepFields) {
      const input = field as HTMLInputElement | HTMLSelectElement;
      if (!input.value || (input.type === "checkbox" && !(input as HTMLInputElement).checked)) {
        missing.push(input.name);
      }
    }
    if (missing.length > 0) {
      setErrors(missing);
      return;
    }
    setErrors([]);
    setStep((s) => Math.min(s + 1, totalSteps));
  }

  if (state.success) {
    return (
      <div className="mx-auto max-w-lg rounded-xl bg-card p-8 text-center shadow-md">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary">
          <Check className="h-7 w-7" aria-hidden="true" />
        </span>
        <h2 className="mt-4 font-heading text-xl font-bold text-foreground">Candidature envoyée</h2>
        <p className="mt-2 text-muted-foreground">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="mx-auto max-w-3xl" onSubmit={() => setErrors([])}>
      {/* Progress */}
      <ol className="mb-8 flex flex-wrap gap-2" aria-label="Étapes du formulaire">
        {CANDIDACY_STEPS.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => setStep(s.id)}
              aria-current={step === s.id ? "step" : undefined}
              className={cn(
                "cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                step === s.id
                  ? "bg-primary text-on-primary"
                  : step > s.id
                    ? "bg-accent/20 text-accent"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {s.id}. {s.title}
            </button>
          </li>
        ))}
      </ol>

      {!state.success && state.message && (
        <p role="alert" className="mb-6 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
          {state.message}
        </p>
      )}

      {/* Step 1 */}
      <fieldset data-step={1} hidden={step !== 1} className="space-y-4">
        <legend className="mb-2 font-heading text-xl font-semibold">
          Étape 1 — Informations personnelles
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="firstName">Prénom *</Label>
            <Input id="firstName" name="firstName" required />
            {errors.includes("firstName") && <FieldError>Ce champ est requis</FieldError>}
          </div>
          <div>
            <Label htmlFor="lastName">Nom *</Label>
            <Input id="lastName" name="lastName" required />
            {errors.includes("lastName") && <FieldError>Ce champ est requis</FieldError>}
          </div>
          <div>
            <Label htmlFor="birthDate">Date de naissance *</Label>
            <Input id="birthDate" name="birthDate" type="date" required />
            {errors.includes("birthDate") && <FieldError>Ce champ est requis</FieldError>}
          </div>
          <div>
            <Label htmlFor="nationality">Nationalité *</Label>
            <select
              id="nationality"
              name="nationality"
              required
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="">Sélectionner...</option>
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            {errors.includes("nationality") && <FieldError>Ce champ est requis</FieldError>}
          </div>
          <div>
            <Label htmlFor="residenceCountry">Pays de résidence *</Label>
            <select
              id="residenceCountry"
              name="residenceCountry"
              required
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="">Sélectionner...</option>
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            {errors.includes("residenceCountry") && <FieldError>Ce champ est requis</FieldError>}
          </div>
          <div>
            <Label htmlFor="phone">Téléphone *</Label>
            <Input id="phone" name="phone" type="tel" required />
            {errors.includes("phone") && <FieldError>Ce champ est requis</FieldError>}
          </div>
          <div>
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" name="whatsapp" type="tel" />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input id="email" name="email" type="email" required />
            {errors.includes("email") && <FieldError>Ce champ est requis</FieldError>}
          </div>
        </div>
      </fieldset>

      {/* Step 2 */}
      <fieldset data-step={2} hidden={step !== 2} className="space-y-4">
        <legend className="mb-2 font-heading text-xl font-semibold">
          Étape 2 — Informations football
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="mainPosition">Poste principal *</Label>
            <select
              id="mainPosition"
              name="mainPosition"
              required
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="">Sélectionner...</option>
              {Object.entries(POSITION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {errors.includes("mainPosition") && <FieldError>Ce champ est requis</FieldError>}
          </div>
          <div>
            <Label htmlFor="secondaryPosition">Poste secondaire</Label>
            <select
              id="secondaryPosition"
              name="secondaryPosition"
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
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
            <Label htmlFor="strongFoot">Pied fort *</Label>
            <select
              id="strongFoot"
              name="strongFoot"
              required
              className="w-full rounded-lg border border-border bg-card px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="">Sélectionner...</option>
              {Object.entries(STRONG_FOOT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {errors.includes("strongFoot") && <FieldError>Ce champ est requis</FieldError>}
          </div>
          <div>
            <Label htmlFor="height">Taille (cm)</Label>
            <Input id="height" name="height" type="number" min={100} max={230} />
          </div>
          <div>
            <Label htmlFor="weight">Poids (kg)</Label>
            <Input id="weight" name="weight" type="number" min={30} max={150} />
          </div>
          <div>
            <Label htmlFor="currentClub">Club actuel</Label>
            <Input id="currentClub" name="currentClub" />
          </div>
          <div>
            <Label htmlFor="level">Niveau</Label>
            <Input id="level" name="level" placeholder="Ex : National, Régional..." />
          </div>
          <div>
            <Label htmlFor="previousClub">Ancien club</Label>
            <Input id="previousClub" name="previousClub" />
          </div>
        </div>
      </fieldset>

      {/* Step 3 */}
      <fieldset data-step={3} hidden={step !== 3} className="space-y-4">
        <legend className="mb-2 font-heading text-xl font-semibold">Étape 3 — Passeport</legend>
        <p className="font-medium text-foreground">As-tu un passeport ?</p>
        <div className="flex gap-4">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="hasPassport"
              value="true"
              checked={hasPassport}
              onChange={() => setHasPassport(true)}
            />
            Oui
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="hasPassport"
              value="false"
              checked={!hasPassport}
              onChange={() => setHasPassport(false)}
            />
            Non
          </label>
        </div>
        {hasPassport && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="passportCountry">Pays du passeport</Label>
              <select
                id="passportCountry"
                name="passportCountry"
                className="w-full rounded-lg border border-border bg-card px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
              >
                <option value="">Sélectionner...</option>
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="passportExpiry">Date d&apos;expiration</Label>
              <Input id="passportExpiry" name="passportExpiry" type="date" />
            </div>
          </div>
        )}
      </fieldset>

      {/* Step 4 */}
      <fieldset data-step={4} hidden={step !== 4} className="space-y-4">
        <legend className="mb-2 font-heading text-xl font-semibold">
          Étape 4 — Parcours football
        </legend>
        <div>
          <Label htmlFor="clubHistory">Historique des clubs</Label>
          <Textarea id="clubHistory" name="clubHistory" rows={3} />
        </div>
        <div>
          <Label htmlFor="experience">Expérience</Label>
          <Textarea id="experience" name="experience" rows={3} />
        </div>
        <div>
          <Label htmlFor="selections">Sélections</Label>
          <Textarea id="selections" name="selections" rows={2} />
        </div>
        <div>
          <Label htmlFor="competitionsPlayed">Compétitions disputées</Label>
          <Textarea id="competitionsPlayed" name="competitionsPlayed" rows={2} />
        </div>
        <div>
          <Label htmlFor="honours">Palmarès</Label>
          <Textarea id="honours" name="honours" rows={2} />
        </div>
      </fieldset>

      {/* Step 5 */}
      <fieldset data-step={5} hidden={step !== 5} className="space-y-4">
        <legend className="mb-2 font-heading text-xl font-semibold">Étape 5 — Vidéos</legend>
        <div>
          <Label htmlFor="youtubeLink">Lien YouTube</Label>
          <Input id="youtubeLink" name="youtubeLink" type="url" placeholder="https://..." />
        </div>
        <div>
          <Label htmlFor="tiktokLink">Lien TikTok</Label>
          <Input id="tiktokLink" name="tiktokLink" type="url" placeholder="https://..." />
        </div>
        <div>
          <Label htmlFor="driveLink">Lien Google Drive</Label>
          <Input id="driveLink" name="driveLink" type="url" placeholder="https://..." />
        </div>
        <div>
          <Label htmlFor="otherVideoLinks">Autres liens vidéo (un par ligne)</Label>
          <Textarea id="otherVideoLinks" name="otherVideoLinks" rows={3} />
        </div>
      </fieldset>

      {/* Step 6 */}
      <fieldset data-step={6} hidden={step !== 6} className="space-y-4">
        <legend className="mb-2 font-heading text-xl font-semibold">Étape 6 — Documents</legend>
        <div>
          <Label htmlFor="photo">Photo</Label>
          <input
            id="photo"
            name="photo"
            type="file"
            accept="image/*"
            className="block w-full cursor-pointer text-sm text-foreground file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-on-accent"
          />
        </div>
        <div>
          <Label htmlFor="cv">CV football</Label>
          <input
            id="cv"
            name="cv"
            type="file"
            accept=".pdf,.doc,.docx"
            className="block w-full cursor-pointer text-sm text-foreground file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-on-accent"
          />
        </div>
        <div>
          <Label htmlFor="documents">Autres documents sportifs</Label>
          <input
            id="documents"
            name="documents"
            type="file"
            multiple
            className="block w-full cursor-pointer text-sm text-foreground file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-on-accent"
          />
        </div>
      </fieldset>

      {/* Step 7 */}
      <fieldset data-step={7} hidden={step !== 7} className="space-y-4">
        <legend className="mb-2 font-heading text-xl font-semibold">Étape 7 — Consentement</legend>
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" name="consentGiven" value="true" required className="mt-1" />
          <span className="text-sm text-foreground">
            Je confirme mon accord concernant l&apos;utilisation de mes informations personnelles
            pour l&apos;étude de ma candidature par FMA SPORT. *
          </span>
        </label>
        {errors.includes("consentGiven") && (
          <FieldError>Vous devez donner votre consentement</FieldError>
        )}
      </fieldset>

      {/* Navigation */}
      <div className="mt-8 flex justify-between border-t border-border pt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setStep((s) => Math.max(s - 1, 1))}
          className={step === 1 ? "invisible" : ""}
        >
          Précédent
        </Button>

        {step < totalSteps ? (
          <Button
            type="button"
            onClick={(e) => goNext((e.target as HTMLElement).closest("form")!)}
          >
            Suivant
          </Button>
        ) : (
          <Button type="submit" disabled={isPending}>
            {isPending ? "Envoi en cours..." : "Envoyer ma candidature"}
          </Button>
        )}
      </div>
    </form>
  );
}
