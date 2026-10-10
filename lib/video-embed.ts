export type VideoSource =
  | { type: "embed"; src: string }
  | { type: "file"; src: string }
  | { type: "link"; src: string };

/** Turns a pasted video URL into something the public page can play. */
export function resolveVideoSource(url: string): VideoSource {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id =
        u.searchParams.get("v") ?? u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{6,})/)?.[1];
      if (id) return { type: "embed", src: `https://www.youtube.com/embed/${id}` };
    }
    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      if (id) return { type: "embed", src: `https://www.youtube.com/embed/${id}` };
    }
    if (/\.(mp4|webm|mov|m4v)$/i.test(u.pathname)) return { type: "file", src: url };
    return { type: "link", src: url };
  } catch {
    return { type: "link", src: url };
  }
}
