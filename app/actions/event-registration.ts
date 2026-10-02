"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  eventId: z.string().min(1),
  fullName: z.string().min(1, "Le nom complet est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(6, "Le téléphone est requis"),
  notes: z.string().optional(),
});

export type EventRegistrationState = { success: boolean; message: string };

export async function submitEventRegistration(
  _prevState: EventRegistrationState,
  formData: FormData
): Promise<EventRegistrationState> {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { success: false, message: "Merci de renseigner tous les champs obligatoires." };
  }

  try {
    await prisma.eventRegistration.create({
      data: {
        eventId: parsed.data.eventId,
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        notes: parsed.data.notes || null,
      },
    });
    return { success: true, message: "Votre inscription a bien été enregistrée." };
  } catch (error) {
    console.error("Failed to register for event:", error);
    return { success: false, message: "Une erreur est survenue. Merci de réessayer." };
  }
}
