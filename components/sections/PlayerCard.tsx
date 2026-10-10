import Link from "next/link";
import Image from "next/image";
import type { Player } from "@prisma/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { POSITION_LABELS, STRONG_FOOT_LABELS } from "@/lib/constants";
import { PlayerPhotoPlaceholder } from "./PlayerPhotoPlaceholder";
import { Flag } from "@/components/ui/Flag";

export function PlayerCard({ player }: { player: Player }) {
  const age = Math.floor(
    (Date.now() - new Date(player.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );

  return (
    <Card className="flex flex-col overflow-hidden p-0">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {player.photo ? (
          <Image
            src={player.photo}
            alt={`${player.firstName} ${player.lastName}, joueur${player.club ? ` ${player.club}` : ""} — FMA SPORT`}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover"
          />
        ) : (
          <PlayerPhotoPlaceholder player={player} />
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-heading text-lg font-semibold text-foreground">
          {player.firstName} {player.lastName}{" "}
          <Flag emoji={player.flag} className="ml-1 h-3.5" />
        </h3>
        <dl className="mt-2 space-y-1 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <dt>Âge</dt>
            <dd>{age} ans</dd>
          </div>
          <div className="flex justify-between">
            <dt>Poste</dt>
            <dd>{POSITION_LABELS[player.position] ?? player.position}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Pied fort</dt>
            <dd>{STRONG_FOOT_LABELS[player.strongFoot] ?? player.strongFoot}</dd>
          </div>
          {player.club && (
            <div className="flex justify-between">
              <dt>Club</dt>
              <dd>{player.club}</dd>
            </div>
          )}
        </dl>
        <Button href={`/joueurs/${player.slug}`} variant="secondary" size="sm" className="mt-4">
          Voir le profil
        </Button>
      </div>
    </Card>
  );
}
