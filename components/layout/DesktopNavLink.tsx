"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function DesktopNavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative block py-5 text-[13px] font-semibold uppercase tracking-wide text-foreground transition-colors hover:text-accent",
        "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-accent after:transition-transform after:duration-200",
        isActive ? "text-accent after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"
      )}
    >
      {label}
    </Link>
  );
}
