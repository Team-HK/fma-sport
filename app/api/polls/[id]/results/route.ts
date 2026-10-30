import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPollResults } from "@/lib/polls";
import { canSeeResults, isPollOpen } from "@/lib/poll-rules";

/** Public standings of a poll, only when the admin allows voters to see them. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const poll = await prisma.poll.findUnique({
    where: { id },
    select: { resultsVisibility: true, status: true, startsAt: true, endsAt: true, deletedAt: true },
  });
  if (!poll || poll.deletedAt || poll.status === "DRAFT") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const voted = Boolean((await cookies()).get(`poll_voted_${id}`));
  if (!canSeeResults(poll.resultsVisibility, { open: isPollOpen(poll), voted })) {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }
  const results = await getPollResults(id);
  return NextResponse.json(results, { headers: { "Cache-Control": "private, no-store" } });
}
