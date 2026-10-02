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
      className={cn(
        "block rounded-[10px] border-b-2 border-transparent px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted",
        isActive && "border-accent text-primary"
      )}
    >
      {label}
    </Link>
  );
}
