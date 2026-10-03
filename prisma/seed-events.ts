const DAY_MS = 1000 * 60 * 60 * 24;

export const EXTRA_EVENTS: {
  name: string;
  location: string;
  price: string;
  registrationConditions: string;
  contact: string;
  date: Date;
  results?: string;
}[] = [
  {
    name: "Masterclass : construire une carrière de footballeur",
    location: "Dakar — lieu communiqué aux inscrits",
    price: "5000 FCFA",
    registrationConditions:
      "Ouverte aux joueurs, parents et éducateurs. Au programme : parcours de formation, rôle de l'agent, contrats, préparation mentale et réseaux sociaux. Places limitées.",
    contact: "footballmediaafriquesport@gmail.com",
    date: new Date(Date.now() + DAY_MS * 28),
  },
  {
    name: "Journée de détection FMA SPORT — Saint-Louis",
    location: "Stade Me Babacar Sèye, Saint-Louis",
    price: "Gratuit",
    registrationConditions:
      "Joueurs nés entre 2007 et 2012. Prévoir crampons, protège-tibias et une pièce d'identité. Inscription en ligne obligatoire.",
    contact: "+221 77 608 23 62",
    date: new Date(Date.now() + DAY_MS * 35),
  },
  {
    name: "Détection FMA SPORT — Conakry",
    location: "Conakry, Guinée — terrain communiqué aux inscrits",
    price: "Gratuit",
    registrationConditions:
      "Première étape guinéenne de la tournée de détection. Joueurs de 15 à 20 ans, licenciés ou non. Inscription préalable obligatoire.",
    contact: "+224 623 09 48 32",
    date: new Date(Date.now() + DAY_MS * 60),
  },
  {
    name: "Tournoi U17 de Casamance",
    location: "Stade Aline Sitoé Diatta, Ziguinchor",
    price: "1000 FCFA par joueur",
    registrationConditions:
      "Équipes de 16 joueurs maximum, catégorie U17. Matchs filmés et analysés par l'équipe FMA SPORT ; les meilleurs profils seront mis en avant sur le site.",
    contact: "footballmediaafriquesport@gmail.com",
    date: new Date(Date.now() + DAY_MS * 75),
  },
  {
    name: "Détection FMA SPORT — Mbour",
    location: "Stade Caroline Faye, Mbour",
    price: "Gratuit",
    registrationConditions: "Joueurs de 14 à 19 ans, sur inscription préalable.",
    contact: "footballmediaafriquesport@gmail.com",
    date: new Date(Date.now() - DAY_MS * 25),
    results:
      "Plus de 120 jeunes joueurs venus de Mbour, Saly, Joal et Thiès ont participé à cette journée. Après les ateliers techniques et deux séries de matchs, 9 profils ont été retenus pour un suivi par FMA SPORT Management. Les joueurs sélectionnés seront recontactés individuellement par notre équipe. Merci aux éducateurs et aux familles pour leur mobilisation.",
  },
];
