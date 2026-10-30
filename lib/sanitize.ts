import sanitizeHtml from "sanitize-html";

/**
 * Whitelist for article bodies written in the admin editor: paragraphs,
 * headings, basic formatting, lists, quotes, links, images and text alignment.
 * Anything else (scripts, iframes, event handlers, inline styles other than
 * text-align) is stripped — before saving and again before rendering.
 */
const ALIGNABLE = ["p", "h2", "h3", "h4", "blockquote", "li"] as const;

export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "a",
      "ul", "ol", "li", "blockquote", "img", "hr", "figure", "figcaption", "code", "pre",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      ...Object.fromEntries(ALIGNABLE.map((tag) => [tag, ["style"]])),
    },
    allowedStyles: {
      "*": { "text-align": [/^(left|right|center|justify)$/] },
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href ?? "";
        const external = /^https?:\/\//i.test(href) && !/^https?:\/\/([a-z0-9-]+\.)*fmasport\.com(\/|$)/i.test(href);
        // Links to other sites open in a new tab and don't pass ranking; links to our own pages stay normal.
        return {
          tagName,
          attribs: external
            ? { ...attribs, rel: "noopener noreferrer nofollow", target: "_blank" }
            : { ...attribs, rel: "noopener" },
        };
      },
    },
  });
}

/** True when the editor content has no text and no image (e.g. "<p></p>"). */
export function isEmptyHtml(html: string): boolean {
  if (/<img\s/i.test(html)) return false;
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().length === 0;
}
