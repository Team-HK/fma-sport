"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou mot de passe incorrect.");
        return;
      }

      window.location.href = callbackUrl;
    } catch {
      setError("Email ou mot de passe incorrect.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
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
