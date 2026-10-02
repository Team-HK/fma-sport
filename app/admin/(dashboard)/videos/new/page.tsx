import { VideoForm } from "../VideoForm";

export default function NewVideoPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">Nouvelle vidéo</h1>
      <div className="mt-6">
        <VideoForm />
      </div>
    </div>
  );
}
