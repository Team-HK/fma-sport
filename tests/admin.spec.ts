import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = "admin@fmasport.test";
const ADMIN_PASSWORD = "FmaSport2026!";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Mot de passe", { exact: true }).fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 15_000 });
}

test.describe("Espace administrateur", () => {
  test("un visiteur non connecté est redirigé vers la page de connexion", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("une connexion avec des identifiants invalides échoue", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(ADMIN_EMAIL);
    await page.getByLabel("Mot de passe", { exact: true }).fill("mauvais-mot-de-passe");
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page.getByText("Email ou mot de passe incorrect.")).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("la connexion admin mène au tableau de bord avec les statistiques", async ({ page }) => {
    await login(page);
    await expect(page.getByRole("heading", { name: "Tableau de bord" })).toBeVisible();
    await expect(
      page.locator("p.text-muted-foreground", { hasText: "Articles" }).first()
    ).toBeVisible();
    await expect(
      page.locator("p.text-muted-foreground", { hasText: "Talents publiés" })
    ).toBeVisible();
  });

  test("créer, publier puis supprimer un article se répercute sur le site public", async ({
    page,
  }) => {
    await login(page);

    const title = `Article E2E ${Date.now()}`;

    await page.goto("/admin/articles/new");
    await page.getByLabel("Titre *").fill(title);
    await page.getByLabel("Résumé *").fill("Résumé de test end-to-end pour Playwright.");
    await page
      .getByLabel("Contenu (HTML autorisé) *")
      .fill("<p>Contenu de test généré par la suite Playwright.</p>");
    await page.getByRole("tab", { name: "Publication & SEO" }).click();
    await page.getByLabel("Catégorie *").selectOption("SENEGAL");
    await page.getByLabel("Statut *").selectOption("PUBLISHED");
    await page.getByRole("button", { name: "Enregistrer" }).click();

    await expect(page).toHaveURL(/\/admin\/articles$/, { timeout: 15_000 });
    await expect(page.getByText(title)).toBeVisible();

    // Visible on the public site
    await page.goto("/actualites");
    await expect(page.getByText(title)).toBeVisible();

    // Edit via modal (no more dedicated edit page)
    await page.goto("/admin/articles");
    const row = page.locator(".mt-6.space-y-3 > div").filter({ hasText: title });
    await expect(row).toHaveCount(1);
    await row.getByRole("button", { name: "Modifier" }).click();
    await expect(page.getByRole("dialog", { name: "Modifier l'article" })).toBeVisible();
    await page.getByRole("button", { name: "Fermer" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // Clean up: soft-delete it back from admin
    page.once("dialog", (dialog) => dialog.accept());
    await row.getByRole("button", { name: "Supprimer" }).click();
    await expect(page.getByText(title)).not.toBeVisible({ timeout: 10_000 });
  });

  test("traiter une candidature : accepter crée un profil joueur publié en brouillon", async ({
    page,
  }) => {
    await login(page);
    await page.goto("/admin/joueurs");
    // At least the seed data or the candidacy test should have produced pending candidacies.
    const hasCandidacy = await page
      .getByRole("button", { name: "Accepter + créer profil" })
      .first()
      .isVisible()
      .catch(() => false);

    test.skip(!hasCandidacy, "Aucune candidature en attente à traiter pour ce test.");

    await page.getByRole("button", { name: "Accepter + créer profil" }).first().click();
    await expect(page.getByText("Profils joueurs")).toBeVisible();
  });

  test("la déconnexion admin redirige vers la page de connexion", async ({ page }) => {
    await login(page);
    await page.getByRole("button", { name: "Déconnexion" }).first().click();
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 15_000 });
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
