"use client";

import { useRouter, usePathname } from "next/navigation";

export function AdminMobileNav({
  items,
}: {
  items: readonly { href: string; label: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const current = items.find((item) => pathname.startsWith(item.href))?.href ?? items[0].href;

  return (
    <label className="block md:hidden">
      <span className="sr-only">Navigation admin</span>
      <select
        value={current}
        onChange={(e) => router.push(e.target.value)}
        className="w-full cursor-pointer rounded-[10px] border border-border bg-card px-4 py-3 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
      >
        {items.map((item) => (
          <option key={item.href} value={item.href}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}
