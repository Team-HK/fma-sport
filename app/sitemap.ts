import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/constants";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

const BASE_URL = SITE_URL;

type SitemapRow = { slug: string; updatedAt: Date; image?: string | null; images?: string[] };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, players, events] = await Promise.all([
    prisma.article.findMany({
      where: {
        deletedAt: null,
        OR: [
          { status: "PUBLISHED" },
          { status: "SCHEDULED", publishedAt: { lte: new Date() } },
        ],
      },
      select: { slug: true, updatedAt: true, coverImage: true },
    }),
    prisma.player.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      select: { slug: true, updatedAt: true, photo: true },
    }),
    prisma.event.findMany({
      where: { deletedAt: null },
      select: { slug: true, updatedAt: true, poster: true, photos: true },
    }),
  ]).catch((error) => {
    // Never fail the build because the database is briefly unreachable; the
    // sitemap is regenerated hourly anyway.
    console.error("sitemap: database unavailable, serving static routes only", error);
    return [[], [], []] as [never[], never[], never[]];
  });

  const staticRoutes = [
    "",
    "/actualites",
    "/football-africain",
    "/football-international",
    "/videos",
    "/talents",
    "/management",
    "/equipe",
    "/devenir-joueur",
    "/evenements",
    "/publicite",
    "/contact",
    "/mentions-legales",
    "/politique-de-confidentialite",
    "/conditions-utilisation",
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
  }));

  const articleRoutes = articles.map((a) => ({
    url: `${BASE_URL}/actualites/${a.slug}`,
    lastModified: a.updatedAt,
    images: a.coverImage ? [absoluteUrl(a.coverImage)] : undefined,
  }));

  const playerRoutes = players.map((p) => ({
    url: `${BASE_URL}/joueurs/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
    images: p.photo ? [absoluteUrl(p.photo)] : undefined,
  }));

  const eventRoutes = events.map((e) => ({
    url: `${BASE_URL}/evenements/${e.slug}`,
    lastModified: e.updatedAt,
    images: [e.poster, ...e.photos].filter((u): u is string => Boolean(u)).map(absoluteUrl),
  }));

  return [...staticRoutes, ...articleRoutes, ...playerRoutes, ...eventRoutes];
}
