"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, X } from "lucide-react";

export function AdminListToolbar({
  searchPlaceholder = "Rechercher...",
  filters,
}: {
  searchPlaceholder?: string;
  filters?: { param: string; label: string; options: { value: string; label: string }[] }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [, startTransition] = useTransition();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateParam("q", query);
        }}
        className="relative w-full sm:max-w-xs"
      >
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="w-full rounded-[10px] border border-border bg-card py-2.5 pl-9 pr-9 text-sm text-foreground transition-colors duration-200 placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              updateParam("q", "");
            }}
            aria-label="Effacer la recherche"
            className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </form>

      {filters && filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <select
              key={filter.param}
              aria-label={filter.label}
              value={searchParams.get(filter.param) ?? ""}
              onChange={(e) => updateParam(filter.param, e.target.value)}
              className="cursor-pointer rounded-[10px] border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="">{filter.label}</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}
        </div>
      )}
    </div>
  );
}
