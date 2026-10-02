import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { PlayerCard } from "@/components/sections/PlayerCard";
import { getPublishedPlayers } from "@/lib/queries";
import { AdSlot } from "@/components/sections/AdSlot";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Nos talents",
  description: "Découvrez les jeunes footballeurs mis en avant par FMA SPORT.",
};

export default async function TalentsPage() {
  const players = await getPublishedPlayers().catch(() => []);

  return (
    <>
      <PageHeader
        title="Nos talents"
        description="Les jeunes footballeurs mis en avant par FMA SPORT."
      />

      <AdSlot placement="TALENTS" className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {players.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Aucun talent publié pour le moment.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {players.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
