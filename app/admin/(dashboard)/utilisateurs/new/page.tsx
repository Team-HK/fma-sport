import { requireSuperAdmin } from "@/lib/admin-auth";
import { NewUserForm } from "./NewUserForm";

export default async function NewAdminUserPage() {
  await requireSuperAdmin();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">Nouvel utilisateur</h1>
      <div className="mt-6 max-w-md">
        <NewUserForm />
      </div>
    </div>
  );
}
