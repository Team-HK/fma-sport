import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/admin-auth";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";
import { ToggleUserActiveButton, RoleSelect } from "./UserRowActions";

export const dynamic = "force-dynamic";

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super administrateur",
  EDITOR: "Éditeur",
};

export default async function AdminUsersPage() {
  const currentAdmin = await requireSuperAdmin();
  const users = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Utilisateurs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Seul le super administrateur peut créer ou gérer des comptes d&apos;accès à l&apos;espace admin.
          </p>
        </div>
        <Button href="/admin/utilisateurs/new">Nouvel utilisateur</Button>
      </div>

      <div className="mt-6 space-y-3">
        {users.map((user) => {
          const isSelf = user.id === currentAdmin.id;
          return (
            <div
              key={user.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-border bg-card p-4"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="font-semibold text-foreground">{user.name}</p>
                  <StatusBadge tone={user.active ? "success" : "neutral"}>
                    {user.active ? "Actif" : "Désactivé"}
                  </StatusBadge>
                  {user.totpEnabled && <StatusBadge tone="info">MFA activé</StatusBadge>}
                  {isSelf && <StatusBadge tone="info">Vous</StatusBadge>}
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground">
                  Créé le {formatDate(user.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isSelf ? (
                  <StatusBadge tone="neutral">{ROLE_LABELS[user.role] ?? user.role}</StatusBadge>
                ) : (
                  <>
                    <RoleSelect id={user.id} role={user.role} />
                    <ToggleUserActiveButton id={user.id} active={user.active} />
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
