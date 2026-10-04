/**
 * Demo content to make the platform look active before launch.
 * Everything created here is flagged isDemo=true and can be removed with:
 *   npm run seed:demo -- --clear
 *
 * Players are fictional (no real person's photo is used). Articles only cover
 * these fictional players, FMA SPORT's own activity and general advice — no
 * invented quotes or results about real people.
 */
import { PrismaClient, type PlayerPosition, type StrongFoot, type ArticleCategory } from "@prisma/client";
import { ARTICLE_COVER_IMAGES, HERO_IMAGES } from "../lib/stock-images";
import { slugify } from "../lib/utils";

const prisma = new PrismaClient();

// Deterministic PRNG so re-running produces the same content.
let seed = 20261004;
function rand() {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];
const sample = <T,>(arr: readonly T[], n: number) => [...arr].sort(() => rand() - 0.5).slice(0, n);

const FIRST_NAMES = [
  "Mamadou", "Moussa", "Ibrahima", "Abdoulaye", "Cheikh", "Ousmane", "Pape", "Modou", "Babacar", "Aliou",
  "Lamine", "Serigne", "Assane", "El Hadji", "Malick", "Saliou", "Khadim", "Mouhamed", "Idrissa", "Youssou",
  "Bamba", "Fallou", "Souleymane", "Amadou", "Boubacar", "Demba", "Samba", "Alassane", "Ismaïla", "Omar",
  "Habib", "Racine", "Matar", "Daouda", "Seydou", "Mbaye", "Ndiaga", "Aziz", "Djibril", "Arona",
] as const;
const LAST_NAMES = [
  "Diop", "Ndiaye", "Fall", "Sarr", "Sow", "Diallo", "Ba", "Gueye", "Faye", "Cissé",
  "Mbaye", "Seck", "Thiam", "Sy", "Kane", "Diouf", "Ndao", "Camara", "Badji", "Sané",
  "Diatta", "Coly", "Mendy", "Sagna", "Tall", "Niang", "Wade", "Kouyaté", "Touré", "Dieng",
  "Lo", "Samb", "Ciss", "Dramé", "Konaté", "Diakhaté", "Mané", "Goudiaby", "Sonko", "Bodian",
] as const;

const CLUBS = [
  { name: "Génération Foot", city: "Dakar", region: "Dakar", league: "Ligue 1 Sénégal" },
  { name: "ASC Jaraaf", city: "Dakar", region: "Dakar", league: "Ligue 1 Sénégal" },
  { name: "US Gorée", city: "Dakar", region: "Dakar", league: "Ligue 1 Sénégal" },
  { name: "AS Douanes", city: "Dakar", region: "Dakar", league: "Ligue 1 Sénégal" },
  { name: "Dakar Sacré-Cœur", city: "Dakar", region: "Dakar", league: "Ligue 1 Sénégal" },
  { name: "AS Pikine", city: "Pikine", region: "Dakar", league: "Ligue 1 Sénégal" },
  { name: "Guédiawaye FC", city: "Guédiawaye", region: "Dakar", league: "Ligue 1 Sénégal" },
  { name: "Teungueth FC", city: "Rufisque", region: "Dakar", league: "Ligue 1 Sénégal" },
  { name: "Diambars FC", city: "Saly", region: "Thiès", league: "Ligue 1 Sénégal" },
  { name: "Stade de Mbour", city: "Mbour", region: "Thiès", league: "Ligue 2 Sénégal" },
  { name: "Casa Sports", city: "Ziguinchor", region: "Ziguinchor", league: "Ligue 1 Sénégal" },
  { name: "ASC Linguère", city: "Saint-Louis", region: "Saint-Louis", league: "Ligue 1 Sénégal" },
  { name: "Sonacos", city: "Diourbel", region: "Diourbel", league: "Ligue 2 Sénégal" },
  { name: "Jamono Fatick", city: "Fatick", region: "Fatick", league: "Ligue 2 Sénégal" },
] as const;
const FOREIGN = [
  { nationality: "Malienne", flag: "🇲🇱", clubs: ["Stade Malien", "Djoliba AC"], league: "Ligue 1 Mali" },
  { nationality: "Guinéenne", flag: "🇬🇳", clubs: ["Horoya AC", "Hafia FC"], league: "Ligue 1 Guinée" },
  { nationality: "Gambienne", flag: "🇬🇲", clubs: ["Real de Banjul"], league: "GFA League" },
] as const;

const POSITIONS: { key: PlayerPosition; label: string; group: string; height: [number, number] }[] = [
  { key: "GARDIEN", label: "gardien", group: "gardiens", height: [183, 194] },
  { key: "DEFENSEUR_CENTRAL", label: "défenseur central", group: "défenseurs", height: [180, 192] },
  { key: "LATERAL_DROIT", label: "latéral droit", group: "défenseurs", height: [168, 180] },
  { key: "LATERAL_GAUCHE", label: "latéral gauche", group: "défenseurs", height: [168, 180] },
  { key: "MILIEU_DEFENSIF", label: "milieu défensif", group: "milieux", height: [174, 188] },
  { key: "MILIEU_CENTRAL", label: "milieu central", group: "milieux", height: [170, 184] },
  { key: "MILIEU_OFFENSIF", label: "milieu offensif", group: "milieux", height: [166, 180] },
  { key: "AILIER_DROIT", label: "ailier droit", group: "ailiers", height: [165, 178] },
  { key: "AILIER_GAUCHE", label: "ailier gauche", group: "ailiers", height: [165, 178] },
  { key: "AVANT_CENTRE", label: "avant-centre", group: "attaquants", height: [176, 190] },
];

const STRENGTHS: Record<string, string[]> = {
  GARDIEN: ["Réflexes sur sa ligne", "Jeu au pied", "Sorties aériennes", "Placement", "Leadership vocal", "Relance rapide"],
  DEFENSEUR_CENTRAL: ["Jeu de tête", "Anticipation", "Relance propre", "Duels au sol", "Couverture de la profondeur", "Leadership"],
  LATERAL_DROIT: ["Vitesse de projection", "Qualité de centre", "Endurance", "Un-contre-un défensif", "Appels intérieurs"],
  LATERAL_GAUCHE: ["Vitesse de projection", "Qualité de centre", "Endurance", "Un-contre-un défensif", "Pied gauche précis"],
  MILIEU_DEFENSIF: ["Récupération", "Lecture du jeu", "Orientation du jeu", "Volume de course", "Impact dans les duels"],
  MILIEU_CENTRAL: ["Volume de jeu", "Passes entre les lignes", "Projection", "Conservation sous pression", "Frappe de loin"],
  MILIEU_OFFENSIF: ["Dernière passe", "Vision du jeu", "Conduite de balle", "Coups de pied arrêtés", "Frappe de loin"],
  AILIER_DROIT: ["Dribble en un-contre-un", "Accélération", "Repiquage pied gauche", "Centres", "Pressing"],
  AILIER_GAUCHE: ["Dribble en un-contre-un", "Accélération", "Repiquage pied droit", "Centres", "Pressing"],
  AVANT_CENTRE: ["Finition", "Jeu dos au but", "Appels en profondeur", "Jeu de tête", "Pressing haut"],
};

const COVERS = [...ARTICLE_COVER_IMAGES, ...HERO_IMAGES];
const NOW = new Date();
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000 - int(0, 36_000_000));
const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

type DemoPlayer = {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  age: number;
  position: (typeof POSITIONS)[number];
  club: string;
  city: string;
  region: string;
  nationality: string;
  goals: number;
  assists: number;
  matches: number;
  strengths: string[];
};

async function clear() {
  const [a, p] = await prisma.$transaction([
    prisma.article.deleteMany({ where: { isDemo: true } }),
    prisma.player.deleteMany({ where: { isDemo: true } }),
  ]);
  console.log(`Removed ${a.count} demo articles and ${p.count} demo players.`);
}

async function createPlayers(count: number): Promise<DemoPlayer[]> {
  const usedSlugs = new Set((await prisma.player.findMany({ select: { slug: true } })).map((p) => p.slug));
  const players: DemoPlayer[] = [];

  for (let i = 0; i < count; i++) {
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    let slug = slugify(`${firstName} ${lastName}`);
    for (let n = 2; usedSlugs.has(slug); n++) slug = `${slugify(`${firstName} ${lastName}`)}-${n}`;
    usedSlugs.add(slug);

    const position = pick(POSITIONS);
    const foreign = rand() < 0.15 ? pick(FOREIGN) : null;
    const senClub = pick(CLUBS);
    const club = foreign ? pick(foreign.clubs) : senClub.name;
    const league = foreign ? foreign.league : senClub.league;
    const city = foreign ? "" : senClub.city;
    const region = foreign ? "" : senClub.region;
    const age = int(16, 23);
    const birthDate = new Date(NOW.getFullYear() - age, int(0, 11), int(1, 28));
    const strongFoot: StrongFoot =
      position.key === "LATERAL_GAUCHE" || position.key === "AILIER_DROIT"
        ? rand() < 0.7 ? "GAUCHE" : "DROIT"
        : rand() < 0.12 ? "AMBIDEXTRE" : rand() < 0.75 ? "DROIT" : "GAUCHE";

    const attacking = ["AVANT_CENTRE", "AILIER_DROIT", "AILIER_GAUCHE", "MILIEU_OFFENSIF"].includes(position.key);
    const seasons = age >= 19 ? ["2025/2026", "2024/2025"] : ["2025/2026"];
    const stats = seasons.map((season, idx) => {
      const matches = int(8, 28) - idx * int(0, 6);
      const minutesPlayed = matches * int(48, 88);
      const goals = position.key === "GARDIEN" ? 0 : attacking ? int(2, Math.max(3, Math.round(matches * 0.55))) : int(0, 3);
      const assists = position.key === "GARDIEN" ? 0 : int(0, attacking ? 9 : 5);
      return {
        competition: age < 19 && idx === 0 && rand() < 0.5 ? "Championnat national U19" : league,
        season,
        matches,
        goals,
        assists,
        minutesPlayed,
      };
    });

    const strengths = sample(STRENGTHS[position.key], 3);
    const startYear = NOW.getFullYear() - (age - int(9, 12));
    const careerHistory = [
      `${startYear}–${startYear + 3} · École de football de quartier${city ? ` (${city})` : ""}`,
      `${startYear + 3}–${NOW.getFullYear() - 1} · Catégories jeunes, ${club}`,
      `${NOW.getFullYear() - 1}– · ${club}${age >= 18 ? " (groupe senior)" : " (U19)"}`,
    ];
    const nationality = foreign ? foreign.nationality : "Sénégalaise";
    const bio = [
      `${firstName} ${lastName} est un ${position.label} de ${age} ans formé${city ? ` à ${city}` : ""} et aujourd'hui licencié à ${club}.`,
      `Repéré par la cellule scouting de FMA SPORT, il se distingue par ${strengths[0].toLowerCase()} et ${strengths[1].toLowerCase()}. ${
        attacking ? "Son efficacité dans les trente derniers mètres en fait l'un des profils offensifs à suivre." : "Sa régularité et son sens du collectif en font un joueur fiable pour son entraîneur."
      }`,
    ].join("\n\n");

    const created = await prisma.player.create({
      data: {
        firstName,
        lastName,
        slug,
        nationality,
        flag: foreign ? foreign.flag : "🇸🇳",
        birthDate,
        height: int(...position.height),
        weight: int(60, 82),
        position: position.key,
        strongFoot,
        club,
        number: int(1, 30),
        bio,
        strengths,
        careerHistory,
        status: "PUBLISHED",
        isDemo: true,
        createdAt: daysAgo(int(5, 360)),
        stats: { create: stats },
      },
    });

    const totals = stats.reduce((t, s) => ({ g: t.g + s.goals, a: t.a + s.assists, m: t.m + s.matches }), { g: 0, a: 0, m: 0 });
    players.push({
      id: created.id,
      slug,
      firstName,
      lastName,
      age,
      position,
      club,
      city,
      region,
      nationality,
      goals: totals.g,
      assists: totals.a,
      matches: totals.m,
      strengths,
    });
  }
  return players;
}

type DemoArticle = {
  title: string;
  excerpt: string;
  content: string;
  category: ArticleCategory;
  tags: string[];
  country?: string;
  publishedAt: Date;
};

const link = (p: DemoPlayer) => `<a href="/joueurs/${p.slug}">${p.firstName} ${p.lastName}</a>`;

function portrait(p: DemoPlayer): DemoArticle {
  const name = `${p.firstName} ${p.lastName}`;
  const hooks = [
    `${name}, le ${p.position.label} qui fait parler de lui à ${p.club}`,
    `Portrait : ${name}, ${p.age} ans, l'un des ${p.position.group} les plus prometteurs du moment`,
    `${name} (${p.club}) : « Je travaille chaque jour pour franchir un cap »`.replace(/«.*»/, "un talent qui franchit les étapes"),
    `Jeunes talents : à la découverte de ${name}`,
  ];
  return {
    title: pick(hooks),
    excerpt: `À ${p.age} ans, ${name} s'impose comme un ${p.position.label} à suivre. Retour sur son parcours, ses qualités et ses statistiques.`,
    category: "JEUNES_TALENTS",
    tags: ["portrait", p.club, p.position.label],
    country: p.nationality === "Sénégalaise" ? "Sénégal" : undefined,
    publishedAt: daysAgo(int(1, 330)),
    content: `
<p>Il fait partie des profils suivis de près par la cellule scouting de FMA SPORT. ${link(p)}, ${p.position.label} de ${p.age} ans, évolue aujourd'hui sous les couleurs de <strong>${p.club}</strong>${p.city ? `, à ${p.city}` : ""}.</p>
<h2>Un parcours construit pas à pas</h2>
<p>Passé par le football de quartier avant d'intégrer les catégories jeunes de son club, ${p.firstName} a gravi les échelons avec méthode. Ses éducateurs décrivent un joueur appliqué, à l'écoute et exigeant avec lui-même.</p>
<h2>Ses points forts</h2>
<ul>${p.strengths.map((s) => `<li>${s}</li>`).join("")}</ul>
<p>${p.position.group === "gardiens" ? "Dans les cages, sa présence rassure sa défense et sa relance permet à l'équipe de sortir proprement le ballon." : `Sur le terrain, ${p.firstName} se distingue particulièrement par ${p.strengths[0].toLowerCase()}, une qualité rare à son âge.`}</p>
<h2>Les chiffres de sa saison</h2>
<p>Sur l'ensemble de ses compétitions, il compte <strong>${p.matches} matchs</strong>${p.position.key !== "GARDIEN" ? `, <strong>${p.goals} but${p.goals > 1 ? "s" : ""}</strong> et <strong>${p.assists} passe${p.assists > 1 ? "s" : ""} décisive${p.assists > 1 ? "s" : ""}</strong>` : ""}.</p>
<blockquote>Retrouvez sa fiche complète, ses statistiques détaillées et son parcours sur sa <a href="/joueurs/${p.slug}">page profil</a>.</blockquote>
<p>Clubs et recruteurs intéressés par ce profil peuvent <a href="/contact">contacter FMA SPORT Management</a>.</p>`,
  };
}

function toWatch(group: string, region: string, players: DemoPlayer[]): DemoArticle {
  const list = players.slice(0, 5);
  return {
    title: `${list.length} ${group} à suivre dans la région de ${region}`,
    excerpt: `La sélection de la rédaction : les ${group} de la région de ${region} qui ont retenu l'attention de nos observateurs cette saison.`,
    category: "SENEGAL",
    tags: ["à suivre", region, group],
    country: "Sénégal",
    publishedAt: daysAgo(int(1, 300)),
    content: `
<p>Chaque mois, les observateurs de FMA SPORT sillonnent les terrains du pays. Voici les ${group} de la région de <strong>${region}</strong> qui nous ont le plus marqués.</p>
${list
  .map(
    (p, i) => `<h2>${i + 1}. ${p.firstName} ${p.lastName} — ${p.club}</h2>
<p>${p.age} ans, ${p.position.label}. Points forts : ${p.strengths.join(", ").toLowerCase()}. ${p.matches} matchs disputés cette saison${p.position.key !== "GARDIEN" ? ` pour ${p.goals + p.assists} contributions décisives` : ""}. ${link(p)}.</p>`
  )
  .join("\n")}
<p>Vous êtes éducateur ou joueur et souhaitez être observé ? <a href="/devenir-joueur">Déposez votre candidature</a>.</p>`,
  };
}

function barometer(monthIndex: number, year: number, category: "U19" | "U23", players: DemoPlayer[]): DemoArticle {
  const top = players.slice(0, 10);
  const month = MONTHS[monthIndex];
  const publishedAt = new Date(year, monthIndex, 28, 10, 0);
  return {
    title: `Baromètre FMA SPORT ${category} — ${month} ${year} : le top 10 des talents`,
    excerpt: `Notre classement mensuel des joueurs ${category} les plus en forme, établi à partir des performances observées et des statistiques du mois de ${month}.`,
    category: "JEUNES_TALENTS",
    tags: ["baromètre", category, month],
    country: "Sénégal",
    publishedAt,
    content: `
<p>Comme chaque fin de mois, la rédaction et la cellule scouting de FMA SPORT publient leur baromètre des talents <strong>${category}</strong>. Le classement tient compte de la régularité, de l'influence sur le jeu et des statistiques.</p>
<ol>${top.map((p) => `<li><strong>${p.firstName} ${p.lastName}</strong> (${p.club}, ${p.position.label}) — ${link(p)}</li>`).join("")}</ol>
<h2>La méthode</h2>
<p>Chaque joueur est observé au moins deux fois par nos équipes au cours du mois. Les notes portent sur les qualités techniques, physiques et mentales, complétées par les données de match.</p>`,
  };
}

const CITIES = ["Dakar", "Thiès", "Saint-Louis", "Ziguinchor", "Kaolack", "Mbour", "Touba", "Tambacounda"] as const;
function detectionRecap(city: string, when: Date, featured: DemoPlayer[]): DemoArticle {
  const participants = int(80, 260);
  const retained = int(6, 15);
  return {
    title: `Détection FMA SPORT à ${city} : ${participants} jeunes sur le terrain, ${retained} profils retenus`,
    excerpt: `Retour sur la journée de détection organisée à ${city} : ateliers, matchs et premiers enseignements de nos observateurs.`,
    category: "SENEGAL",
    tags: ["détection", city],
    country: "Sénégal",
    publishedAt: when,
    content: `
<p>Ils étaient <strong>${participants} jeunes joueurs</strong> au rendez-vous de la journée de détection FMA SPORT organisée à ${city}. Au programme : échauffement collectif, ateliers techniques, tests physiques puis matchs à effectif réduit.</p>
<h2>Une organisation rodée</h2>
<p>Encadrés par nos éducateurs, les participants ont été répartis par année de naissance. Chaque atelier était observé par au moins deux membres de la cellule scouting afin de croiser les évaluations.</p>
<h2>${retained} profils retenus</h2>
<p>À l'issue de la journée, ${retained} joueurs ont été retenus pour un suivi individualisé. Ils seront recontactés par notre équipe dans les prochaines semaines.</p>
${featured.length ? `<p>Parmi les profils déjà suivis dans la région : ${featured.map(link).join(", ")}.</p>` : ""}
<p>Prochaines dates : consultez la page <a href="/evenements">Événements</a>.</p>`,
  };
}

const GUIDES: { title: string; excerpt: string; body: string }[] = [
  { title: "Journée de détection : comment bien s'y préparer", excerpt: "Sommeil, alimentation, équipement, attitude : nos conseils pour donner le meilleur de soi le jour J.", body: "<h2>La veille</h2><p>Dormez au moins huit heures, hydratez-vous régulièrement et préparez votre sac : crampons, protège-tibias, gourde et pièce d'identité.</p><h2>Le jour J</h2><p>Arrivez en avance, échauffez-vous sérieusement et restez concentré même lorsque vous n'avez pas le ballon : les observateurs regardent aussi vos déplacements et votre attitude.</p><h2>Après</h2><p>Quel que soit le résultat, demandez un retour aux éducateurs. Chaque détection est une occasion d'apprendre.</p>" },
  { title: "Vidéo de présentation : les erreurs à éviter", excerpt: "Une bonne vidéo peut ouvrir des portes. Voici comment la rendre efficace.", body: "<h2>Trop long</h2><p>Visez trois à cinq minutes. Les recruteurs regardent les trente premières secondes avant de décider de poursuivre.</p><h2>Pas de repère</h2><p>Signalez-vous avant chaque action (flèche, cercle) et indiquez votre numéro de maillot.</p><h2>Que des buts</h2><p>Montrez aussi vos replacements, vos duels et vos passes : un profil complet intéresse davantage.</p>" },
  { title: "Le rôle d'un agent de joueurs, expliqué simplement", excerpt: "Mandat, commission, licence FIFA : ce qu'il faut savoir avant de signer.", body: "<h2>Une activité encadrée</h2><p>Depuis la réforme FIFA, les agents doivent être licenciés. Demandez toujours à voir la licence de votre interlocuteur.</p><h2>Le mandat</h2><p>Il fixe la durée, l'exclusivité et la rémunération. Ne signez jamais un document que vous n'avez pas lu avec un proche ou un conseiller.</p><h2>Les mineurs</h2><p>Les transferts internationaux de mineurs sont strictement limités par la FIFA. Méfiez-vous des promesses d'essais à l'étranger contre paiement.</p>" },
  { title: "Concilier études et football : le guide pour les jeunes joueurs", excerpt: "Organisation, dialogue avec l'école et le club : comment réussir sur les deux tableaux.", body: "<h2>Un planning réaliste</h2><p>Bloquez vos horaires d'entraînement et vos créneaux de révision. La régularité compte plus que les longues séances.</p><h2>Le diplôme, une sécurité</h2><p>Une carrière professionnelle reste incertaine. Les clubs formateurs sérieux suivent d'ailleurs la scolarité de leurs joueurs.</p>" },
  { title: "Nutrition du jeune footballeur : les bases", excerpt: "Ce qu'il faut manger avant et après un match, avec des produits locaux et accessibles.", body: "<h2>Avant le match</h2><p>Un repas riche en féculents trois heures avant : riz, mil, patate douce, accompagnés de légumes et d'une protéine légère.</p><h2>Après le match</h2><p>Réhydratez-vous puis privilégiez un repas complet dans l'heure : poisson, œufs ou légumineuses, et des fruits locaux comme la mangue ou la banane.</p>" },
  { title: "Récupération et sommeil : l'entraînement invisible", excerpt: "Pourquoi le repos fait partie intégrante de la progression.", body: "<p>La progression se fait pendant la récupération. Huit à dix heures de sommeil sont recommandées à l'adolescence.</p><h2>Les bons réflexes</h2><p>Étirements doux, hydratation, limitation des écrans le soir et au moins un jour de repos complet par semaine.</p>" },
  { title: "Réseaux sociaux : comment un jeune joueur doit-il les utiliser ?", excerpt: "Visibilité, image, prudence : les règles d'or.", body: "<h2>Votre vitrine</h2><p>Publiez des extraits de match, des séances de travail, votre parcours. Restez sobre et régulier.</p><h2>La prudence</h2><p>Ne partagez pas d'informations personnelles et méfiez-vous des sollicitations d'inconnus promettant des essais.</p>" },
  { title: "Préparation mentale : gérer la pression des grands matchs", excerpt: "Routines, respiration et visualisation pour rester performant.", body: "<p>Le mental se travaille comme la technique. Les meilleurs joueurs ont tous une routine d'avant-match.</p><h2>Trois outils simples</h2><ul><li>La respiration lente avant d'entrer sur le terrain</li><li>La visualisation des premières actions</li><li>Un objectif de comportement plutôt qu'un objectif de résultat</li></ul>" },
  { title: "Choisir son centre de formation : les questions à poser", excerpt: "Encadrement, scolarité, hébergement, contrat : la check-list des familles.", body: "<ul><li>Qui encadre les jeunes et avec quels diplômes ?</li><li>Comment la scolarité est-elle suivie ?</li><li>Quelles sont les conditions d'hébergement ?</li><li>Que prévoit le contrat en cas de départ ?</li></ul><p>Un centre sérieux répond clairement à toutes ces questions.</p>" },
  { title: "Les étapes d'un essai en club", excerpt: "De l'invitation à la décision : ce qui vous attend.", body: "<h2>L'invitation</h2><p>Un essai sérieux fait l'objet d'une invitation écrite du club. Il ne doit jamais être payant pour le joueur.</p><h2>Sur place</h2><p>Entraînements avec le groupe, parfois un match amical, tests médicaux et physiques.</p><h2>La décision</h2><p>Elle peut prendre plusieurs semaines. Restez en contact avec votre accompagnant.</p>" },
  { title: "Football féminin au Sénégal : comment rejoindre un club", excerpt: "Les démarches pour les jeunes joueuses qui veulent pratiquer en compétition.", body: "<p>Le football féminin se développe dans toutes les régions. Les clubs recrutent dès les catégories jeunes.</p><h2>Les démarches</h2><p>Renseignez-vous auprès de la ligue régionale, présentez-vous aux séances d'essai et préparez un certificat médical.</p>" },
  { title: "Blessures fréquentes chez les jeunes footballeurs et comment les prévenir", excerpt: "Entorses, tendinites, douleurs de croissance : prévenir plutôt que guérir.", body: "<h2>L'échauffement</h2><p>Quinze minutes d'échauffement progressif réduisent fortement le risque de blessure.</p><h2>Écouter son corps</h2><p>Une douleur qui persiste plus de quelques jours doit être examinée. Jouer blessé retarde toujours le retour.</p>" },
];

async function main() {
  if (process.argv.includes("--clear")) {
    await clear();
    return;
  }
  await clear();

  console.log("Creating 200 demo players...");
  const players = await createPlayers(200);
  const senegalese = players.filter((p) => p.region);

  const articles: DemoArticle[] = [];
  for (const p of players) articles.push(portrait(p));

  const groups = [...new Set(POSITIONS.map((p) => p.group))];
  const regions = [...new Set(CLUBS.map((c) => c.region))];
  const combos = groups.flatMap((g) => regions.map((r) => [g, r] as const));
  for (const [group, region] of sample(combos, combos.length)) {
    if (articles.length >= 240) break;
    const matching = senegalese.filter((p) => p.position.group === group && p.region === region);
    if (matching.length >= 2) articles.push(toWatch(group, region, matching));
  }
  while (articles.length < 240) {
    const region = pick(regions);
    articles.push(toWatch("talents", region, sample(senegalese.filter((p) => p.region === region), 5)));
  }

  for (let m = 0; m < 12; m++) {
    const d = new Date(NOW.getFullYear(), NOW.getMonth() - 1 - m, 1);
    for (const cat of ["U19", "U23"] as const) {
      const pool = players.filter((p) => (cat === "U19" ? p.age <= 19 : p.age > 19));
      articles.push(barometer(d.getMonth(), d.getFullYear(), cat, sample(pool, 10)));
    }
  }

  for (let i = 0; i < 24; i++) {
    const city = CITIES[i % CITIES.length];
    articles.push(detectionRecap(city, daysAgo(10 + i * 14), sample(senegalese.filter((p) => p.city === city), 3)));
  }

  for (const g of GUIDES) {
    articles.push({
      title: g.title,
      excerpt: g.excerpt,
      content: `<p>${g.excerpt}</p>${g.body}`,
      category: "SENEGAL",
      tags: ["conseils"],
      country: "Sénégal",
      publishedAt: daysAgo(int(3, 340)),
    });
  }

  const usedSlugs = new Set((await prisma.article.findMany({ select: { slug: true } })).map((a) => a.slug));
  const rows = articles.slice(0, 300).map((a, i) => {
    let slug = slugify(a.title).slice(0, 90);
    for (let n = 2; usedSlugs.has(slug); n++) slug = `${slugify(a.title).slice(0, 86)}-${n}`;
    usedSlugs.add(slug);
    return {
      title: a.title,
      slug,
      excerpt: a.excerpt,
      content: a.content.trim(),
      coverImage: COVERS[i % COVERS.length],
      category: a.category,
      tags: a.tags,
      country: a.country ?? null,
      status: "PUBLISHED" as const,
      publishedAt: a.publishedAt,
      createdAt: a.publishedAt,
      updatedAt: a.publishedAt,
      views: int(120, 6500),
      isDemo: true,
    };
  });
  await prisma.article.createMany({ data: rows });
  console.log(`Created ${players.length} demo players and ${rows.length} demo articles.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
