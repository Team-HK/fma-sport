import { SITE_URL } from "@/lib/constants";

/** Absolute URL for a stored path or URL (needed in JSON-LD and image sitemaps). */
export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}
