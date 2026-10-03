import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-primary px-4 py-12">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-secondary/30 blur-3xl"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-accent/20 blur-3xl"
      />
      <span aria-hidden="true" className="pointer-events-none absolute right-24 top-16 h-1.5 w-1.5 rounded-full bg-accent" />
      <span aria-hidden="true" className="pointer-events-none absolute bottom-24 left-20 h-2 w-2 rounded-full bg-white/60" />
      <span aria-hidden="true" className="pointer-events-none absolute left-1/3 top-10 h-1 w-1 rounded-full bg-white/50" />

      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Link
            href="/"
            className="inline-flex transition-transform hover:scale-105"
            aria-label="Retour à l'accueil FMA SPORT"
          >
            <Logo size={60} onDark />
          </Link>
        </div>

        {children}

        <Link
          href="/"
          className="mt-6 block text-center text-sm font-medium text-white/80 transition-colors hover:text-white"
        >
          ← Retour au site
        </Link>
      </div>
    </div>
  );
}
