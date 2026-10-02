import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHeader title="Politique de confidentialité" />
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10 text-sm leading-relaxed text-foreground sm:px-6">
        <p>
          FMA.SPORT collecte les données personnelles transmises volontairement via ses
          formulaires (contact, candidature joueur, inscription événement) dans le seul but de
          traiter la demande correspondante.
        </p>
        <p>
          Une attention particulière est portée aux données des joueurs mineurs : leur
          candidature nécessite le consentement explicite du représentant légal quant à
          l&apos;utilisation des informations transmises.
        </p>
        <p>
          Conformément à la réglementation applicable, vous disposez d&apos;un droit d&apos;accès,
          de rectification et de suppression de vos données. Pour exercer ce droit, contactez-nous
          à footballmediaafriquesport@gmail.com.
        </p>
      </div>
    </>
  );
}
