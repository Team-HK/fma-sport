import Link from "next/link";
import { cn } from "@/lib/utils";

export function FilterTabs({
  basePath,
  paramName,
  options,
  active,
}: {
  basePath: string;
  paramName: string;
  options: { value: string; label: string }[];
  active?: string;
}) {
  return (
    <nav aria-label="Filtres" className="-mx-4 overflow-x-auto px-4 pb-1">
      <ul className="flex gap-2 whitespace-nowrap">
        <li>
          <Link
            href={basePath}
            className={cn(
              "inline-block cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              !active
                ? "border-primary bg-primary text-on-primary"
                : "border-border bg-card text-foreground hover:border-primary"
            )}
          >
            Toutes
          </Link>
        </li>
        {options.map((opt) => (
          <li key={opt.value}>
            <Link
              href={`${basePath}?${paramName}=${encodeURIComponent(opt.value)}`}
              className={cn(
                "inline-block cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors",
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
