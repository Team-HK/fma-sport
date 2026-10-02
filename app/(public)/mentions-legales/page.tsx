import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";

export const metadata: Metadata = { title: "Mentions légales" };

export default function MentionsLegalesPage() {
  return (
    <>
      <PageHeader title="Mentions légales" />
      <div className="mx-auto max-w-3xl px-4 py-10 text-sm leading-relaxed text-foreground sm:px-6">
        <p>
          Le site FMA SPORT est édité depuis Dakar, Sénégal. Pour toute question relative à
          l&apos;édition du site, contactez-nous à
          {" "}
          <a href="mailto:footballmediaafriquesport@gmail.com" className="text-primary hover:underline">
            footballmediaafriquesport@gmail.com
          </a>
          .
        </p>
        <p className="mt-4">
          L&apos;ensemble des contenus (textes, images, vidéos) publiés sur FMA SPORT est protégé
          par le droit d&apos;auteur. Toute reproduction sans autorisation préalable est interdite.
        </p>
      </div>
    </>
  );
}
