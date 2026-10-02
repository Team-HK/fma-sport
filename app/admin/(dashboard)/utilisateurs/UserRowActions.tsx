"use client";

import { useTransition } from "react";
import { Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toggleAdminUserActive, updateAdminUserRole } from "@/app/actions/admin/users";

export function ToggleUserActiveButton({ id, active }: { id: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (!active || confirm("Désactiver ce compte ? Il ne pourra plus se connecter.")) {
          startTransition(() => toggleAdminUserActive(id, !active));
        }
      }}
    >
      {active ? (
        <PowerOff className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Power className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {active ? "Désactiver" : "Activer"}
    </Button>
  );
}

export function RoleSelect({ id, role }: { id: string; role: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <select
      aria-label="Rôle"
      defaultValue={role}
      disabled={isPending}
      onChange={(e) => startTransition(() => updateAdminUserRole(id, e.target.value as "SUPER_ADMIN" | "EDITOR"))}
      className="cursor-pointer rounded-[10px] border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
    >
      <option value="EDITOR">Éditeur</option>
      <option value="SUPER_ADMIN">Super administrateur</option>
    </select>
  );
}
