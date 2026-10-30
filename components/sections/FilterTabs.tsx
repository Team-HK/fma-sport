import Link from "next/link";
import { cn } from "@/lib/utils";

export function FilterTabs({
  basePath,
  paramName,
  options,
  active,
  allLabel = "Toutes",
}: {
  basePath: string;
  paramName: string;
  options: { value: string; label: string }[];
  active?: string;
  allLabel?: string;
}) {
  return (
    <nav
      aria-label="Filtres"
      // Fade the right edge on small screens so it is obvious the chips scroll.
      className="-mx-4 overflow-x-auto px-4 pb-1 [mask-image:linear-gradient(to_right,black_calc(100%-28px),transparent)] [scrollbar-width:none] sm:[mask-image:none] [&::-webkit-scrollbar]:hidden"
    >
      <ul className="flex gap-2 whitespace-nowrap">
        <li>
          <Link
            href={basePath}
            className={cn(
              "inline-flex min-h-11 cursor-pointer items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              !active
                ? "border-primary bg-primary text-on-primary"
                : "border-border bg-card text-foreground hover:border-primary"
            )}
          >
            {allLabel}
          </Link>
        </li>
        {options.map((opt) => (
          <li key={opt.value}>
            <Link
              href={`${basePath}?${paramName}=${encodeURIComponent(opt.value)}`}
              className={cn(
                "inline-flex min-h-11 cursor-pointer items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                active === opt.value
                  ? "border-primary bg-primary text-on-primary"
                  : "border-border bg-card text-foreground hover:border-primary"
              )}
            >
              {opt.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
