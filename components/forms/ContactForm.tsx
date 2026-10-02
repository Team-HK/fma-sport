"use client";

import { useActionState } from "react";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { submitContact, type ContactActionState } from "@/app/actions/contact";

const initialState: ContactActionState = { success: false, message: "" };

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContact, initialState);

  if (state.success) {
    return (
      <p className="rounded-lg bg-primary/10 p-4 text-sm font-medium text-primary">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {/* Honeypot field, hidden from real users */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

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
        <Label htmlFor="phone">Téléphone</Label>
        <Input id="phone" name="phone" type="tel" />
      </div>
      <div>
        <Label htmlFor="subject">Sujet *</Label>
        <Input id="subject" name="subject" required />
      </div>
      <div>
        <Label htmlFor="type">Type de demande</Label>
        <select
          id="type"
          name="type"
          defaultValue="CONTACT"
          className="w-full rounded-lg border border-border bg-card px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
        >
          <option value="CONTACT">Contact général</option>
          <option value="PARTNERSHIP">Partenariat</option>
          <option value="MEDIA">Média</option>
          <option value="PLAYER">Au sujet d&apos;un joueur</option>
        </select>
      </div>
      <div>
        <Label htmlFor="message">Message *</Label>
        <Textarea id="message" name="message" rows={5} required />
      </div>
      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Envoi..." : "Envoyer le message"}
      </Button>
    </form>
  );
}
