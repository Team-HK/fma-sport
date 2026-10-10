import { VideoForm } from "../VideoForm";
import { getPlayerOptions } from "../player-options";

export const dynamic = "force-dynamic";

export default async function NewVideoPage() {
  const players = await getPlayerOptions();
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">Nouvelle vidéo</h1>
      <div className="mt-6">
        <VideoForm players={players} />
      </div>
    </div>
  );
}
