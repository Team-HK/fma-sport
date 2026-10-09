// Headlines from publishers' public RSS feeds. We only show title, source and
// time, linking to the original article — never the article text or images.

export type NewsRegion = "senegal" | "afrique" | "international" | "mercato";

export type NewsItem = {
  title: string;
  url: string;
  source: string;
  publishedAt: Date;
};

const FEEDS: { source: string; url: string; region: NewsRegion }[] = [
  { source: "wiwsport", url: "https://wiwsport.com/feed/", region: "senegal" },
  { source: "RFI Afrique Foot", url: "https://www.rfi.fr/fr/afrique-foot/rss", region: "afrique" },
  { source: "L'Équipe", url: "https://dwh.lequipe.fr/api/edito/rss?path=/Football/", region: "international" },
  { source: "RMC Sport", url: "https://rmcsport.bfmtv.com/rss/football/", region: "international" },
  { source: "Foot Mercato", url: "https://www.footmercato.net/flux-rss", region: "mercato" },
];

const REVALIDATE_SECONDS = 1800;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function decode(text: string) {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function tag(xml: string, name: string) {
  const match = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  return match ? decode(match[1]) : "";
}

function parseRss(xml: string, source: string): NewsItem[] {
  const items = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? [];
  return items.flatMap((item) => {
    const title = tag(item, "title");
    const url = tag(item, "link") || tag(item, "guid");
    const date = new Date(tag(item, "pubDate") || tag(item, "dc:date"));
    if (!title || !/^https?:\/\//.test(url) || Number.isNaN(date.getTime())) return [];
    return [{ title, url, source, publishedAt: date }];
  });
}

async function fetchFeed(feed: (typeof FEEDS)[number]): Promise<NewsItem[]> {
  try {
    const res = await fetch(feed.url, {
      headers: { "User-Agent": "FMA-SPORT/1.0 (+https://www.fmasport.com)" },
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    return parseRss(await res.text(), feed.source);
  } catch {
    return [];
  }
}

export async function getNewsWire(regions: NewsRegion[], limit = 10): Promise<NewsItem[]> {
  const feeds = FEEDS.filter((f) => regions.includes(f.region));
  const all = (await Promise.all(feeds.map(fetchFeed))).flat();
  const cutoff = Date.now() - MAX_AGE_MS;
  const seen = new Set<string>();
  return all
    .filter((item) => item.publishedAt.getTime() >= cutoff && item.publishedAt.getTime() <= Date.now() + 3_600_000)
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .filter((item) => {
      const key = item.title.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit);
}

export const NEWS_SOURCES = FEEDS.map((f) => f.source);
