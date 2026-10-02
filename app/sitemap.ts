import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://fmasport.com";

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
  ]);

  const staticRoutes = [
    "",
    "/actualites",
    "/football-africain",
    "/football-international",
    "/videos",
    "/talents",
    "/management",
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
  }));

  const eventRoutes = events.map((e) => ({
    url: `${BASE_URL}/evenements/${e.slug}`,
    lastModified: e.updatedAt,
  }));

  return [...staticRoutes, ...articleRoutes, ...playerRoutes, ...eventRoutes];
}
