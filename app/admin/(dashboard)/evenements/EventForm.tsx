"use client";

import { useActionState, useEffect, useRef } from "react";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImageField } from "@/components/ui/ImageField";
import { upsertEvent, type EventActionState } from "@/app/actions/admin/events";
import type { Event } from "@prisma/client";

const initialState: EventActionState = { success: false, message: "" };

export function EventForm({ event, onSuccess }: { event?: Event; onSuccess?: () => void }) {
  const action = upsertEvent.bind(null, event?.id ?? null);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const didRun = useRef(false);

  useEffect(() => {
    if (state.success && didRun.current) onSuccess?.();
    didRun.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      {state.message && (
        <p role="alert" className={state.success ? "text-sm text-success" : "text-sm text-destructive"}>
          {state.message}
        </p>
      )}
      <div>
        <Label htmlFor="name">Nom de l&apos;événement *</Label>
        <Input id="name" name="name" defaultValue={event?.name} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            name="date"
            type="datetime-local"
            defaultValue={event?.date ? new Date(event.date).toISOString().slice(0, 16) : ""}
            required
          />
        </div>
        <div>
          <Label htmlFor="location">Lieu *</Label>
          <Input id="location" name="location" defaultValue={event?.location} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Prix</Label>
          <Input id="price" name="price" defaultValue={event?.price ?? ""} />
        </div>
        <div>
          <Label htmlFor="contact">Contact</Label>
          <Input id="contact" name="contact" defaultValue={event?.contact ?? ""} />
        </div>
      </div>
      <div>
        <Label htmlFor="registrationConditions">Conditions d&apos;inscription</Label>
        <Textarea
          id="registrationConditions"
          name="registrationConditions"
          rows={2}
          defaultValue={event?.registrationConditions ?? ""}
        />
      </div>
      <ImageField id="poster" name="poster" label="Affiche" defaultValue={event?.poster} />
      <div>
        <Label htmlFor="results">Résultats</Label>
        <Textarea id="results" name="results" rows={2} defaultValue={event?.results ?? ""} />
      </div>
      <div>
        <Label htmlFor="status">Statut *</Label>
        <select
          id="status"
          name="status"
          defaultValue={event?.status ?? "DRAFT"}
          required
          className="w-full rounded-[10px] border border-border bg-card px-4 py-3 text-base text-foreground"
        >
          <option value="DRAFT">Brouillon</option>
          <option value="PUBLISHED">Publié</option>
          <option value="RESULTS_PUBLISHED">Résultats publiés</option>
        </select>
      </div>
      <div className="flex justify-end border-t border-border pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
