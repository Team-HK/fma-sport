import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Publicité et partenariats",
  description: "Les possibilités de collaboration avec FMA.SPORT.",
};

const FORMATS = [
  "Bannières",
  "Images",
  "Vidéos",
  "Articles sponsorisés",
  "Publications partenaires",
  "Logos partenaires",
  "Campagnes sur les réseaux sociaux",
];

const PLACEMENTS = [
  "Page d'accueil",
  "Pages d'actualités",
  "Articles",
  "Page vidéos",
  "Pages talents",
  "Footer",
];

export default function PublicitePage() {
  return (
    <>
      <PageHeader
        title="Publicité et partenariats"
        description="Les possibilités de collaboration avec FMA.SPORT."
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Formats publicitaires
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {FORMATS.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
          </Card>
          <Card className="p-6">
            <h2 className="font-heading text-lg font-semibold text-foreground">Emplacements</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {PLACEMENTS.map((p) => (
                <li key={p}>• {p}</li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Button href="/contact" size="lg">
            Devenir partenaire
          </Button>
        </div>
      </div>
    </>
  );
}
