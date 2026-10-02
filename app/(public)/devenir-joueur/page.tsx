import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { CandidacyForm } from "@/components/forms/CandidacyForm";

export const metadata: Metadata = {
  title: "Devenir joueur",
  description: "Présente ta candidature pour rejoindre l'écosystème FMA SPORT.",
};

export default function DevenirJoueurPage() {
  return (
    <>
      <PageHeader
        title="Devenir joueur FMA SPORT"
        description="Présente ta candidature pour être détecté, accompagné et mis en valeur par FMA SPORT."
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <CandidacyForm />
      </div>
    </>
  );
}
