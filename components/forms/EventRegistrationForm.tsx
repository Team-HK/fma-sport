"use client";

import { useActionState } from "react";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { submitEventRegistration, type EventRegistrationState } from "@/app/actions/event-registration";

const initialState: EventRegistrationState = { success: false, message: "" };

export function EventRegistrationForm({ eventId }: { eventId: string }) {
  const [state, formAction, isPending] = useActionState(submitEventRegistration, initialState);

  if (state.success) {
    return (
      <p className="rounded-lg bg-primary/10 p-4 text-sm font-medium text-primary">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="eventId" value={eventId} />
      {state.message && !state.success && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
      <div>
        <Label htmlFor="fullName">Nom complet *</Label>
        <Input id="fullName" name="fullName" required />
      </div>
      <div>
        <Label htmlFor="email">Email *</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div>
        <Label htmlFor="phone">Téléphone *</Label>
        <Input id="phone" name="phone" type="tel" required />
      </div>
      <div>
        <Label htmlFor="notes">Message (facultatif)</Label>
        <Textarea id="notes" name="notes" rows={3} />
      </div>
      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Envoi..." : "S'inscrire"}
      </Button>
    </form>
  );
}
