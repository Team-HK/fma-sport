import { POSITION_LABELS } from "@/lib/constants";

// Horizontal pitch (100 x 64), team attacking to the right: the right flank is at the bottom.
const COORDS: Record<string, [number, number]> = {
  GARDIEN: [6, 32],
  DEFENSEUR_CENTRAL: [22, 32],
  LATERAL_DROIT: [28, 54],
  LATERAL_GAUCHE: [28, 10],
  MILIEU_DEFENSIF: [40, 32],
  MILIEU_CENTRAL: [52, 32],
  MILIEU_OFFENSIF: [65, 32],
  AILIER_DROIT: [76, 54],
  AILIER_GAUCHE: [76, 10],
  AVANT_CENTRE: [86, 32],
};

export function PitchPosition({
  position,
  secondaryPosition,
}: {
  position: string;
  secondaryPosition?: string | null;
}) {
  const main = COORDS[position];
  const second = secondaryPosition ? COORDS[secondaryPosition] : undefined;

  return (
    <figure>
      <svg
        viewBox="0 0 100 64"
        role="img"
        aria-label={`Poste sur le terrain : ${POSITION_LABELS[position] ?? position}`}
        className="w-full rounded-lg bg-[#1f6b3a]"
      >
        <g fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.4">
          <rect x="2" y="2" width="96" height="60" />
          <line x1="50" y1="2" x2="50" y2="62" />
          <circle cx="50" cy="32" r="8" />
          <rect x="2" y="16" width="14" height="32" />
          <rect x="2" y="25" width="5" height="14" />
          <rect x="84" y="16" width="14" height="32" />
          <rect x="93" y="25" width="5" height="14" />
        </g>
        <path d="M 60 32 L 72 32" stroke="rgba(255,255,255,0.35)" strokeWidth="0.6" markerEnd="url(#arrow)" />
        <defs>
          <marker id="arrow" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="4" markerHeight="4" orient="auto">
            <path d="M0,0 L6,3 L0,6 z" fill="rgba(255,255,255,0.35)" />
          </marker>
        </defs>
        {second && (
          <circle cx={second[0]} cy={second[1]} r="3" fill="rgba(255,255,255,0.25)" stroke="#fff" strokeWidth="0.5" strokeDasharray="1 1" />
        )}
        {main && (
          <>
            <circle cx={main[0]} cy={main[1]} r="6" fill="var(--color-accent)" opacity="0.25" />
            <circle cx={main[0]} cy={main[1]} r="3.2" fill="var(--color-accent)" stroke="#fff" strokeWidth="0.6" />
          </>
        )}
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-accent" aria-hidden="true" />
          Poste principal
        </span>
        {second && (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border border-dashed border-muted-foreground" aria-hidden="true" />
            Poste secondaire
          </span>
        )}
        <span>Sens du jeu →</span>
      </figcaption>
    </figure>
  );
}
