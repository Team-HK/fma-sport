import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { ContactForm } from "@/components/forms/ContactForm";
import { SocialLinks } from "@/components/layout/SocialLinks";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez FMA SPORT à Dakar, Sénégal.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader title="Contact" description="Une question, un partenariat, un projet média ?" />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground">FMA SPORT</h2>
            <p className="mt-2 text-muted-foreground">Dakar, Sénégal</p>
            <a
              href="mailto:footballmediaafriquesport@gmail.com"
              className="mt-1 block text-primary hover:underline"
            >
              footballmediaafriquesport@gmail.com
            </a>
            <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Suivez-nous
            </h3>
            <SocialLinks className="mt-3" />
          </div>
          <ContactForm />
        </div>
      </div>
    </>
  );
}
