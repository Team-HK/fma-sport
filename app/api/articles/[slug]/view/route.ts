import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    await prisma.article.updateMany({
      where: { slug, deletedAt: null },
      data: { views: { increment: 1 } },
    });
  } catch (error) {
    console.error("Failed to count article view:", error);
  }
  return new NextResponse(null, { status: 204 });
}
