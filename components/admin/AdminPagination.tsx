"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function pageNumbers(current: number, total: number): (number | "...")[] {
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const result: (number | "...")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("...");
    result.push(p);
    prev = p;
  }
  return result;
}

export function AdminPagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function hrefFor(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `${pathname}?${params.toString()}`;
  }

  function go(page: number) {
    router.push(hrefFor(page));
  }

  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => go(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Page précédente"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px] text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>

      {pageNumbers(currentPage, totalPages).map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => go(p)}
            aria-current={p === currentPage ? "page" : undefined}
            className={cn(
              "flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-[10px] px-2.5 text-sm font-medium transition-colors",
              p === currentPage
                ? "bg-primary text-on-primary"
                : "text-foreground hover:bg-muted"
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => go(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Page suivante"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px] text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
