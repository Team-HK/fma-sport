import { z } from "zod";

export const candidacySchema = z.object({
  // Etape 1
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  birthDate: z.string().min(1, "La date de naissance est requise"),
  nationality: z.string().min(1, "La nationalité est requise"),
  residenceCountry: z.string().min(1, "Le pays de résidence est requis"),
  phone: z.string().min(6, "Le téléphone est requis"),
  whatsapp: z.string().optional(),
  email: z.string().email("Email invalide"),

  // Etape 2
  mainPosition: z.string().min(1, "Le poste principal est requis"),
  secondaryPosition: z.string().optional(),
  strongFoot: z.string().min(1, "Le pied fort est requis"),
  height: z.coerce.number().int().positive().optional(),
  weight: z.coerce.number().int().positive().optional(),
  currentClub: z.string().optional(),
  level: z.string().optional(),
  previousClub: z.string().optional(),

  // Etape 3
  hasPassport: z.boolean().default(false),
  passportCountry: z.string().optional(),
  passportExpiry: z.string().optional(),

  // Etape 4
  clubHistory: z.string().optional(),
  experience: z.string().optional(),
  selections: z.string().optional(),
  competitionsPlayed: z.string().optional(),
  honours: z.string().optional(),

  // Etape 5
  youtubeLink: z.string().url("Lien invalide").optional().or(z.literal("")),
  tiktokLink: z.string().url("Lien invalide").optional().or(z.literal("")),
  driveLink: z.string().url("Lien invalide").optional().or(z.literal("")),

  // Etape 7
  consentGiven: z.boolean().refine((v) => v === true, {
    message: "Vous devez donner votre consentement pour continuer",
  }),
});

export type CandidacyFormValues = z.infer<typeof candidacySchema>;

export const CANDIDACY_STEPS = [
  { id: 1, title: "Informations personnelles" },
  { id: 2, title: "Informations football" },
  { id: 3, title: "Passeport" },
  { id: 4, title: "Parcours football" },
  { id: 5, title: "Vidéos" },
  { id: 6, title: "Documents" },
  { id: 7, title: "Consentement" },
] as const;

export const STEP_FIELDS: Record<number, (keyof CandidacyFormValues)[]> = {
  1: ["firstName", "lastName", "birthDate", "nationality", "residenceCountry", "phone", "email"],
  2: ["mainPosition", "strongFoot"],
  3: [],
  4: [],
  5: [],
  6: [],
  7: ["consentGiven"],
};
