// Curated, verified-reachable football photography from Unsplash (free license)
// used as realistic placeholder media across the site until real FMA.SPORT
// photos/videos are uploaded by the editorial team.

function unsplash(id: string, w: number, h: number) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
}

export const ARTICLE_COVER_IMAGES = [
  "photo-1553778263-73a83bab9b0c", // stadium pitch, wide
  "photo-1522778119026-d647f0596c20", // players in action
  "photo-1574629810360-7efbbe195018", // dribbling player
  "photo-1606925797300-0b35e9d1794e", // training session
  "photo-1518091043644-c1d4457512c6", // action shot
  "photo-1543326727-cf6c39e8f84c", // pitch aerial
  "photo-1486286701208-1d58e9338013", // green pitch
  "photo-1470229722913-7c0e2dbbafd3", // stadium field
  "photo-1552318965-6e6be7484ada", // youth soccer
  "photo-1579952363873-27f3bade9f55", // stadium floodlights
  "photo-1517927033932-b3d18e61fb3a", // stadium crowd
  "photo-1560272564-c83b66b1ad12", // ball close-up
].map((id) => unsplash(id, 1200, 675));

export const VIDEO_THUMBNAILS = [
  "photo-1522778119026-d647f0596c20",
  "photo-1574629810360-7efbbe195018",
  "photo-1606925797300-0b35e9d1794e",
  "photo-1518091043644-c1d4457512c6",
  "photo-1552318965-6e6be7484ada",
  "photo-1560272564-c83b66b1ad12",
].map((id) => unsplash(id, 640, 360));

export const EVENT_POSTER_IMAGES = [
  "photo-1553778263-73a83bab9b0c",
  "photo-1579952363873-27f3bade9f55",
  "photo-1517927033932-b3d18e61fb3a",
].map((id) => unsplash(id, 800, 1000));

export const HERO_IMAGE = unsplash("photo-1522778119026-d647f0596c20", 1920, 1080);

export function pickImage(images: string[], seed: number) {
  return images[Math.abs(seed) % images.length];
}
