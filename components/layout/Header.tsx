import Link from "next/link";
import { DESKTOP_NAV_ITEMS } from "@/lib/constants";
import { MobileNav } from "./MobileNav";
import { SearchBox } from "./SearchBox";
import { NavDropdown } from "./NavDropdown";
import { DesktopNavLink } from "./DesktopNavLink";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Logo size={44} />
          <span className="sr-only">FMA SPORT</span>
        </Link>

        <nav
          aria-label="Navigation principale"
          className="hidden min-w-0 flex-1 justify-center lg:flex"
        >
          <ul className="flex items-center gap-1">
            {DESKTOP_NAV_ITEMS.map((item) =>
              item.type === "dropdown" ? (
                <li key={item.label}>
                  <NavDropdown label={item.label} items={item.items} />
                </li>
              ) : (
                <li key={item.href}>
                  <DesktopNavLink href={item.href} label={item.label} />
                </li>
              )
            )}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          <Button href="/devenir-joueur" size="sm" className="hidden lg:inline-flex">
            Devenir joueur
          </Button>
          <SearchBox />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
