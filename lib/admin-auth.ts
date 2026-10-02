import { auth } from "@/lib/auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Non autorisé");
  }
  return session.user as { id: string; email: string; name: string; role: string };
}

export async function requireSuperAdmin() {
  const admin = await requireAdmin();
  if (admin.role !== "SUPER_ADMIN") {
    throw new Error("Réservé au super administrateur.");
  }
  return admin;
}
