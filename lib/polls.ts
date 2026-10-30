import { prisma } from "@/lib/prisma";
import { cachedQuery } from "@/lib/cache";

export { isPollOpen } from "@/lib/poll-rules";

const questionInclude = {
  questions: {
    orderBy: { order: "asc" as const },
    include: { options: { orderBy: { order: "asc" as const } } },
  },
};

/**
 * The poll tables are created by a one-off SQL step (see prisma/sql). Until that has run,
 * Prisma answers P2021/P2022 ("table/column does not exist"): treat that as "no polls"
 * instead of failing every page, and let the cache remember it for a few minutes so the
 * header and footer don't retry a failing query on each request.
 */
function isMissingPollSchema(error: unknown) {
  const code = (error as { code?: string } | null)?.code;
  return code === "P2021" || code === "P2022";
}

/** Polls shown on the public site (not drafts, not trashed). */
export const getPublicPolls = cachedQuery("getPublicPolls", async () => {
  try {
    return await prisma.poll.findMany({
      where: { status: { in: ["OPEN", "CLOSED"] }, deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: { questions: { select: { id: true } } },
    });
  } catch (error) {
    if (isMissingPollSchema(error)) return [];
    throw error;
  }
});

export const getPublicPollBySlug = cachedQuery("getPublicPollBySlug", async (slug: string) => {
  try {
    const poll = await prisma.poll.findUnique({ where: { slug }, include: questionInclude });
    if (!poll || poll.deletedAt || poll.status === "DRAFT") return null;
    return poll;
  } catch (error) {
    if (isMissingPollSchema(error)) return null;
    throw error;
  }
});

export type PollWithQuestions = NonNullable<Awaited<ReturnType<typeof getPublicPollBySlug>>>;

export type OptionResult = {
  optionId: string;
  name: string;
  club: string | null;
  photo: string | null;
  /** Voters who picked this candidate at any rank. */
  voters: number;
  /** Voters who ranked this candidate first. */
  firstPlaces: number;
  /** Borda points: first of N = N points, last = 1 (1 per pick when unranked). */
  points: number;
  /** Share of the question's total points, 0–100. */
  share: number;
};

export type QuestionResult = {
  questionId: string;
  title: string;
  picks: number;
  ranked: boolean;
  /** Ballots that answered this question. */
  respondents: number;
  options: OptionResult[];
};

export type PollResults = { totalBallots: number; questions: QuestionResult[] };

/** Live standings (not cached: a voter should see their own vote counted). */
export async function getPollResults(pollId: string): Promise<PollResults> {
  const [questions, grouped, totalBallots] = await Promise.all([
    prisma.pollQuestion.findMany({
      where: { pollId },
      orderBy: { order: "asc" },
      include: { options: { orderBy: { order: "asc" } } },
    }),
    prisma.pollVote.groupBy({
      by: ["questionId", "optionId", "rank"],
      where: { question: { pollId } },
      _count: { _all: true },
    }),
    prisma.pollBallot.count({ where: { pollId } }),
  ]);

  const results: QuestionResult[] = questions.map((q) => {
    const rows = grouped.filter((g) => g.questionId === q.id);
    const options: OptionResult[] = q.options.map((o) => {
      const own = rows.filter((r) => r.optionId === o.id);
      const voters = own.reduce((sum, r) => sum + r._count._all, 0);
      const firstPlaces = own.filter((r) => r.rank === 1).reduce((sum, r) => sum + r._count._all, 0);
      const points = own.reduce(
        (sum, r) => sum + r._count._all * (q.ranked ? Math.max(1, q.picks - r.rank + 1) : 1),
        0
      );
      return { optionId: o.id, name: o.name, club: o.club, photo: o.photo, voters, firstPlaces, points, share: 0 };
    });
    const totalPoints = options.reduce((sum, o) => sum + o.points, 0);
    for (const o of options) o.share = totalPoints > 0 ? Math.round((o.points / totalPoints) * 1000) / 10 : 0;
    options.sort((a, b) => b.points - a.points || b.firstPlaces - a.firstPlaces || a.name.localeCompare(b.name));

    // Respondents = distinct ballots on this question = total votes / picks (every answer has `picks` rows).
    const totalRows = rows.reduce((sum, r) => sum + r._count._all, 0);
    return {
      questionId: q.id,
      title: q.title,
      picks: q.picks,
      ranked: q.ranked,
      respondents: q.picks > 0 ? Math.round(totalRows / q.picks) : 0,
      options,
    };
  });

  return { totalBallots, questions: results };
}

export type PollSecuritySummary = {
  /** Connections (hashed IPs) that cast several ballots. */
  repeatNetworks: number;
  /** Largest number of ballots coming from a single connection. */
  maxFromOneNetwork: number;
};

/** Signals ballot stuffing to the admin: many ballots from the same connection. */
export async function getPollSecuritySummary(pollId: string): Promise<PollSecuritySummary> {
  const groups = await prisma.pollBallot.groupBy({
    by: ["ipHash"],
    where: { pollId, ipHash: { not: null } },
    _count: { _all: true },
  });
  const repeat = groups.filter((g) => g._count._all >= 5);
  return {
    repeatNetworks: repeat.length,
    maxFromOneNetwork: groups.reduce((max, g) => Math.max(max, g._count._all), 0),
  };
}
