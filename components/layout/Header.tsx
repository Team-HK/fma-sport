import Link from "next/link";
import { DESKTOP_NAV_ITEMS, NAV_LINKS, POLLS_LINK, withPollsLink } from "@/lib/constants";
import { getPublicPolls } from "@/lib/polls";
import { MobileNav } from "./MobileNav";
import { SearchBox } from "./SearchBox";
import { NavDropdown } from "./NavDropdown";
import { DesktopNavLink } from "./DesktopNavLink";
import { Logo } from "@/components/ui/Logo";

export async function Header() {
  const hasPolls = ((await getPublicPolls().catch(() => [])) ?? []).length > 0;
  const desktopItems = withPollsLink(DESKTOP_NAV_ITEMS, hasPolls, { type: "link", ...POLLS_LINK } as never);
  const mobileLinks = withPollsLink(NAV_LINKS, hasPolls, POLLS_LINK as never);
  return (
    <header className="sticky top-0 z-40 bg-card/95 shadow-[0_1px_0_0_var(--color-border)] backdrop-blur-md">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Logo size={44} />
          <span className="sr-only">FMA SPORT</span>
        </Link>

        <nav
          aria-label="Navigation principale"
          className="hidden min-w-0 flex-1 justify-center lg:flex"
        >
          <ul className="flex items-center gap-6 xl:gap-8">
            {desktopItems.map((item) =>
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

        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/devenir-joueur"
            className="hidden text-[13px] font-semibold uppercase tracking-wide text-accent transition-colors hover:text-foreground lg:inline"
          >
            Devenir joueur
          </Link>
          <SearchBox />
          <MobileNav links={mobileLinks} />
        </div>
      </div>
    </header>
  );
}
