"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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
        className="flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-primary xl:px-3"
      >
        {label}
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={cn("transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open && (
        <ul className="absolute left-0 top-full z-50 mt-1 min-w-48 rounded-lg border border-border bg-card p-1.5 shadow-lg">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:text-primary"
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
