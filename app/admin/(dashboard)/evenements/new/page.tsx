import { EventForm } from "../EventForm";

export default function NewEventPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">Nouvel événement</h1>
      <div className="mt-6">
        <EventForm />
      </div>
    </div>
  );
}
