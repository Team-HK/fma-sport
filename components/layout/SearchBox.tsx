"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react";

export function SearchBox() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/recherche?q=${encodeURIComponent(query.trim())}`);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={open ? "Fermer la recherche" : "Rechercher"}
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted"
      >
        {open ? <X size={20} aria-hidden="true" /> : <Search size={20} aria-hidden="true" />}
      </button>

      {open && (
        <form
          onSubmit={handleSubmit}
          role="search"
          className="absolute right-0 top-full z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-lg border border-border bg-card p-2 shadow-lg"
        >
          <label htmlFor="site-search" className="sr-only">
            Rechercher un joueur, une actualité...
          </label>
          <input
            id="site-search"
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un joueur, une actualité..."
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </form>
      )}
    </div>
  );
}
