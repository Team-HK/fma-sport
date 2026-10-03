import { Card } from "@/components/ui/Card";
import { Compass, Newspaper, UserRound, Video, Settings2 } from "lucide-react";

const DEPARTMENTS = [
  {
    name: "Direction",
    description: "Pilotage stratégique et coordination générale de FMA SPORT.",
    icon: Compass,
  },
  {
    name: "Rédaction",
    description: "Production des actualités, reportages et contenus éditoriaux.",
    icon: Newspaper,
  },
  {
    name: "Management & scouting",
    description: "Détection et accompagnement des jeunes talents.",
    icon: UserRound,
  },
  {
    name: "Production vidéo",
    description: "Réalisation et montage des contenus vidéo.",
    icon: Video,
  },
  {
    name: "Technique",
    description: "Développement et maintien de la plateforme.",
    icon: Settings2,
  },
] as const;

/** Generic, name-free organization overview shown until real team profiles are published. */
export function TeamDepartmentsOverview({ compact = false }: { compact?: boolean }) {
  const departments = compact ? DEPARTMENTS.slice(0, 4) : DEPARTMENTS;

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {departments.map((dept) => (
        <Card key={dept.name} className="p-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-on-accent">
            <dept.icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3 className="mt-4 font-heading text-base font-semibold text-foreground">{dept.name}</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">{dept.description}</p>
        </Card>
      ))}
    </div>
  );
}
