const RADIUS = 60;
const STROKE = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function DonutChart({
  data,
  title,
}: {
  data: { label: string; value: number; color: string }[];
  title: string;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <svg
        viewBox="0 0 160 160"
        className="h-40 w-40 shrink-0 -rotate-90"
        role="img"
        aria-label={title}
      >
        <circle cx="80" cy="80" r={RADIUS} fill="none" stroke="var(--color-muted)" strokeWidth={STROKE} />
        {total === 0
          ? null
          : data.map((d) => {
              const fraction = d.value / total;
              const dash = fraction * CIRCUMFERENCE;
              const circle = (
                <circle
                  key={d.label}
                  cx="80"
                  cy="80"
                  r={RADIUS}
                  fill="none"
                  stroke={d.color}
                  strokeWidth={STROKE}
                  strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                  strokeDashoffset={-offset}
                  strokeLinecap={data.length > 1 ? "butt" : "round"}
                />
              );
              offset += dash;
              return circle;
            })}
        <circle cx="80" cy="80" r={RADIUS - STROKE / 2 - 4} fill="var(--color-card)" />
      </svg>

      <div className="min-w-0 flex-1">
        <p className="font-heading text-sm font-semibold text-foreground">{title}</p>
        <ul className="mt-2 space-y-1.5">
          {data.map((d) => (
            <li key={d.label} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: d.color }}
                  aria-hidden="true"
                />
                <span className="truncate">{d.label}</span>
              </span>
              <span className="shrink-0 font-semibold text-foreground">{d.value}</span>
            </li>
          ))}
          {total === 0 && <li className="text-sm text-muted-foreground">Aucune donnée.</li>}
        </ul>
      </div>
    </div>
  );
}
