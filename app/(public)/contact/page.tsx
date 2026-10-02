import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { ContactForm } from "@/components/forms/ContactForm";
import { SocialLinks } from "@/components/layout/SocialLinks";
import { getSiteSettings } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez FMA SPORT à Dakar, Sénégal.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings().catch(() => null);

  return (
    <>
      <PageHeader title="Contact" description="Une question, un partenariat, un projet média ?" />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">FMA SPORT</h2>
            <p className="mt-2 text-muted-foreground">{settings?.address || "Dakar, Sénégal"}</p>
            <a
              href={`mailto:${settings?.email || "footballmediaafriquesport@gmail.com"}`}
              className="mt-1 block text-primary hover:underline"
            >
              {settings?.email || "footballmediaafriquesport@gmail.com"}
            </a>
            {settings?.phone && (
              <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="mt-1 block text-primary hover:underline">
                {settings.phone}
              </a>
            )}
            {settings?.phone2 && (
              <a href={`tel:${settings.phone2.replace(/\s+/g, "")}`} className="mt-1 block text-primary hover:underline">
                {settings.phone2}
              </a>
            )}
            {settings?.whatsapp && (
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block text-primary hover:underline"
              >
                WhatsApp : {settings.whatsapp}
              </a>
            )}
            <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Suivez-nous
            </h3>
            <SocialLinks
              className="mt-3"
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
          <ContactForm />
        </div>
      </div>
    </>
  );
}
