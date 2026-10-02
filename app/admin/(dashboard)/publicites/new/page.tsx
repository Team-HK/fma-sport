import { AdForm } from "../AdForm";

export default function NewAdPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">Nouvelle publicité</h1>
      <div className="mt-6">
        <AdForm />
      </div>
    </div>
  );
}
