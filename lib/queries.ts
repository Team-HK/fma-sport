import { prisma } from "@/lib/prisma";
import { cachedQuery } from "@/lib/cache";
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

export const getPublishedArticles = cachedQuery("getPublishedArticles", async (options?: ArticleFilters & { take?: number; skip?: number }) => {
  return prisma.article.findMany({
    where: articleWhere(options),
    orderBy: { publishedAt: "desc" },
    take: options?.take,
    skip: options?.skip,
  });
});

export const getPublishedArticleCount = cachedQuery("getPublishedArticleCount", async (options?: ArticleFilters) => {
  return prisma.article.count({ where: articleWhere(options) });
});

export const getMostReadArticles = cachedQuery("getMostReadArticles", async (options?: ArticleFilters & { take?: number }) => {
  return prisma.article.findMany({
    where: articleWhere(options),
    orderBy: { views: "desc" },
    take: options?.take ?? 5,
  });
});

export const getArticleBySlug = cachedQuery("getArticleBySlug", async (slug: string) => {
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
});

export const getRelatedArticles = cachedQuery("getRelatedArticles", async (category: ArticleCategory, excludeSlug: string) => {
  return prisma.article.findMany({
    where: { status: "PUBLISHED", deletedAt: null, category, slug: { not: excludeSlug } },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });
});

export const getPublishedVideos = cachedQuery("getPublishedVideos", async (options?: { category?: string; take?: number }) => {
  return prisma.video.findMany({
    where: {
      status: "PUBLISHED",
      deletedAt: null,
      ...(options?.category ? { category: options.category as never } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: options?.take,
  });
});

export const getPublishedPlayers = cachedQuery("getPublishedPlayers", async (take?: number) => {
  return prisma.player.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    orderBy: { createdAt: "desc" },
    take,
  });
});

export const getPlayerBySlug = cachedQuery("getPlayerBySlug", async (slug: string) => {
  const player = await prisma.player.findUnique({
    where: { slug },
    include: { stats: true, videos: { where: { status: "PUBLISHED", deletedAt: null } } },
  });
  return player?.deletedAt ? null : player;
});

export function getSimilarPlayers(player: { id: string; position: string; nationality: string }, take = 4) {
  return findSimilarPlayers(player.id, player.position, player.nationality, take);
}

const findSimilarPlayers = cachedQuery("findSimilarPlayers", async (id: string, position: string, nationality: string, take: number) => {
  return prisma.player.findMany({
    where: {
      status: "PUBLISHED",
      deletedAt: null,
      id: { not: id },
      OR: [{ position: position as never }, { nationality }],
    },
    orderBy: { updatedAt: "desc" },
    take,
  });
});

export const getPublishedEvents = cachedQuery("getPublishedEvents", async (take?: number) => {
  return prisma.event.findMany({
    where: { status: { in: ["PUBLISHED", "RESULTS_PUBLISHED"] }, deletedAt: null },
    orderBy: { date: "asc" },
    take,
  });
});

export const getEventBySlug = cachedQuery("getEventBySlug", async (slug: string) => {
  const event = await prisma.event.findUnique({ where: { slug } });
  return event?.deletedAt ? null : event;
});

export const getActiveAd = cachedQuery("getActiveAd", async (placement: AdPlacement) => {
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
}, 60);

export const getSiteSettings = cachedQuery("getSiteSettings", async () => {
  return prisma.siteSettings.findUnique({ where: { id: "singleton" } });
});

export const getActiveHeroSlides = cachedQuery("getActiveHeroSlides", async () => {
  return prisma.heroSlide.findMany({
    where: { active: true, deletedAt: null },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
});

export const getVisibleTeamMember = cachedQuery("getVisibleTeamMember", async (id: string) => {
  return prisma.teamMember.findFirst({ where: { id, visible: true, deletedAt: null } });
});

export const getVisibleTeamMembers = cachedQuery("getVisibleTeamMembers", async (take?: number) => {
  return prisma.teamMember.findMany({
    where: { visible: true, deletedAt: null },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    take,
  });
});

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
        // Every word must match somewhere, so a full name ("Cheikh Fall") finds the player.
        AND: query
          .split(/\s+/)
          .filter(Boolean)
          .map((word) => ({
            OR: [
              { firstName: { contains: word, mode: "insensitive" as const } },
              { lastName: { contains: word, mode: "insensitive" as const } },
              { club: { contains: word, mode: "insensitive" as const } },
              { nationality: { contains: word, mode: "insensitive" as const } },
            ],
          })),
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
