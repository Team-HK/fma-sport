import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPollResults } from "@/lib/polls";

/** Public standings of a poll, only when the admin allows voters to see them. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const poll = await prisma.poll.findUnique({
    where: { id },
    select: { showResults: true, status: true, deletedAt: true },
  });
  if (!poll || poll.deletedAt || poll.status === "DRAFT" || !poll.showResults) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const results = await getPollResults(id);
  return NextResponse.json(results, { headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30" } });
}
