import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";

export const metadata: Metadata = { title: "Conditions d'utilisation" };

export default function TermsPage() {
  return (
    <>
      <PageHeader title="Conditions d'utilisation" />
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10 text-sm leading-relaxed text-foreground sm:px-6">
        <p>
          L&apos;utilisation du site FMA SPORT implique l&apos;acceptation pleine et entière des
          présentes conditions. FMA SPORT se réserve le droit de modifier ces conditions à tout
          moment.
        </p>
        <p>
          Les candidatures soumises via le formulaire « Devenir joueur » sont étudiées par
          l&apos;équipe FMA SPORT et ne constituent pas un engagement contractuel automatique.
        </p>
      </div>
    </>
  );
}
