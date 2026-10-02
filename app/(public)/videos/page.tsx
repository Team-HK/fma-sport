import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { FilterTabs } from "@/components/sections/FilterTabs";
import { VideoCard } from "@/components/sections/VideoCard";
import { getPublishedVideos } from "@/lib/queries";
import { VIDEO_CATEGORY_LABELS } from "@/lib/constants";
import { AdSlot } from "@/components/sections/AdSlot";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Vidéos",
  description: "Interviews, micro-trottoirs, reportages et highlights de FMA.SPORT.",
};

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ categorie?: string }>;
}) {
  const { categorie } = await searchParams;
  const category = categorie && categorie in VIDEO_CATEGORY_LABELS ? categorie : undefined;
  const videos = await getPublishedVideos({ category });

  return (
    <>
      <PageHeader
        title="Vidéos"
        description="Interviews, micro-trottoirs, reportages, débats, highlights et shorts."
      />

      <AdSlot placement="VIDEOS" className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <FilterTabs
          basePath="/videos"
          paramName="categorie"
          active={categorie}
          options={Object.entries(VIDEO_CATEGORY_LABELS).map(([value, label]) => ({
            value,
            label,
          }))}
        />

        {videos.length === 0 ? (
          <p className="mt-12 text-center text-muted-foreground">
            Aucune vidéo dans cette catégorie pour le moment.
          </p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
