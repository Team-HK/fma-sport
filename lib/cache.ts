import { revalidateTag, unstable_cache } from "next/cache";

/** Every cached public read carries this tag; admin changes expire it at once. */
export const PUBLIC_CONTENT_TAG = "public-content";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

/**
 * Caches a read-only database query across requests (default 5 minutes).
 * Most public pages read `searchParams` and so can't be statically cached; the
 * database round-trip (a remote Postgres from a serverless function) is what
 * makes them slow, so the query result is cached instead.
 *
 * The cache stores JSON, so Date values are revived on the way out.
 */
export function cachedQuery<A extends unknown[], R>(
  name: string,
  query: (...args: A) => Promise<R>,
  revalidateSeconds = 300
): (...args: A) => Promise<R> {
  const cached = unstable_cache(
    async (...args: A) => JSON.stringify((await query(...args)) ?? null),
    ["public-query", name],
    { tags: [PUBLIC_CONTENT_TAG], revalidate: revalidateSeconds }
  );

  return async (...args: A) => {
    const json = await cached(...args);
    return JSON.parse(json, (_key, value) =>
      typeof value === "string" && ISO_DATE.test(value) ? new Date(value) : value
    ) as R;
  };
}

/** Called by admin actions after a change: the public site refetches immediately. */
export function expirePublicContent() {
  revalidateTag(PUBLIC_CONTENT_TAG, { expire: 0 });
}
