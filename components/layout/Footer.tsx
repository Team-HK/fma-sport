import Link from "next/link";
import { FOOTER_LINKS, LEGAL_LINKS } from "@/lib/constants";
import { SocialLinks } from "./SocialLinks";
import { AdSlot } from "@/components/sections/AdSlot";
import { Logo } from "@/components/ui/Logo";
import { getSiteSettings } from "@/lib/queries";

export async function Footer() {
  const settings = await getSiteSettings().catch(() => null);
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <AdSlot placement="FOOTER" className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8" />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Logo size={48} />
            <p className="mt-3 max-w-xs text-sm italic text-muted-foreground">
              « Le Média qui vit le foot. »
            </p>
            <SocialLinks
              className="mt-5"
              overrides={{
                facebook: settings?.facebookUrl,
                instagram: settings?.instagramUrl,
                tiktok: settings?.tiktokUrl,
                youtube: settings?.youtubeUrl,
                snapchat: settings?.snapchatUrl,
                x: settings?.xUrl,
              }}
            />
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
            <p className="mt-4 text-sm text-muted-foreground">{settings?.address || "Dakar, Sénégal"}</p>
            <a
              href={`mailto:${settings?.email || "footballmediaafriquesport@gmail.com"}`}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {settings?.email || "footballmediaafriquesport@gmail.com"}
            </a>
            {(settings?.phone || settings?.phone2) && (
              <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                {settings?.phone && (
                  <a
                    href={`tel:${settings.phone.replace(/\s+/g, "")}`}
                    className="transition-colors hover:text-primary"
                  >
                    {settings.phone}
                  </a>
                )}
                {settings?.phone && settings?.phone2 && <span>/</span>}
                {settings?.phone2 && (
                  <a
                    href={`tel:${settings.phone2.replace(/\s+/g, "")}`}
                    className="transition-colors hover:text-primary"
                  >
                    {settings.phone2}
                  </a>
                )}
              </p>
            )}
          </div>
        </div>

        <p className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} FMA SPORT — Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
