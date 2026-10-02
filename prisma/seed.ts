import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  ARTICLE_COVER_IMAGES,
  VIDEO_THUMBNAILS,
  EVENT_POSTER_IMAGES,
  pickImage,
  unsplash,
} from "../lib/stock-images";

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("Seeding FMA.SPORT (données fictives, contexte Sénégal)...");

  const passwordHash = await bcrypt.hash("FmaSport2026!", 10);
  const admin = await prisma.adminUser.upsert({
    where: { email: "admin@fmasport.test" },
    update: {},
    create: {
      name: "Admin FMA.SPORT",
      email: "admin@fmasport.test",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  // ---------------------------------------------------------------------
  // Articles
  // ---------------------------------------------------------------------
  const articlesData = [
    {
      title: "Génération Foot écrase le Jaraaf en clôture de la 12e journée",
      excerpt:
        "Les jeunes pousses de Déni Biram Ndao ont livré une prestation solide face au Jaraaf de Dakar, s'imposant 3-0 au stade Lat Dior de Thiès.",
      category: "SENEGAL" as const,
      tags: ["Ligue 1 Sénégal", "Génération Foot", "Jaraaf"],
      country: "Sénégal",
    },
    {
      title: "Sadio Mané inaugure un centre de formation à Bambali",
      excerpt:
        "L'international sénégalais a posé la première pierre d'un centre de formation destiné aux jeunes talents de sa région natale.",
      category: "SENEGAL" as const,
      tags: ["Sadio Mané", "Formation", "Casamance"],
      country: "Sénégal",
    },
    {
      title: "CAN 2027 : le Sénégal connaît ses adversaires en phase de groupes",
      excerpt:
        "Les Lions de la Teranga affronteront le Cameroun, l'Algérie et la Gambie lors de la phase de poules de la Coupe d'Afrique des Nations.",
      category: "CAN" as const,
      tags: ["CAN 2027", "Lions de la Teranga"],
      country: "Sénégal",
    },
    {
      title: "Mercato : Teungueth FC officialise l'arrivée de trois recrues ivoiriennes",
      excerpt:
        "Le club rufisquois renforce son effectif avant la seconde partie de saison avec trois joueurs formés à l'ASEC Mimosas.",
      category: "MERCATO" as const,
      tags: ["Teungueth FC", "Mercato", "Côte d'Ivoire"],
      country: "Sénégal",
    },
    {
      title: "Diambars FC : la philosophie d'un club formateur unique en Afrique",
      excerpt:
        "Retour sur le modèle du club de Saly, qui allie scolarité et formation footballistique depuis plus de vingt ans.",
      category: "JEUNES_TALENTS" as const,
      tags: ["Diambars", "Formation", "Saly"],
      country: "Sénégal",
    },
    {
      title: "Les Lionnes se préparent pour les qualifications à la CAN féminine",
      excerpt:
        "L'équipe nationale féminine du Sénégal a entamé un stage de préparation à Diamniadio avant les échéances continentales.",
      category: "SELECTIONS_NATIONALES" as const,
      tags: ["Lionnes", "Football féminin"],
      country: "Sénégal",
    },
    {
      title: "Le Maroc valide son billet pour la finale de la Coupe de la CAF",
      excerpt:
        "La Renaissance Sportive de Berkane rejoint la finale après une victoire convaincante en demi-finale retour.",
      category: "AFRIQUE" as const,
      tags: ["Maroc", "Coupe de la CAF"],
      country: "Maroc",
    },
    {
      title: "Didier Drogba lance une académie de football à Abidjan",
      excerpt:
        "L'ancienne star des Éléphants investit dans la détection de jeunes talents ivoiriens avec une nouvelle académie.",
      category: "AFRIQUE" as const,
      tags: ["Côte d'Ivoire", "Didier Drogba"],
      country: "Côte d'Ivoire",
    },
    {
      title: "Premier League : Arsenal reprend la tête après un succès à Anfield",
      excerpt:
        "Les Gunners l'emportent 2-1 à Liverpool et s'installent provisoirement en tête du championnat anglais.",
      category: "INTERNATIONAL" as const,
      tags: ["Premier League", "Arsenal", "Liverpool"],
      competition: "Premier League",
    },
    {
      title: "Ligue des champions : le PSG assure l'essentiel face au Bayern",
      excerpt:
        "Paris décroche un nul précieux (1-1) sur la pelouse munichoise et se rapproche de la qualification en quarts de finale.",
      category: "LIGUE_DES_CHAMPIONS" as const,
      tags: ["Ligue des champions", "PSG", "Bayern Munich"],
      competition: "Ligue des champions",
    },
    {
      title: "Mercato international : Kylian Mbappé évoque son avenir",
      excerpt:
        "L'attaquant français est revenu sur les rumeurs de transfert lors d'une conférence de presse à Madrid.",
      category: "MERCATO" as const,
      tags: ["Mercato", "Kylian Mbappé", "Real Madrid"],
      competition: "Liga",
    },
    {
      title: "ASC Linguère : un nouveau souffle pour le football féminin sénégalais",
      excerpt:
        "Le club de Saint-Louis multiplie les initiatives pour développer la pratique féminine dans le nord du pays.",
      category: "JEUNES_TALENTS" as const,
      tags: ["ASC Linguère", "Saint-Louis", "Football féminin"],
      country: "Sénégal",
    },
  ];

  for (const [index, data] of articlesData.entries()) {
    const slug = slugify(data.title);
    const publishedAt = new Date(Date.now() - index * 1000 * 60 * 60 * 18);
    await prisma.article.upsert({
      where: { slug },
      update: { coverImage: pickImage(ARTICLE_COVER_IMAGES, index) },
      create: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: `<p>${data.excerpt}</p><p>Plus de détails à venir sur FMA.SPORT concernant cet évènement qui anime l'actualité du football. Notre rédaction suit la situation de près et reviendra avec des analyses complémentaires, des réactions des acteurs concernés et des statistiques clés.</p><p>Restez connectés pour ne rien manquer de l'actualité football sénégalaise, africaine et internationale.</p>`,
        coverImage: pickImage(ARTICLE_COVER_IMAGES, index),
        category: data.category,
        tags: data.tags,
        country: data.country ?? null,
        competition: data.competition ?? null,
        status: "PUBLISHED",
        publishedAt,
        views: Math.floor(Math.random() * 5000) + 120,
        authorId: admin.id,
      },
    });
  }

  // ---------------------------------------------------------------------
  // Players (Talents)
  // ---------------------------------------------------------------------
  const playersData = [
    {
      firstName: "Mamadou",
      lastName: "Diop",
      nationality: "Sénégalaise",
      flag: "🇸🇳",
      birthDate: new Date("2007-03-14"),
      position: "AVANT_CENTRE" as const,
      secondaryPosition: "AILIER_DROIT" as const,
      strongFoot: "DROIT" as const,
      height: 181,
      weight: 74,
      club: "Génération Foot",
      previousClub: "ASC Jeanne d'Arc",
      number: 9,
      bio: "Buteur prolifique formé à Déni Biram Ndao, considéré comme l'un des attaquants les plus prometteurs de sa génération au Sénégal.",
    },
    {
      firstName: "Ibrahima",
      lastName: "Sarr",
      nationality: "Sénégalaise",
      flag: "🇸🇳",
      birthDate: new Date("2006-11-02"),
      position: "MILIEU_CENTRAL" as const,
      secondaryPosition: "MILIEU_DEFENSIF" as const,
      strongFoot: "GAUCHE" as const,
      height: 176,
      weight: 68,
      club: "Diambars FC",
      previousClub: null,
      number: 8,
      bio: "Milieu de terrain complet, reconnu pour sa vision de jeu et sa qualité de passe au sein de l'effectif de Diambars FC.",
    },
    {
      firstName: "Adama",
      lastName: "Kone",
      nationality: "Sénégalaise",
      flag: "🇸🇳",
      birthDate: new Date("2008-05-21"),
      position: "AILIER_GAUCHE" as const,
      secondaryPosition: null,
      strongFoot: "DROIT" as const,
      height: 173,
      weight: 64,
      club: "ASC Linguère",
      previousClub: null,
      number: 11,
      bio: "Ailier rapide et technique, l'une des grandes promesses du football sénégalais formé à Saint-Louis.",
    },
    {
      firstName: "Cheikh",
      lastName: "Fall",
      nationality: "Sénégalaise",
      flag: "🇸🇳",
      birthDate: new Date("2005-09-30"),
      position: "GARDIEN" as const,
      secondaryPosition: null,
      strongFoot: "DROIT" as const,
      height: 189,
      weight: 82,
      club: "Casa Sports",
      previousClub: "Jaraaf",
      number: 1,
      bio: "Gardien impressionnant par sa taille et ses réflexes, pilier de la défense du Casa Sports de Ziguinchor.",
    },
    {
      firstName: "Aliou",
      lastName: "Cissé Jr",
      nationality: "Sénégalaise",
      flag: "🇸🇳",
      birthDate: new Date("2007-01-18"),
      position: "DEFENSEUR_CENTRAL" as const,
      secondaryPosition: null,
      strongFoot: "DROIT" as const,
      height: 185,
      weight: 78,
      club: "Teungueth FC",
      previousClub: null,
      number: 4,
      bio: "Défenseur central solide dans les duels, capitaine de sa catégorie d'âge à Teungueth FC de Rufisque.",
    },
    {
      firstName: "Moussa",
      lastName: "Camara",
      nationality: "Malienne",
      flag: "🇲🇱",
      birthDate: new Date("2006-07-09"),
      position: "LATERAL_DROIT" as const,
      secondaryPosition: null,
      strongFoot: "DROIT" as const,
      height: 174,
      weight: 66,
      club: "Stade Malien",
      previousClub: null,
      number: 2,
      bio: "Latéral offensif malien détecté lors d'un tournoi régional, connu pour ses montées rapides sur le couloir droit.",
    },
  ];

  const players = [];
  for (const data of playersData) {
    const slug = slugify(`${data.firstName} ${data.lastName}`);
    const player = await prisma.player.upsert({
      where: { slug },
      update: {},
      create: {
        ...data,
        slug,
        photo: `https://i.pravatar.cc/400?u=${slug}`,
        status: "PUBLISHED",
      },
    });
    players.push(player);
  }

  for (const player of players) {
    const existingStats = await prisma.playerStat.findFirst({ where: { playerId: player.id } });
    if (!existingStats) {
      await prisma.playerStat.create({
        data: {
          playerId: player.id,
          competition: "Ligue 1 Sénégal",
          season: "2025/2026",
          matches: 18 + Math.floor(Math.random() * 6),
          goals: Math.floor(Math.random() * 12),
          assists: Math.floor(Math.random() * 8),
          minutesPlayed: 1200 + Math.floor(Math.random() * 500),
        },
      });
    }
  }

  // ---------------------------------------------------------------------
  // Videos
  // ---------------------------------------------------------------------
  const videosData = [
    {
      title: "Interview exclusive : Mamadou Diop se confie sur ses ambitions",
      description: "Le jeune attaquant de Génération Foot revient sur son parcours et ses objectifs pour la saison.",
      category: "INTERVIEWS" as const,
      platform: "YOUTUBE" as const,
      playerSlug: "mamadou-diop",
    },
    {
      title: "Micro-trottoir : les supporters de Dakar réagissent à la victoire des Lions",
      description: "Ambiance et réactions dans les rues de Dakar après la qualification des Lions de la Teranga.",
      category: "MICRO_TROTTOIRS" as const,
      platform: "TIKTOK" as const,
    },
    {
      title: "Reportage : une journée à l'académie Diambars FC",
      description: "Immersion au cœur du centre de formation de Saly, entre études et entraînements.",
      category: "REPORTAGES" as const,
      platform: "YOUTUBE" as const,
    },
    {
      title: "Débat : quel avenir pour le football sénégalais ?",
      description: "Nos consultants échangent sur les perspectives de développement du football local.",
      category: "DEBATS" as const,
      platform: "FACEBOOK" as const,
    },
    {
      title: "Highlights : le triplé de Mamadou Diop face au Jaraaf",
      description: "Retour en images sur la performance XXL de l'attaquant de Génération Foot.",
      category: "HIGHLIGHTS" as const,
      platform: "YOUTUBE" as const,
      playerSlug: "mamadou-diop",
    },
    {
      title: "Short : le plus beau but de la semaine en Ligue 1 Sénégal",
      description: "Une réalisation exceptionnelle à ne pas manquer.",
      category: "SHORTS" as const,
      platform: "INSTAGRAM" as const,
    },
  ];

  for (const [videoIndex, data] of videosData.entries()) {
    const existing = await prisma.video.findFirst({ where: { title: data.title } });
    const player = data.playerSlug
      ? players.find((p) => p.slug === data.playerSlug)
      : undefined;
    const thumbnail = pickImage(VIDEO_THUMBNAILS, videoIndex);

    if (existing) {
      await prisma.video.update({ where: { id: existing.id }, data: { thumbnail } });
      continue;
    }

    await prisma.video.create({
      data: {
        title: data.title,
        description: data.description,
        thumbnail,
        platform: data.platform,
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        category: data.category,
        status: "PUBLISHED",
        publishedAt: new Date(),
        playerId: player?.id,
      },
    });
  }

  // ---------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------
  const eventsData = [
    {
      name: "Tournoi FMA.SPORT Édition 2026",
      location: "Stade Iba Mar Diop, Dakar",
      price: "2000 FCFA",
      registrationConditions: "Ouvert aux joueurs U15 et U17 licenciés dans un club sénégalais.",
      contact: "footballmediaafriquesport@gmail.com",
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
    },
    {
      name: "Détection FMA.SPORT — Thiès",
      location: "Stade Lat Dior, Thiès",
      price: "Gratuit",
      registrationConditions: "Ouvert aux joueurs de 14 à 19 ans, sur inscription préalable.",
      contact: "footballmediaafriquesport@gmail.com",
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20),
    },
  ];

  for (const [eventIndex, data] of eventsData.entries()) {
    const slug = slugify(data.name);
    await prisma.event.upsert({
      where: { slug },
      update: { poster: pickImage(EVENT_POSTER_IMAGES, eventIndex) },
      create: {
        name: data.name,
        slug,
        date: data.date,
        location: data.location,
        price: data.price,
        registrationConditions: data.registrationConditions,
        contact: data.contact,
        poster: pickImage(EVENT_POSTER_IMAGES, eventIndex),
        status: "PUBLISHED",
      },
    });
  }

  // ---------------------------------------------------------------------
  // Partners
  // ---------------------------------------------------------------------
  const partnersData = ["Orange Sénégal", "Sonatel Academy", "Air Sénégal"];
  for (const name of partnersData) {
    const existing = await prisma.partner.findFirst({ where: { name } });
    if (!existing) {
      await prisma.partner.create({
        data: {
          name,
          logoUrl: `https://picsum.photos/seed/${slugify(name)}/200/100`,
          active: true,
        },
      });
    }
  }

  // ---------------------------------------------------------------------
  // Advertisements (demo)
  // ---------------------------------------------------------------------
  const adsData: {
    title: string;
    placement: "HOME" | "ACTUALITES" | "FOOTER" | "VIDEOS";
    mediaUrl?: string;
    linkUrl?: string;
  }[] = [
    {
      title: "JOJ Dakar 2026 — Les Jeux Olympiques de la Jeunesse arrivent au Sénégal",
      placement: "HOME",
      mediaUrl: unsplash("photo-1570651403445-54c2b0f568c0", 1200, 675),
      linkUrl: "https://www.dakar2026.sn",
    },
    { title: "Orange Sénégal — Partenaire officiel", placement: "HOME" },
    { title: "Sonatel Academy — Formation digitale des jeunes talents", placement: "ACTUALITES" },
    { title: "Air Sénégal — Voyagez avec les Lions", placement: "FOOTER" },
  ];
  for (const ad of adsData) {
    const existing = await prisma.advertisement.findFirst({ where: { title: ad.title } });
    if (!existing) {
      await prisma.advertisement.create({
        data: {
          title: ad.title,
          format: "BANNER",
          placement: ad.placement,
          mediaUrl: ad.mediaUrl ?? pickImage(ARTICLE_COVER_IMAGES, ad.title.length),
          linkUrl: ad.linkUrl ?? "https://fmasport.com/publicite",
          active: true,
        },
      });
    }
  }

  console.log("Seed terminé.");
  console.log(`Compte admin : admin@fmasport.test / FmaSport2026!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
