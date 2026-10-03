import { prisma } from "@/lib/prisma";
import { ArticleForm } from "../ArticleForm";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const writers = await prisma.teamMember.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, role: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">Nouvel article</h1>
      <div className="mt-6">
        <ArticleForm writers={writers} />
      </div>
    </div>
  );
}
