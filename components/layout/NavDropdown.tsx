"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function NavDropdown({
  label,
  items,
}: {
  label: string;
  items: readonly { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isActive = items.some((item) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative flex cursor-pointer items-center gap-1 py-5 text-[13px] font-semibold uppercase tracking-wide text-foreground transition-colors hover:text-accent",
          "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-accent after:transition-transform after:duration-200",
          isActive || open ? "text-accent after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"
        )}
      >
        {label}
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={cn("transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open && (
        <ul className="absolute left-0 top-full z-50 min-w-56 border-t-2 border-accent bg-card py-2 shadow-md">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-foreground transition-colors hover:text-accent"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
