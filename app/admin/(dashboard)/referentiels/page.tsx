import { prisma } from "@/lib/prisma";
import { Tabs } from "@/components/ui/Tabs";
import { SiteSettingsForm } from "./SiteSettingsForm";
import CarouselTab from "./carousel/page";

export const dynamic = "force-dynamic";

export default async function AdminReferentielsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; corbeille?: string }>;
}) {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">Référentiels</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Informations de contact, réseaux sociaux et carousel d&apos;accueil — modifiables sans toucher au code.
      </p>

      <div className="mt-6">
        <Tabs
          tabs={[
            {
              id: "coordonnees",
              label: "Coordonnées & réseaux sociaux",
              content: <SiteSettingsForm settings={settings} />,
            },
            {
              id: "carousel",
              label: "Carousel d'accueil",
              content: <CarouselTab searchParams={searchParams} />,
            },
          ]}
        />
      </div>
    </div>
  );
}
