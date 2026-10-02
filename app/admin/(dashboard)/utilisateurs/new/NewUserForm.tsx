"use client";

import { useActionState } from "react";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createAdminUser, type UserActionState } from "@/app/actions/admin/users";

const initialState: UserActionState = { success: false, message: "" };

export function NewUserForm() {
  const [state, formAction, isPending] = useActionState(createAdminUser, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.message && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
      <div>
        <Label htmlFor="name">Nom *</Label>
        <Input id="name" name="name" required />
      </div>
      <div>
        <Label htmlFor="email">Email *</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div>
        <Label htmlFor="password">Mot de passe *</Label>
        <Input id="password" name="password" type="password" required minLength={8} />
      </div>
      <div>
        <Label htmlFor="role">Rôle *</Label>
        <select
          id="role"
          name="role"
          defaultValue="EDITOR"
          required
          className="w-full rounded-[10px] border border-border bg-card px-4 py-3 text-base text-foreground"
        >
          <option value="EDITOR">Éditeur</option>
          <option value="SUPER_ADMIN">Super administrateur</option>
        </select>
      </div>
      <div className="flex justify-end border-t border-border pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Création..." : "Créer le compte"}
        </Button>
      </div>
    </form>
  );
}
