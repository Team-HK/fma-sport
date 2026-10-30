"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { changeOwnPassword, type PasswordActionState } from "@/app/actions/admin/password";

const initialState: PasswordActionState = { success: false, message: "" };

export function PasswordForm() {
  const [state, formAction, isPending] = useActionState(changeOwnPassword, initialState);
  const [visible, setVisible] = useState(false);
  const type = visible ? "text" : "password";

  return (
    <form action={formAction} className="space-y-4" key={state.success ? "done" : "form"}>
      <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
        <KeyRound className="h-5 w-5" aria-hidden="true" />
        Mot de passe
      </h2>
      <p className="text-sm text-muted-foreground">
        Au moins 12 caractères, avec 3 types parmi : minuscules, majuscules, chiffres, symboles. Évitez votre adresse
        e-mail et les mots courants. Un gestionnaire de mots de passe est idéal.
      </p>

      {state.message && (
        <p
          role={state.success ? "status" : "alert"}
          className={
            state.success
              ? "rounded-[10px] bg-success-soft p-3 text-sm font-medium text-success-soft-foreground"
              : "rounded-[10px] bg-destructive-soft p-3 text-sm font-medium text-destructive-soft-foreground"
          }
        >
          {state.message}
        </p>
      )}

      <div>
        <Label htmlFor="currentPassword">Mot de passe actuel</Label>
        <Input id="currentPassword" name="currentPassword" type={type} autoComplete="current-password" required />
      </div>
      <div>
        <Label htmlFor="newPassword">Nouveau mot de passe</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type={type}
          autoComplete="new-password"
          minLength={12}
          required
        />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type={type}
          autoComplete="new-password"
          minLength={12}
          required
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          {visible ? "Masquer" : "Afficher"} les mots de passe
        </button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {isPending ? "Enregistrement..." : "Changer le mot de passe"}
        </Button>
      </div>
    </form>
  );
}
