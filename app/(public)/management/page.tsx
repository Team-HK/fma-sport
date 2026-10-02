import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Search, UserCircle, Eye, Video, Compass, Handshake } from "lucide-react";

export const metadata: Metadata = {
  title: "Management sportif",
  description:
    "FMA SPORT Management accompagne et valorise les jeunes talents du football sénégalais et africain.",
};

const SERVICES = [
  {
    number: "01",
    title: "Détection",
    description: "Identification et étude de profils prometteurs.",
    icon: Search,
  },
  {
    number: "02",
    title: "Profil joueur",
    description: "Création d'une présentation professionnelle du joueur.",
    icon: UserCircle,
  },
  {
    number: "03",
    title: "Visibilité",
    description: "Mise en avant du joueur sur le site et les réseaux sociaux.",
    icon: Eye,
  },
  {
    number: "04",
    title: "Vidéo",
    description: "Valorisation des performances et création de contenus vidéo.",
    icon: Video,
  },
  {
    number: "05",
    title: "Accompagnement",
    description: "Suivi du parcours sportif et professionnel.",
    icon: Compass,
  },
  {
    number: "06",
    title: "Mise en relation",
    description:
      "Mise en relation avec des professionnels du football lorsque cela est possible et conforme aux règles applicables.",
    icon: Handshake,
  },
];

export default function ManagementPage() {
  return (
    <>
      <PageHeader
        title="Management sportif"
        description="FMA SPORT Management est l'espace consacré à l'accompagnement et à la valorisation des jeunes talents du football."
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <Card key={service.number} className="p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent">
                  <service.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-muted-foreground">
                  {service.number}
                </span>
              </div>
              <h2 className="mt-4 font-heading text-lg font-semibold text-foreground">
                {service.title}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button href="/devenir-joueur" size="lg">
            Devenir joueur FMA SPORT
          </Button>
        </div>
      </div>
    </>
  );
}
