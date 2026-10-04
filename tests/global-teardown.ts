import { PrismaClient } from "@prisma/client";
import { readFileSync, rmSync } from "node:fs";
import { RUN_START_FILE } from "./global-setup";

// The suite runs against the real database: remove only what this run created,
// identified by the tests' own markers and the run start time.
export default async function globalTeardown() {
  let since: Date;
  try {
    since = new Date(readFileSync(RUN_START_FILE, "utf8"));
  } catch {
    return;
  }
  const prisma = new PrismaClient();
  try {
    const createdThisRun = { createdAt: { gte: since } };
    const candidacies = await prisma.candidacy.findMany({
      where: { ...createdThisRun, email: { endsWith: "@example.com" } },
      select: { id: true },
    });
    const candidacyIds = candidacies.map((c) => c.id);
    await prisma.$transaction([
      prisma.player.deleteMany({ where: { candidacyId: { in: candidacyIds } } }),
      prisma.candidacy.deleteMany({ where: { id: { in: candidacyIds } } }),
      prisma.contactMessage.deleteMany({
        where: { ...createdThisRun, email: { endsWith: "@example.com" } },
      }),
      prisma.article.deleteMany({
        where: { ...createdThisRun, title: { startsWith: "Article E2E " } },
      }),
    ]);
  } finally {
    await prisma.$disconnect();
    rmSync(RUN_START_FILE, { force: true });
  }
}
