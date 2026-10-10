import { prisma } from "@/lib/prisma";

/** Players the admin can attach a video to (active profiles only). */
export async function getPlayerOptions() {
  const players = await prisma.player.findMany({
    where: { deletedAt: null },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    select: { id: true, firstName: true, lastName: true },
  });
  return players.map((p) => ({ id: p.id, name: `${p.firstName} ${p.lastName}` }));
}
