"use server";

import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { candidacySchema } from "@/lib/validations/candidacy";

export type CandidacyActionState = {
  success: boolean;
  message: string;
};

async function uploadIfPresent(file: File | null): Promise<string | undefined> {
  if (!file || file.size === 0) return undefined;
  try {
    const blob = await put(`candidacies/${Date.now()}-${file.name}`, file, {
      access: "public",
    });
    return blob.url;
  } catch (error) {
    console.error("Blob upload failed, continuing without file:", error);
    return undefined;
  }
}

export async function submitCandidacy(
  _prevState: CandidacyActionState,
  formData: FormData
): Promise<CandidacyActionState> {
  const raw = Object.fromEntries(formData.entries());

  // Empty optional text/number inputs still submit as "" (unlike file
  // inputs, which are simply absent) — treat them as not provided so
  // z.coerce.number().optional() etc. don't choke on an empty string.
  const cleaned = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, value === "" ? undefined : value])
  );

  const parsed = candidacySchema.safeParse({
    ...cleaned,
    hasPassport: raw.hasPassport === "true",
    consentGiven: raw.consentGiven === "true",
  });

  if (!parsed.success) {
    return {
      success: false,
      message:
        "Le formulaire contient des erreurs. Merci de vérifier les champs obligatoires.",
    };
  }

  const data = parsed.data;

  const photoFile = formData.get("photo") as File | null;
  const cvFile = formData.get("cv") as File | null;
  const otherDocs = formData.getAll("documents") as File[];

  const [photoUrl, cvUrl] = await Promise.all([
    uploadIfPresent(photoFile),
    uploadIfPresent(cvFile),
  ]);

  const documentUrls = (
    await Promise.all(otherDocs.map((doc) => uploadIfPresent(doc)))
  ).filter((url): url is string => Boolean(url));

  const otherVideoLinksRaw = formData.get("otherVideoLinks") as string | null;
  const otherVideoLinks = otherVideoLinksRaw
    ? otherVideoLinksRaw
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
    : [];

  try {
    await prisma.candidacy.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        birthDate: new Date(data.birthDate),
        nationality: data.nationality,
        residenceCountry: data.residenceCountry,
        phone: data.phone,
        whatsapp: data.whatsapp || null,
        email: data.email,

        mainPosition: data.mainPosition as never,
        secondaryPosition: (data.secondaryPosition as never) || null,
        strongFoot: data.strongFoot as never,
        height: data.height,
        weight: data.weight,
        currentClub: data.currentClub || null,
        level: data.level || null,
        previousClub: data.previousClub || null,

        hasPassport: data.hasPassport,
        passportCountry: data.hasPassport ? data.passportCountry || null : null,
        passportExpiry:
          data.hasPassport && data.passportExpiry ? new Date(data.passportExpiry) : null,

        clubHistory: data.clubHistory || null,
        experience: data.experience || null,
        selections: data.selections || null,
        competitionsPlayed: data.competitionsPlayed || null,
        honours: data.honours || null,

        youtubeLink: data.youtubeLink || null,
        tiktokLink: data.tiktokLink || null,
        driveLink: data.driveLink || null,
        otherVideoLinks,

        photoUrl,
        cvUrl,
        documentUrls,

        consentGiven: data.consentGiven,
      },
    });

    return {
      success: true,
      message:
        "Votre candidature a bien été envoyée. Notre équipe reviendra vers vous après étude de votre profil.",
    };
  } catch (error) {
    console.error("Failed to create candidacy:", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de l'envoi. Merci de réessayer.",
    };
  }
}
