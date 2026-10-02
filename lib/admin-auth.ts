import { auth } from "@/lib/auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Non autorisé");
  }
  return session.user as { id: string; email: string; name: string; role: string };
}
