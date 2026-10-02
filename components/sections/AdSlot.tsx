import type { AdPlacement } from "@prisma/client";
import { getActiveAd } from "@/lib/queries";

export async function AdSlot({
  placement,
  className,
}: {
  placement: AdPlacement;
  className?: string;
}) {
  const ad = await getActiveAd(placement).catch(() => null);
  if (!ad) return null;

  const content = (
    <div className="relative overflow-hidden rounded-xl border border-border bg-muted">
      <span className="absolute left-2 top-2 z-10 rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        Publicité
      </span>
      {ad.format === "VIDEO" ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          src={ad.mediaUrl}
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="aspect-[5/1] w-full sm:aspect-[6/1]">
          {/* Admin-provided external URL: arbitrary host, next/image remotePatterns can't cover it. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ad.mediaUrl}
            alt={ad.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );

  return (
    <div className={className ?? "mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"}>
      {ad.linkUrl ? (
        <a
          href={ad.linkUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          aria-label={ad.title}
          className="block cursor-pointer transition-opacity hover:opacity-90"
        >
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
}
