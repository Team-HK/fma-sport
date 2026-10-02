"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted"
      >
        {open ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
      </button>

      {open && (
        <nav
          aria-label="Menu mobile"
          className="fixed inset-x-0 top-16 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-border bg-card shadow-lg"
        >
          <ul className="flex flex-col p-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
