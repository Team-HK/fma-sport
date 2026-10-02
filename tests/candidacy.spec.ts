import { test, expect } from "@playwright/test";

test.describe("Formulaire Devenir joueur", () => {
  test("bloque le passage à l'étape suivante si un champ requis est vide", async ({ page }) => {
    await page.goto("/devenir-joueur");
    await page.getByRole("button", { name: "Suivant" }).click();
    await expect(page.getByText("Ce champ est requis").first()).toBeVisible();
  });

  test("permet de parcourir les 7 étapes et d'envoyer la candidature", async ({ page }) => {
    await page.goto("/devenir-joueur");

    // Etape 1
    await page.getByLabel("Prénom *").fill("Ousmane");
    await page.getByLabel("Nom *", { exact: true }).fill("Sy");
    await page.getByLabel("Date de naissance *").fill("2008-04-12");
    await page.getByLabel("Nationalité *").selectOption("Sénégal");
    await page.getByLabel("Pays de résidence *").selectOption("Sénégal");
    await page.getByLabel("Téléphone *").fill("+221771234567");
    await page.getByLabel("Email *").fill(`ousmane.sy.${Date.now()}@example.com`);
    await page.getByRole("button", { name: "Suivant" }).click();

    // Etape 2
    await page.getByLabel("Poste principal *").selectOption("AVANT_CENTRE");
    await page.getByLabel("Pied fort *").selectOption("DROIT");
    await page.getByRole("button", { name: "Suivant" }).click();

    // Etape 3 - passeport (laisser "Non" par défaut)
    await page.getByRole("button", { name: "Suivant" }).click();

    // Etape 4 - parcours (facultatif)
    await page.getByRole("button", { name: "Suivant" }).click();

    // Etape 5 - vidéos (facultatif)
    await page.getByRole("button", { name: "Suivant" }).click();

    // Etape 6 - documents (facultatif, pas de fichier dans ce test)
    await page.getByRole("button", { name: "Suivant" }).click();

    // Etape 7 - consentement
    await expect(page.getByText("Étape 7 — Consentement")).toBeVisible();
    await page.getByLabel(/Je confirme mon accord/).check();
    await page.getByRole("button", { name: "Envoyer ma candidature" }).click();

    await expect(page.getByText("Candidature envoyée")).toBeVisible({ timeout: 15_000 });
  });

  test("le bouton précédent revient à l'étape antérieure", async ({ page }) => {
    await page.goto("/devenir-joueur");
    await page.getByLabel("Prénom *").fill("Test");
    await page.getByLabel("Nom *", { exact: true }).fill("Retour");
    await page.getByLabel("Date de naissance *").fill("2007-01-01");
    await page.getByLabel("Nationalité *").selectOption("Sénégal");
    await page.getByLabel("Pays de résidence *").selectOption("Sénégal");
    await page.getByLabel("Téléphone *").fill("+221770000000");
    await page.getByLabel("Email *").fill("test.retour@example.com");
    await page.getByRole("button", { name: "Suivant" }).click();

    await expect(page.getByText("Étape 2 — Informations football")).toBeVisible();
    await page.getByRole("button", { name: "Précédent" }).click();
    await expect(page.getByText("Étape 1 — Informations personnelles")).toBeVisible();
  });
});
