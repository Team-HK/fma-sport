import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Connexion admin" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="rounded-xl border border-border bg-card p-8 shadow-xl">
      <h1 className="font-heading text-xl font-medium text-foreground">
        Espace administrateur
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Connectez-vous pour accéder au tableau de bord FMA SPORT.
      </p>
      <LoginForm callbackUrl={callbackUrl ?? "/admin"} />
    </div>
  );
}
