import type { Player } from "@prisma/client";

export function PlayerPhotoPlaceholder({
  player,
  className = "",
}: {
  player: Pick<Player, "firstName" | "lastName" | "number">;
  className?: string;
}) {
  const initials = `${player.firstName[0] ?? ""}${player.lastName[0] ?? ""}`.toUpperCase();
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 flex items-center justify-center overflow-hidden bg-primary ${className}`}
    >
      {player.number && (
        <span className="absolute -bottom-6 -right-2 font-heading text-[7rem] font-bold leading-none text-white/[0.06]">
          {player.number}
        </span>
      )}
      <span className="font-heading text-5xl font-bold tracking-wide text-white/90">{initials}</span>
      <span className="absolute inset-x-0 bottom-0 h-1 bg-accent" />
    </div>
  );
}
