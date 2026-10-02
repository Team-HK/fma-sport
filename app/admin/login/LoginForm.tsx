"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { checkAdminCredentials } from "@/app/actions/admin/check-credentials";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"credentials" | "totp">("credentials");
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [totpCode, setTotpCode] = useState("");

  async function handleCredentialsSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const check = await checkAdminCredentials(email, password);
      if (!check.ok) {
        setError("Email ou mot de passe incorrect.");
        return;
      }

      setCredentials({ email, password });

      if (check.requiresTotp) {
        setStep("totp");
        return;
      }

      await doSignIn(email, password);
    } catch {
      setError("Une erreur est survenue. Merci de réessayer.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleTotpSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsPending(true);
    try {
      await doSignIn(credentials.email, credentials.password, totpCode);
    } finally {
      setIsPending(false);
    }
  }

  async function doSignIn(email: string, password: string, code?: string) {
    const result = await signIn("credentials", {
      email,
      password,
      totpCode: code,
      redirect: false,
    });

    if (result?.error) {
      setError(
        step === "totp" ? "Code d'authentification incorrect." : "Email ou mot de passe incorrect."
      );
      return;
    }

    window.location.href = callbackUrl;
  }

  if (step === "totp") {
    return (
      <form onSubmit={handleTotpSubmit} className="mt-6 space-y-4" noValidate>
        {error && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-[10px] bg-destructive/10 p-3 text-sm font-medium text-destructive"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}

        <div>
          <Label htmlFor="totpCode">Code d&apos;authentification</Label>
          <div className="relative">
            <ShieldCheck
              className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="totpCode"
              name="totpCode"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              autoFocus
              maxLength={6}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="w-full rounded-[10px] border border-border bg-card py-3 pl-10 pr-4 text-center text-lg tracking-[0.3em] text-foreground transition-colors duration-200 placeholder:tracking-normal placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Ouvrez votre application d&apos;authentification pour obtenir le code à 6 chiffres.
          </p>
        </div>

        <Button type="submit" disabled={isPending || totpCode.length !== 6} className="mt-2 w-full">
          <Loader2
            className={cn("h-4.5 w-4.5 animate-spin", !isPending && "hidden")}
            aria-hidden="true"
          />
          {isPending ? "Vérification..." : "Vérifier le code"}
        </Button>

        <button
          type="button"
          onClick={() => {
            setStep("credentials");
            setTotpCode("");
            setError(null);
          }}
          className="w-full cursor-pointer text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Retour
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleCredentialsSubmit} className="mt-6 space-y-4" noValidate>
      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-[10px] bg-destructive/10 p-3 text-sm font-medium text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <div>
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            autoFocus
            placeholder="vous@fmasport.com"
            className="w-full rounded-[10px] border border-border bg-card py-3 pl-10 pr-4 text-base text-foreground transition-colors duration-200 placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="password">Mot de passe</Label>
        <div className="relative">
          <Lock
            className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full rounded-[10px] border border-border bg-card py-3 pl-10 pr-11 text-base text-foreground transition-colors duration-200 placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="h-4.5 w-4.5" aria-hidden="true" />
            ) : (
              <Eye className="h-4.5 w-4.5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="mt-2 w-full">
        <Loader2
          className={cn("h-4.5 w-4.5 animate-spin", !isPending && "hidden")}
          aria-hidden="true"
        />
        {isPending ? "Connexion..." : "Se connecter"}
      </Button>
    </form>
  );
}
