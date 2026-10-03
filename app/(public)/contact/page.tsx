import type { Metadata } from "next";
import Image from "next/image";
import { Mail, MapPin, Phone, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/sections/PageHeader";
import { ContactForm } from "@/components/forms/ContactForm";
import { SocialLinks } from "@/components/layout/SocialLinks";
import { Card } from "@/components/ui/Card";
import { getSiteSettings } from "@/lib/queries";
import { CONTACT_IMAGE } from "@/lib/stock-images";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez FMA SPORT à Dakar, Sénégal.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings().catch(() => null);

  return (
    <>
      <PageHeader title="Contact" description="Une question, un partenariat, un projet média ?" />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="relative min-h-[420px] overflow-hidden rounded-2xl shadow-sm lg:min-h-full">
            <Image
              src={CONTACT_IMAGE}
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/40 to-transparent"
            />
            <div className="relative flex h-full flex-col justify-end p-6 text-white sm:p-8">
              <h2 className="font-heading text-xl font-semibold">FMA SPORT</h2>
              <p className="mt-1 text-sm text-white/90">
                {settings?.address || "Dakar, Sénégal"}
              </p>

              <div className="mt-5 space-y-2.5 text-sm">
                <a
                  href={`mailto:${settings?.email || "footballmediaafriquesport@gmail.com"}`}
                  className="flex items-center gap-2.5 text-white/90 hover:text-white"
                >
                  <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {settings?.email || "footballmediaafriquesport@gmail.com"}
                </a>
                {(settings?.phone || settings?.phone2) && (
                  <span className="flex items-center gap-2.5 text-white/90">
                    <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="flex flex-wrap items-center gap-x-2">
                      {settings?.phone && (
                        <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="hover:text-white">
                          {settings.phone}
                        </a>
                      )}
                      {settings?.phone && settings?.phone2 && <span className="text-white/50">/</span>}
                      {settings?.phone2 && (
                        <a href={`tel:${settings.phone2.replace(/\s+/g, "")}`} className="hover:text-white">
                          {settings.phone2}
                        </a>
                      )}
                    </span>
                  </span>
                )}
                {settings?.whatsapp && (
                  <a
                    href={`https://wa.me/${settings.whatsapp.replace(/[^\d]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-white/90 hover:text-white"
                  >
                    <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    WhatsApp : {settings.whatsapp}
                  </a>
                )}
                {!settings?.phone && !settings?.phone2 && !settings?.whatsapp && (
                  <span className="flex items-center gap-2.5 text-white/90">
                    <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Dakar, Sénégal
                  </span>
                )}
              </div>

              <div className="mt-6 border-t border-white/20 pt-5">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-white/70">
                  Suivez-nous
                </h3>
                <SocialLinks
                  className="mt-3"
                  onDark
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
            </div>
          </div>

          <Card className="p-6 sm:p-8">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Envoyez-nous un message
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Nous répondons habituellement sous 48 heures.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
