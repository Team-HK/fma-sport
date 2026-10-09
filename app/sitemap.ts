import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 3600;

const BASE_URL = SITE_URL;

type SitemapRow = { slug: string; updatedAt: Date };

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
      select: { slug: true, updatedAt: true },
    }),
    prisma.player.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      select: { slug: true, updatedAt: true },
    }),
    prisma.event.findMany({ where: { deletedAt: null }, select: { slug: true, updatedAt: true } }),
  ]).catch((error) => {
    // Never fail the build because the database is briefly unreachable; the
    // sitemap is regenerated hourly anyway.
    console.error("sitemap: database unavailable, serving static routes only", error);
    return [[], [], []] as [SitemapRow[], SitemapRow[], SitemapRow[]];
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
  }));

  const playerRoutes = players.map((p) => ({
    url: `${BASE_URL}/joueurs/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const eventRoutes = events.map((e) => ({
    url: `${BASE_URL}/evenements/${e.slug}`,
    lastModified: e.updatedAt,
  }));

  return [...staticRoutes, ...articleRoutes, ...playerRoutes, ...eventRoutes];
}
