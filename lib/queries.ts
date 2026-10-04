import { prisma } from "@/lib/prisma";
import type { ArticleCategory, AdPlacement } from "@prisma/client";

// An article counts as publicly visible once it's PUBLISHED, or once a
// SCHEDULED article's publishedAt date has passed — there is no cron job to
// flip the status automatically, so the public read path is the gate.
function publiclyVisibleArticle() {
  return {
    deletedAt: null,
    OR: [
      { status: "PUBLISHED" as const },
      { status: "SCHEDULED" as const, publishedAt: { lte: new Date() } },
    ],
  };
}

type ArticleFilters = {
  category?: ArticleCategory;
  country?: string;
  competition?: string;
};

function articleWhere(options?: ArticleFilters) {
  return {
    ...publiclyVisibleArticle(),
    ...(options?.category ? { category: options.category } : {}),
    ...(options?.country ? { country: options.country } : {}),
    ...(options?.competition ? { competition: options.competition } : {}),
  };
}

export function getPublishedArticles(options?: ArticleFilters & { take?: number; skip?: number }) {
  return prisma.article.findMany({
    where: articleWhere(options),
    orderBy: { publishedAt: "desc" },
    take: options?.take,
    skip: options?.skip,
  });
}

export function getPublishedArticleCount(options?: ArticleFilters) {
  return prisma.article.count({ where: articleWhere(options) });
}

export function getMostReadArticles(options?: ArticleFilters & { take?: number }) {
  return prisma.article.findMany({
    where: articleWhere(options),
    orderBy: { views: "desc" },
    take: options?.take ?? 5,
  });
}

export async function getArticleBySlug(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      writer: {
        select: { id: true, name: true, role: true, photo: true, visible: true, deletedAt: true },
      },
    },
  });
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

export function getSimilarPlayers(player: { id: string; position: string; nationality: string }, take = 4) {
  return prisma.player.findMany({
    where: {
      status: "PUBLISHED",
      deletedAt: null,
      id: { not: player.id },
      OR: [{ position: player.position as never }, { nationality: player.nationality }],
    },
    orderBy: { updatedAt: "desc" },
    take,
  });
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

export function getSiteSettings() {
  return prisma.siteSettings.findUnique({ where: { id: "singleton" } });
}

export function getActiveHeroSlides() {
  return prisma.heroSlide.findMany({
    where: { active: true, deletedAt: null },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
}

export function getVisibleTeamMember(id: string) {
  return prisma.teamMember.findFirst({ where: { id, visible: true, deletedAt: null } });
}

export function getVisibleTeamMembers(take?: number) {
  return prisma.teamMember.findMany({
    where: { visible: true, deletedAt: null },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    take,
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
