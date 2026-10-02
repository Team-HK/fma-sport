import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { ArticleCard } from "@/components/sections/ArticleCard";
import { PlayerCard } from "@/components/sections/PlayerCard";
import { VideoCard } from "@/components/sections/VideoCard";
import { searchSite } from "@/lib/queries";

export const metadata: Metadata = { title: "Recherche" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? await searchSite(query) : { articles: [], players: [], videos: [] };
  const hasResults =
    results.articles.length > 0 || results.players.length > 0 || results.videos.length > 0;

  return (
    <>
      <PageHeader
        title="Recherche"
        description={query ? `Résultats pour « ${query} »` : "Rechercher un joueur, une actualité, une vidéo..."}
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {!query && (
          <p className="text-center text-muted-foreground">
            Utilisez la barre de recherche en haut de la page pour trouver du contenu.
          </p>
        )}

        {query && !hasResults && (
          <p className="text-center text-muted-foreground">
            Aucun résultat pour « {query} ».
          </p>
        )}

        {results.articles.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 font-heading text-xl font-bold text-foreground">Actualités</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.articles.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </section>
        )}

        {results.players.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 font-heading text-xl font-bold text-foreground">Joueurs</h2>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {results.players.map((p) => (
                <PlayerCard key={p.id} player={p} />
              ))}
            </div>
          </section>
        )}

        {results.videos.length > 0 && (
          <section>
            <h2 className="mb-4 font-heading text-xl font-bold text-foreground">Vidéos</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.videos.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
