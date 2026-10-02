import { PlayerForm } from "../PlayerForm";

export default function NewPlayerPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">Nouveau profil joueur</h1>
      <div className="mt-6">
        <PlayerForm />
      </div>
    </div>
  );
}
