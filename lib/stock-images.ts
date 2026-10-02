// Curated, verified-reachable football photography from Unsplash (free license)
// used as realistic placeholder media across the site until real FMA SPORT
// photos/videos are uploaded by the editorial team.

export function unsplash(id: string, w: number, h: number) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
}

export const ARTICLE_COVER_IMAGES = [
  "photo-1652665314612-c48e10a01598", // African players, match action (unity theme)
  "photo-1485110168560-69d4ac37b23e", // boy smiling holding a football
  "photo-1722978687695-212eecfa4cbe", // group of young African men playing football
  "photo-1652664845183-c6083bc286fc", // youth football team, Conakry, Guinée
  "photo-1751394210161-fb7e64c0ea1a", // player dribbling on a green pitch
  "photo-1570651403445-54c2b0f568c0", // drapeau du Sénégal, Dakar
].map((id) => unsplash(id, 1200, 675));

export const VIDEO_THUMBNAILS = [
  "photo-1652665314612-c48e10a01598",
  "photo-1722978687695-212eecfa4cbe",
  "photo-1652664845183-c6083bc286fc",
  "photo-1751394210161-fb7e64c0ea1a",
].map((id) => unsplash(id, 640, 360));

export const EVENT_POSTER_IMAGES = [
  "photo-1652665314612-c48e10a01598",
  "photo-1652664845183-c6083bc286fc",
  "photo-1570651403445-54c2b0f568c0",
].map((id) => unsplash(id, 800, 1000));

export const HERO_IMAGE = unsplash("photo-1722978687695-212eecfa4cbe", 1920, 1080);

export function pickImage(images: string[], seed: number) {
  return images[Math.abs(seed) % images.length];
}
