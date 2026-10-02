export const SITE_URL = "https://fmasport.com";

export const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/actualites", label: "Actualités" },
  { href: "/football-africain", label: "Football africain" },
  { href: "/football-international", label: "Football international" },
  { href: "/videos", label: "Vidéos" },
  { href: "/talents", label: "Nos talents" },
  { href: "/management", label: "Management sportif" },
  { href: "/devenir-joueur", label: "Devenir joueur" },
  { href: "/evenements", label: "Événements" },
  { href: "/contact", label: "Contact" },
] as const;

// Desktop nav bar: same destinations as NAV_LINKS, regrouped into a handful
// of short top-level entries (with dropdowns for related destinations) so
// the bar never overflows, even on smaller laptop screens. "Devenir joueur"
// is promoted to a standalone CTA button for visibility.
export const DESKTOP_NAV_ITEMS = [
  { type: "link", href: "/", label: "Accueil" },
  {
    type: "dropdown",
    label: "Actualités",
    items: [
      { href: "/actualites", label: "Toutes les actualités" },
      { href: "/football-africain", label: "Football africain" },
      { href: "/football-international", label: "Football international" },
      { href: "/videos", label: "Vidéos" },
    ],
  },
  {
    type: "dropdown",
    label: "Talents",
    items: [
      { href: "/talents", label: "Nos talents" },
      { href: "/management", label: "Management sportif" },
    ],
  },
  { type: "link", href: "/evenements", label: "Événements" },
  { type: "link", href: "/contact", label: "Contact" },
] as const;

export const FOOTER_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/actualites", label: "Actualités" },
  { href: "/talents", label: "Nos talents" },
  { href: "/management", label: "Management sportif" },
  { href: "/devenir-joueur", label: "Devenir joueur" },
  { href: "/contact", label: "Contact" },
] as const;

export const LEGAL_LINKS = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/politique-de-confidentialite", label: "Politique de confidentialité" },
  { href: "/conditions-utilisation", label: "Conditions d'utilisation" },
] as const;

export const SOCIAL_LINKS = [
  { href: "https://www.tiktok.com/@fma.sport", label: "TikTok", key: "tiktok" },
  { href: "https://www.facebook.com/fmasport", label: "Facebook", key: "facebook" },
  { href: "https://www.youtube.com/@fmasport", label: "YouTube", key: "youtube" },
  { href: "https://www.instagram.com/fma.sport", label: "Instagram", key: "instagram" },
  { href: "https://www.snapchat.com/add/fmasport", label: "Snapchat", key: "snapchat" },
  { href: "https://x.com/fmasport", label: "X", key: "x" },
] as const;

export const ARTICLE_CATEGORY_LABELS: Record<string, string> = {
  SENEGAL: "Sénégal",
  AFRIQUE: "Afrique",
  INTERNATIONAL: "International",
  MERCATO: "Mercato",
  CAN: "CAN",
  LIGUE_DES_CHAMPIONS: "Ligue des champions",
  JEUNES_TALENTS: "Jeunes talents",
  SELECTIONS_NATIONALES: "Sélections nationales",
};

export const VIDEO_CATEGORY_LABELS: Record<string, string> = {
  INTERVIEWS: "Interviews",
  MICRO_TROTTOIRS: "Micro-trottoirs",
  REPORTAGES: "Reportages",
  ACTUALITES: "Actualités",
  DEBATS: "Débats",
  HIGHLIGHTS: "Highlights",
  SHORTS: "Shorts",
  TALENTS: "Talents",
};

export const VIDEO_PLATFORM_LABELS: Record<string, string> = {
  SITE: "Vidéo importée sur le site",
  YOUTUBE: "YouTube",
  TIKTOK: "TikTok",
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
};

export const POSITION_LABELS: Record<string, string> = {
  GARDIEN: "Gardien",
  DEFENSEUR_CENTRAL: "Défenseur central",
  LATERAL_DROIT: "Latéral droit",
  LATERAL_GAUCHE: "Latéral gauche",
  MILIEU_DEFENSIF: "Milieu défensif",
  MILIEU_CENTRAL: "Milieu central",
  MILIEU_OFFENSIF: "Milieu offensif",
  AILIER_DROIT: "Ailier droit",
  AILIER_GAUCHE: "Ailier gauche",
  AVANT_CENTRE: "Avant-centre",
};

export const STRONG_FOOT_LABELS: Record<string, string> = {
  DROIT: "Droit",
  GAUCHE: "Gauche",
  AMBIDEXTRE: "Ambidextre",
};

export const AFRICAN_COUNTRIES = [
  "Sénégal",
  "Mali",
  "Guinée",
  "Côte d'Ivoire",
  "Maroc",
  "Algérie",
  "Cameroun",
  "Nigeria",
  "Ghana",
  "Afrique du Sud",
] as const;

// Full country list for form dropdowns (nationality, country of residence), African
// nations first since this is the platform's primary audience.
export const COUNTRIES = [
  "Sénégal",
  "Mali",
  "Guinée",
  "Côte d'Ivoire",
  "Maroc",
  "Algérie",
  "Tunisie",
  "Cameroun",
  "Nigeria",
  "Ghana",
  "Afrique du Sud",
  "Burkina Faso",
  "Bénin",
  "Togo",
  "Niger",
  "Guinée-Bissau",
  "Guinée équatoriale",
  "Gambie",
  "Mauritanie",
  "Cap-Vert",
  "Sierra Leone",
  "Liberia",
  "République démocratique du Congo",
  "Congo",
  "Gabon",
  "Tchad",
  "République centrafricaine",
  "Égypte",
  "Libye",
  "Kenya",
  "Éthiopie",
  "Angola",
  "Zambie",
  "Zimbabwe",
  "Mozambique",
  "Rwanda",
  "Burundi",
  "Ouganda",
  "Tanzanie",
  "Madagascar",
  "Comores",
  "Djibouti",
  "Érythrée",
  "Somalie",
  "Soudan",
  "Soudan du Sud",
  "Namibie",
  "Botswana",
  "Lesotho",
  "Eswatini",
  "Malawi",
  "France",
  "Belgique",
  "Espagne",
  "Portugal",
  "Italie",
  "Allemagne",
  "Pays-Bas",
  "Royaume-Uni",
  "États-Unis",
  "Canada",
  "Brésil",
  "Autre",
] as const;

export const INTERNATIONAL_COMPETITIONS = [
  "Premier League",
  "Liga",
  "Ligue 1",
  "Serie A",
  "Bundesliga",
  "Ligue des champions",
  "Europa League",
  "Coupe du monde",
] as const;
