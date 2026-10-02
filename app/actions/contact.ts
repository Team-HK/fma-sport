"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  fullName: z.string().min(1, "Le nom complet est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Le sujet est requis"),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
  type: z.enum(["CONTACT", "PARTNERSHIP", "MEDIA", "PLAYER"]).default("CONTACT"),
  // honeypot
  website: z.string().max(0).optional(),
});

export type ContactActionState = { success: boolean; message: string };

export async function submitContact(
  _prevState: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return {
      success: false,
      message: "Merci de vérifier les champs obligatoires du formulaire.",
    };
  }

  // Honeypot triggered: silently pretend success without writing to DB.
  if (parsed.data.website) {
    return { success: true, message: "Votre message a bien été envoyé." };
  }

  try {
    await prisma.contactMessage.create({
      data: {
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        subject: parsed.data.subject,
        message: parsed.data.message,
        type: parsed.data.type,
      },
    });
    return { success: true, message: "Votre message a bien été envoyé. Merci de nous avoir contactés." };
  } catch (error) {
    console.error("Failed to create contact message:", error);
    return { success: false, message: "Une erreur est survenue. Merci de réessayer." };
  }
}
