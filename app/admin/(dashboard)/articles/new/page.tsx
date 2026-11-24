import { prisma } from "@/lib/prisma";
import { ArticleForm } from "../ArticleForm";
import { getArticleCategories } from "@/lib/article-categories";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const categories = await getArticleCategories();
  const writers = await prisma.teamMember.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, role: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">Nouvel article</h1>
      <div className="mt-6">
        <ArticleForm writers={writers} categories={categories} />
      </div>
    </div>
  );
}
