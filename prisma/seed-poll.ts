/**
 * Creates an example poll (clearly fictional) so the voting flow can be tried
 * from the back-office. It shows the three question types a poll can mix:
 * single choice, ranked top-N and multiple unranked choices.
 *
 * Safe to run twice: it does nothing when the poll already exists, and it
 * never deletes anything.
 *
 *   npm run seed:poll
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SLUG = "sondage-exemple";

const questions = [
  {
    title: "Quel est le meilleur joueur du mois ?",
    picks: 1,
    ranked: true,
    options: [
      ["Ibrahima Ndiaye", "Dakar Sacré-Cœur"],
      ["Moussa Diallo", "Teungueth FC"],
      ["Cheikh Sarr", "Génération Foot"],
      ["Abdou Faye", "AS Pikine"],
    ],
  },
  {
    title: "Top 3 des meilleurs buteurs",
    picks: 3,
    ranked: true,
    options: [
      ["Mamadou Gueye", "Jaraaf"],
      ["Pape Thiam", "Casa Sports"],
      ["Omar Ba", "Guédiawaye FC"],
      ["Lamine Cissé", "US Gorée"],
      ["Assane Mbaye", "Diambars"],
      ["Babacar Seck", "Stade de Mbour"],
    ],
  },
  {
    title: "Quels contenus voulez-vous voir en plus ? (2 choix)",
    picks: 2,
    ranked: false,
    allowWriteIn: true,
    options: [
      ["Interviews de joueurs", null],
      ["Reportages terrain", null],
      ["Analyses tactiques", null],
      ["Détection de jeunes talents", null],
    ],
  },
] as const;

async function main() {
  const existing = await prisma.poll.findUnique({ where: { slug: SLUG } });
  if (existing) {
    console.log(`Le sondage "${existing.title}" existe déjà (${existing.id}). Rien à faire.`);
    return;
  }

  const poll = await prisma.poll.create({
    data: {
      title: "Sondage de la communauté (exemple)",
      slug: SLUG,
      description:
        "Un sondage d'exemple pour tester le vote : un seul vote par personne. Modifiez-le ou supprimez-le depuis le back-office.",
      status: "OPEN",
      resultsVisibility: "AFTER_VOTE",
      identification: "NONE",
      questions: {
        create: questions.map((q, qi) => ({
          title: q.title,
          picks: q.picks,
          ranked: q.ranked,
          allowWriteIn: "allowWriteIn" in q ? q.allowWriteIn : false,
          order: qi,
          options: {
            create: q.options.map(([name, club], oi) => ({ name, club, order: oi })),
          },
        })),
      },
    },
  });
  console.log(`Sondage créé : ${poll.title} -> /sondages/${poll.slug}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
