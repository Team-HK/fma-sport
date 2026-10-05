import { ExternalLink } from "lucide-react";
import { getNewsWire, type NewsRegion } from "@/lib/news-feeds";

function timeAgo(date: Date) {
  const minutes = Math.round((Date.now() - date.getTime()) / 60_000);
  if (minutes < 60) return `il y a ${Math.max(1, minutes)} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  return `il y a ${days} j`;
}

export async function NewsWire({
  regions,
  title = "Le fil de l'actu",
  limit = 10,
  className = "",
}: {
  regions: NewsRegion[];
  title?: string;
  limit?: number;
  className?: string;
}) {
  const items = await getNewsWire(regions, limit);
  if (items.length === 0) return null;

  return (
    <section aria-labelledby={`wire-${regions.join("-")}`} className={className}>
      <h2
        id={`wire-${regions.join("-")}`}
        className="flex items-center gap-2 border-l-4 border-accent pl-3 font-heading text-base font-bold uppercase tracking-wide text-foreground"
      >
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
        {title}
      </h2>
      <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
        {items.map((item) => (
          <li key={item.url}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="group flex gap-3 px-4 py-3 transition-colors hover:bg-muted"
            >
              <span className="w-16 shrink-0 pt-0.5 text-xs tabular-nums text-muted-foreground">
                {timeAgo(item.publishedAt)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium leading-snug text-foreground group-hover:text-accent">
                  {item.title}
                </span>
                <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {item.source}
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Titres issus des flux RSS publics des médias cités ; les articles s&apos;ouvrent sur leur site d&apos;origine.
      </p>
    </section>
  );
}
