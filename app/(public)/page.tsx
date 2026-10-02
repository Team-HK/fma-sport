import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArticleCard } from "@/components/sections/ArticleCard";
import { PlayerCard } from "@/components/sections/PlayerCard";
import { VideoCard } from "@/components/sections/VideoCard";
import { HeroCarousel } from "@/components/sections/HeroCarousel";
import {
  getPublishedArticles,
  getPublishedPlayers,
  getPublishedVideos,
  getActiveHeroSlides,
} from "@/lib/queries";
import { ARTICLE_CATEGORY_LABELS } from "@/lib/constants";
import { HERO_IMAGES } from "@/lib/stock-images";
import { AdSlot } from "@/components/sections/AdSlot";

export const revalidate = 300;

const DEFAULT_HERO_SLIDES = HERO_IMAGES.map((imageUrl) => ({ imageUrl }));

export default async function HomePage() {
  const [articles, players, videos, heroSlides] = await Promise.all([
    getPublishedArticles({ take: 5 }).catch(() => []),
    getPublishedPlayers(4).catch(() => []),
    getPublishedVideos({ take: 3 }).catch(() => []),
    getActiveHeroSlides().catch(() => []),
  ]);

  const [featured, ...secondary] = articles;
  const slides = heroSlides.length > 0 ? heroSlides : DEFAULT_HERO_SLIDES;

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[560px] items-center overflow-hidden text-white sm:min-h-[640px]">
        <HeroCarousel slides={slides} />
      </section>

      {/* A la Une */}
      {featured && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              À la une
            </h2>
            <Link href="/actualites" className="text-sm font-semibold text-primary hover:underline">
              Toutes les actualités →
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ArticleCard article={featured} priority />
            </div>
            <div className="flex flex-col gap-4">
              {secondary.slice(0, 3).map((article) => (
                <Link
                  key={article.id}
                  href={`/actualites/${article.slug}`}
                  className="group flex gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
                >
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md bg-muted">
                    {article.coverImage && (
                      <Image
                        src={article.coverImage}
                        alt={article.title}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-primary">
                      {ARTICLE_CATEGORY_LABELS[article.category] ?? article.category}
                    </p>
                    <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary">
                      {article.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <AdSlot placement="HOME" />

      {/* Talents */}
      {players.length > 0 && (
        <section className="bg-card py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                Nos talents
              </h2>
              <Link href="/talents" className="text-sm font-semibold text-primary hover:underline">
                Tous les talents →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {players.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Videos */}
      {videos.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">Vidéos</h2>
            <Link href="/videos" className="text-sm font-semibold text-primary hover:underline">
              Toutes les vidéos →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>
      )}

      {/* CTA Management */}
      <section className="bg-primary py-16 text-on-primary">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="font-heading text-2xl font-medium sm:text-3xl">
            Détection, accompagnement, visibilité
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-white/90">
            FMA SPORT Management accompagne les jeunes talents du football dans leur parcours
            sportif et professionnel.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              href="/management"
              size="lg"
              variant="ghost"
              className="border-2 border-white text-white hover:bg-white/15"
            >
              Découvrir le management
            </Button>
            <Button href="/devenir-joueur" size="lg" variant="accent">
              Devenir joueur FMA SPORT
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
