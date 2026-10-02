"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function AdminSidebarLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-on-primary shadow-sm"
          : "text-foreground hover:bg-card hover:shadow-sm"
      )}
    >
      {icon}
      {label}
    </Link>
  );
}
