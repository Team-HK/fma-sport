"use client";

import { useEffect } from "react";

/**
 * Counts a view from the browser. The article page itself is served from the
 * cache (ISR), so the counter can't be incremented while rendering it.
 */
export function ArticleViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `viewed:${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Storage unavailable (private mode): count the view anyway.
    }
    fetch(`/api/articles/${encodeURIComponent(slug)}/view`, { method: "POST", keepalive: true }).catch(
      () => {}
    );
  }, [slug]);

  return null;
}
