import Image from "next/image";
import type { Video } from "@prisma/client";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { VIDEO_CATEGORY_LABELS, VIDEO_PLATFORM_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Play, Clapperboard, ExternalLink } from "lucide-react";

export function VideoCard({ video }: { video: Video }) {
  const isSiteHosted = video.platform === "SITE";

  return (
    <Card className="group flex h-full flex-col overflow-hidden p-0">
      <div className="relative aspect-video overflow-hidden bg-muted">
        {isSiteHosted ? (
          video.thumbnail ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              src={video.url}
              poster={video.thumbnail}
              controls
              preload="metadata"
              className="h-full w-full object-cover"
            />
          ) : (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video src={video.url} controls preload="metadata" className="h-full w-full bg-foreground object-contain" />
          )
        ) : (
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Voir la vidéo « ${video.title} » (ouvre un nouvel onglet)`}
            className="block h-full w-full"
          >
            {video.thumbnail ? (
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <Clapperboard className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
              <Play className="h-12 w-12 text-white" fill="white" aria-hidden="true" />
            </div>
            <span
              aria-hidden="true"
              className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-foreground/80 px-2.5 py-1 text-xs font-medium text-white"
            >
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
              {VIDEO_PLATFORM_LABELS[video.platform] ?? video.platform}
            </span>
          </a>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <Badge className="w-fit bg-accent text-on-accent">
          {VIDEO_CATEGORY_LABELS[video.category] ?? video.category}
        </Badge>
        <h3 className="mt-2 line-clamp-2 font-heading text-base font-semibold text-foreground">
          {video.title}
        </h3>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted-foreground">{video.description}</p>
        {video.publishedAt && (
          <p className="mt-3 text-xs text-muted-foreground/80">{formatDate(video.publishedAt)}</p>
        )}
      </div>
    </Card>
  );
}
