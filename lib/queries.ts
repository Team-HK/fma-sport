import { prisma } from "@/lib/prisma";
import type { ArticleCategory, AdPlacement } from "@prisma/client";

// An article counts as publicly visible once it's PUBLISHED, or once a
// SCHEDULED article's publishedAt date has passed — there is no cron job to
// flip the status automatically, so the public read path is the gate.
const publiclyVisibleArticle = {
  deletedAt: null,
  OR: [
    { status: "PUBLISHED" as const },
    { status: "SCHEDULED" as const, publishedAt: { lte: new Date() } },
  ],
};

export function getPublishedArticles(options?: {
  category?: ArticleCategory;
  country?: string;
  competition?: string;
  take?: number;
}) {
  return prisma.article.findMany({
    where: {
      ...publiclyVisibleArticle,
      ...(options?.category ? { category: options.category } : {}),
      ...(options?.country ? { country: options.country } : {}),
      ...(options?.competition ? { competition: options.competition } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: options?.take,
  });
}

export async function getArticleBySlug(slug: string) {
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article || article.deletedAt) return null;
  const isVisible =
    article.status === "PUBLISHED" ||
    (article.status === "SCHEDULED" && article.publishedAt !== null && article.publishedAt <= new Date());
  return isVisible ? article : null;
}

export function getRelatedArticles(category: ArticleCategory, excludeSlug: string) {
  return prisma.article.findMany({
    where: { status: "PUBLISHED", deletedAt: null, category, slug: { not: excludeSlug } },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });
}

export function getPublishedVideos(options?: { category?: string; take?: number }) {
  return prisma.video.findMany({
    where: {
      status: "PUBLISHED",
      deletedAt: null,
      ...(options?.category ? { category: options.category as never } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: options?.take,
  });
}

export function getPublishedPlayers(take?: number) {
  return prisma.player.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getPlayerBySlug(slug: string) {
  const player = await prisma.player.findUnique({
    where: { slug },
    include: { stats: true, videos: { where: { status: "PUBLISHED", deletedAt: null } } },
  });
  return player?.deletedAt ? null : player;
}

export function getPublishedEvents(take?: number) {
  return prisma.event.findMany({
    where: { status: { in: ["PUBLISHED", "RESULTS_PUBLISHED"] }, deletedAt: null },
    orderBy: { date: "asc" },
    take,
  });
}

export async function getEventBySlug(slug: string) {
  const event = await prisma.event.findUnique({ where: { slug } });
  return event?.deletedAt ? null : event;
}

export async function getActiveAd(placement: AdPlacement) {
  const now = new Date();
  return prisma.advertisement.findFirst({
    where: {
      placement,
      active: true,
      deletedAt: null,
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null }, { endDate: { gte: now } }] },
      ],
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function searchSite(query: string) {
  const [articles, players, videos] = await Promise.all([
    prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { excerpt: { contains: query, mode: "insensitive" } },
          { country: { contains: query, mode: "insensitive" } },
          { competition: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 8,
    }),
    prisma.player.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { club: { contains: query, mode: "insensitive" } },
          { nationality: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 8,
    }),
    prisma.video.findMany({
      where: { status: "PUBLISHED", deletedAt: null, title: { contains: query, mode: "insensitive" } },
      take: 8,
    }),
  ]);
  return { articles, players, videos };
}
