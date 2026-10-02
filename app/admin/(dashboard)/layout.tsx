import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { LayoutDashboard, Newspaper, Users, Video, CalendarDays, Megaphone, Mail, LogOut, ExternalLink, GalleryHorizontal } from "lucide-react";
import { AdminSidebarLink } from "@/components/admin/AdminSidebarLink";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { Logo } from "@/components/ui/Logo";

const ADMIN_NAV = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/accueil", label: "Carousel d'accueil", icon: GalleryHorizontal },
  { href: "/admin/articles", label: "Articles", icon: Newspaper },
  { href: "/admin/joueurs", label: "Joueurs", icon: Users },
  { href: "/admin/videos", label: "Vidéos", icon: Video },
  { href: "/admin/evenements", label: "Événements", icon: CalendarDays },
  { href: "/admin/publicites", label: "Publicités", icon: Megaphone },
  { href: "/admin/messages", label: "Messages", icon: Mail },
] as const;

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Logo size={36} />
            <span className="font-heading text-sm font-medium tracking-tight text-foreground">
              Espace administrateur
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {session.user.name ?? session.user.email}
            </span>
            <Link
              href="/"
              target="_blank"
              className="flex cursor-pointer items-center gap-1.5 rounded-[10px] px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Voir le site
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-start lg:gap-6 lg:px-8 lg:py-8">
        <AdminMobileNav items={ADMIN_NAV.map(({ href, label }) => ({ href, label }))} />

        <aside className="sticky top-24 hidden h-[calc(100dvh-7rem)] w-60 shrink-0 self-start overflow-y-auto rounded-xl border border-border bg-muted p-3 md:block">
          <nav aria-label="Navigation admin" className="space-y-1">
            {ADMIN_NAV.map((item) => (
              <AdminSidebarLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={<item.icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />}
              />
            ))}
            <div className="my-2 border-t border-border" />
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <button
                type="submit"
                className="flex w-full cursor-pointer items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive-soft"
              >
                <LogOut className="h-4.5 w-4.5" aria-hidden="true" />
                Déconnexion
              </button>
            </form>
          </nav>
        </aside>

        <div className="min-w-0 flex-1 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
