import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { MfaManager } from "./MfaManager";

export const dynamic = "force-dynamic";

export default async function AdminSecurityPage() {
  const admin = await requireAdmin();
  const user = await prisma.adminUser.findUnique({ where: { id: admin.id } });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">Sécurité</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Gérez l&apos;authentification à deux facteurs (MFA) de votre compte administrateur.
      </p>

      <div className="mt-6 max-w-2xl rounded-xl border border-border bg-muted p-5">
        <MfaManager enabled={user?.totpEnabled ?? false} />
      </div>
    </div>
  );
}
