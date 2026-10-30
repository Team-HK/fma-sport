import { PollForm } from "../PollForm";

export default function NewPollPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">Nouveau sondage</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Créez les questions et leurs candidats, puis passez le statut à « Ouvert aux votes » pour publier.
      </p>
      <div className="mt-6">
        <PollForm />
      </div>
    </div>
  );
}
