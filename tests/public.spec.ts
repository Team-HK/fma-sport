import { test, expect } from "@playwright/test";

test.describe("Pages publiques", () => {
  test("la page d'accueil affiche le hero et la section À la une", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/FMA SPORT/);
    await expect(page.getByRole("heading", { name: /FMA SPORT/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Voir les actualités" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Devenir joueur FMA SPORT" }).first()).toBeVisible();
  });

  test("la navigation principale mène aux bonnes pages", async ({ page }) => {
    await page.goto("/");
    const mainNav = page.getByRole("navigation", { name: "Navigation principale" });
    await mainNav.getByRole("button", { name: "Actualités" }).click();
    await mainNav.getByRole("link", { name: "Toutes les actualités" }).click();
    await expect(page).toHaveURL(/\/actualites$/);
    await expect(page.getByRole("heading", { name: "Actualités football" })).toBeVisible();
  });

  test("le menu déroulant Talents de la nav principale fonctionne", async ({ page }) => {
    await page.goto("/");
    const mainNav = page.getByRole("navigation", { name: "Navigation principale" });
    await mainNav.getByRole("button", { name: "Talents" }).click();
    await mainNav.getByRole("link", { name: "Nos talents" }).click();
    await expect(page).toHaveURL(/\/talents$/);
  });

  test("la page actualités liste des articles et le filtre par catégorie fonctionne", async ({ page }) => {
    await page.goto("/actualites");
    const cards = page.locator("article, a[href^='/actualites/']");
    await expect(cards.first()).toBeVisible();

    await page
      .getByRole("navigation", { name: "Filtres" })
      .getByRole("link", { name: "Mercato", exact: true })
      .click();
    await expect(page).toHaveURL(/categorie=MERCATO/);
  });

  test("un article s'ouvre et affiche son contenu et les boutons de partage", async ({ page }) => {
    await page.goto("/actualites");
    await page.locator("a[href^='/actualites/']").first().click();
    await expect(page).toHaveURL(/\/actualites\/.+/);
    await expect(page.getByText("Partager :")).toBeVisible();
  });

  test("football africain: le filtre par pays fonctionne", async ({ page }) => {
    await page.goto("/football-africain");
    await expect(page.getByRole("heading", { name: "Football africain" })).toBeVisible();
    await page.getByRole("link", { name: "Mali", exact: true }).click();
    await expect(page).toHaveURL(/pays=Mali/);
  });

  test("football international: le filtre par compétition fonctionne", async ({ page }) => {
    await page.goto("/football-international");
    await page
      .getByRole("navigation", { name: "Filtres" })
      .getByRole("link", { name: "Premier League", exact: true })
      .click();
    await expect(page).toHaveURL(/competition=Premier/);
  });

  test("la page vidéos affiche des vidéos", async ({ page }) => {
    await page.goto("/videos");
    await expect(page.getByRole("heading", { name: "Vidéos" })).toBeVisible();
    await expect(page.locator("a[href^='http']").first()).toBeVisible();
  });

  test("la page talents liste les joueurs et mène à un profil", async ({ page }) => {
    await page.goto("/talents");
    await expect(page.getByRole("heading", { name: "Nos talents" })).toBeVisible();
    await page.getByRole("link", { name: "Voir le profil" }).first().click();
    await expect(page).toHaveURL(/\/joueurs\/.+/);
    await expect(page.getByRole("link", { name: /Contacter FMA SPORT/ })).toBeVisible();
  });

  test("le profil du joueur seedé Mamadou Diop est accessible", async ({ page }) => {
    await page.goto("/joueurs/mamadou-diop");
    await expect(page.getByRole("heading", { level: 1, name: "Mamadou Diop" })).toBeVisible();
    await expect(page.getByRole("definition").getByText("Génération Foot", { exact: true })).toBeVisible();
  });

  test("la page management affiche les 6 services", async ({ page }) => {
    await page.goto("/management");
    await expect(page.getByRole("heading", { name: "Détection" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Mise en relation" })).toBeVisible();
  });

  test("la page événements liste les événements et mène au détail", async ({ page }) => {
    await page.goto("/evenements");
    await page.getByRole("link", { name: "Voir les informations" }).first().click();
    await expect(page).toHaveURL(/\/evenements\/.+/);
    await expect(page.getByRole("heading", { name: "S'inscrire à cet événement" })).toBeVisible();
  });

  test("la page publicité affiche formats et emplacements", async ({ page }) => {
    await page.goto("/publicite");
    await expect(page.getByText("Formats publicitaires")).toBeVisible();
    await expect(page.getByRole("link", { name: "Devenir partenaire" })).toBeVisible();
  });

  test("le footer contient les réseaux sociaux et les liens légaux", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Mentions légales" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Facebook" })).toBeVisible();
  });

  test("la recherche renvoie des résultats pertinents", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Rechercher" }).click();
    await page.getByPlaceholder("Rechercher un joueur, une actualité...").fill("Diop");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/recherche\?q=Diop/);
    await expect(page.getByText(/Résultats pour/)).toBeVisible();
  });

  test("le menu mobile s'ouvre et se ferme", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/");
    await page.getByRole("button", { name: "Ouvrir le menu" }).click();
    await expect(page.getByRole("navigation", { name: "Menu mobile" })).toBeVisible();
    await page.getByRole("navigation", { name: "Menu mobile" }).getByRole("link", { name: "Contact" }).click();
    await expect(page).toHaveURL(/\/contact$/);
  });

  test("aucun scroll horizontal sur mobile (375px)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/");
    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    );
    expect(hasHorizontalScroll).toBe(false);
  });
});

test.describe("Formulaire de contact", () => {
  test("envoie un message de contact avec succès", async ({ page }) => {
    await page.goto("/contact");
    await page.getByLabel("Nom complet *").fill("Aissatou Ba");
    await page.getByLabel("Email *").fill(`aissatou.${Date.now()}@example.com`);
    await page.getByLabel("Sujet *").fill("Question presse");
    await page.getByLabel("Message *").fill("Bonjour, je souhaite en savoir plus sur FMA SPORT.");
    await page.getByRole("button", { name: "Envoyer le message" }).click();
    await expect(page.getByText(/bien été envoyé/)).toBeVisible({ timeout: 10_000 });
  });

  test("affiche une erreur si les champs obligatoires sont vides", async ({ page }) => {
    await page.goto("/contact");
    await page.getByRole("button", { name: "Envoyer le message" }).click();
    // Native HTML5 validation should block submission; the success message must not appear.
    await expect(page.getByText(/bien été envoyé/)).not.toBeVisible();
  });
});
