import Link from "next/link";
import { FOOTER_LINKS, LEGAL_LINKS } from "@/lib/constants";
import { SocialLinks } from "./SocialLinks";
import { AdSlot } from "@/components/sections/AdSlot";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <AdSlot placement="FOOTER" className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8" />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-heading text-xl font-bold text-primary">
              FMA<span className="text-accent">.SPORT</span>
            </p>
            <p className="mt-3 max-w-xs text-sm italic text-muted-foreground">
              « L&apos;information football. Les talents de demain. »
            </p>
            <SocialLinks className="mt-5" />
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
              Navigation
            </h2>
            <ul className="mt-4 space-y-2">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
              Informations
            </h2>
            <ul className="mt-4 space-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">Dakar, Sénégal</p>
            <a
              href="mailto:footballmediaafriquesport@gmail.com"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              footballmediaafriquesport@gmail.com
            </a>
          </div>
        </div>

        <p className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} FMA.SPORT — Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
