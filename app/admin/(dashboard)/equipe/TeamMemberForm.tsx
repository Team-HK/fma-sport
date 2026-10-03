"use client";

import { useActionState, useEffect, useRef } from "react";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageField } from "@/components/ui/ImageField";
import { TEAM_DEPARTMENT_SUGGESTIONS } from "@/lib/constants";
import { upsertTeamMember, type TeamMemberActionState } from "@/app/actions/admin/team";
import type { TeamMember } from "@prisma/client";

const initialState: TeamMemberActionState = { success: false, message: "" };

export function TeamMemberForm({ member, onSuccess }: { member?: TeamMember; onSuccess?: () => void }) {
  const action = upsertTeamMember.bind(null, member?.id ?? null);
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
      <div>
        <Label htmlFor="name">Nom complet *</Label>
        <Input id="name" name="name" defaultValue={member?.name} required />
      </div>
      <div>
        <Label htmlFor="role">Poste / fonction *</Label>
        <Input id="role" name="role" defaultValue={member?.role} required placeholder="Ex. Rédacteur en chef" />
      </div>
      <div>
        <Label htmlFor="department">Département</Label>
        <Input
          id="department"
          name="department"
          list="team-department-suggestions"
          defaultValue={member?.department ?? ""}
          placeholder="Ex. Rédaction"
        />
        <datalist id="team-department-suggestions">
          {TEAM_DEPARTMENT_SUGGESTIONS.map((d) => (
            <option key={d} value={d} />
          ))}
        </datalist>
      </div>

      <ImageField id="photo" name="photo" label="Photo" defaultValue={member?.photo} />

      <div>
        <Label htmlFor="bio">Bio / présentation</Label>
        <Textarea id="bio" name="bio" rows={4} defaultValue={member?.bio ?? ""} />
      </div>

      <div>
        <Label htmlFor="order">Ordre d&apos;affichage</Label>
        <Input id="order" name="order" type="number" defaultValue={member?.order ?? 0} />
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" name="visible" value="true" defaultChecked={member?.visible ?? true} />
        Visible sur le site public
      </label>

      <div className="flex justify-end border-t border-border pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
