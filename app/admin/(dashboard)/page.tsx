import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import {
  Newspaper,
  Users,
  Video,
  Mail,
  Eye,
  FileText,
  CalendarDays,
  Contact2,
  Plus,
  ArrowRight,
} from "lucide-react";
import { DonutChart } from "@/components/admin/DonutChart";
import { Sparkline } from "@/components/admin/Sparkline";
import { ARTICLE_CATEGORY_LABELS } from "@/lib/constants";
import { statusMeta } from "@/lib/admin-ui";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CHART_COLORS = [
  "var(--color-primary)",
  "var(--color-accent)",
  "#71717a",
  "var(--color-success)",
  "#d97706",
  "#2563eb",
  "#8b5cf6",
  "#ec4899",
];

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: "var(--color-success)",
  SCHEDULED: "#2563eb",
  DRAFT: "#a1a1aa",
};

function monthsBack(n: number): { key: string; label: string }[] {
  const months: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("fr-FR", { month: "short" }),
    });
  }
  return months;
}

function bucketByMonth(dates: Date[], buckets: { key: string; label: string }[]): number[] {
  const counts = new Map(buckets.map((b) => [b.key, 0]));
  for (const date of dates) {
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return buckets.map((b) => counts.get(b.key) ?? 0);
}

const QUICK_ACTIONS = [
  { href: "/admin/articles/new", label: "Nouvel article", icon: Newspaper },
  { href: "/admin/joueurs/new", label: "Nouveau joueur", icon: Users },
  { href: "/admin/evenements/new", label: "Nouvel événement", icon: CalendarDays },
  { href: "/admin/equipe/new", label: "Nouveau membre", icon: Contact2 },
];

export default async function AdminDashboardPage() {
  const session = await auth();
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const liveArticle = { deletedAt: null };
  const [
    articleCount,
    candidacyCount,
    playerCount,
    messageCount,
    viewsAgg,
    videoCount,
    teamCount,
    upcomingEventCount,
    articlesByCategory,
    articlesByStatus,
    recentArticleDates,
    recentPlayerDates,
    pendingCandidacies,
    unreadMessages,
    upcomingEvents,
  ] = await Promise.all([
    prisma.article.count({ where: liveArticle }),
    prisma.candidacy.count({ where: { status: "PENDING" } }),
    prisma.player.count({ where: { status: "PUBLISHED", deletedAt: null } }),
    prisma.contactMessage.count({ where: { read: false, deletedAt: null } }),
    prisma.article.aggregate({ where: liveArticle, _sum: { views: true } }),
    prisma.video.count({ where: { deletedAt: null } }),
    prisma.teamMember.count({ where: { deletedAt: null } }),
    prisma.event.count({ where: { deletedAt: null, date: { gte: now } } }),
    prisma.article.groupBy({ by: ["category"], where: liveArticle, _count: { _all: true } }),
    prisma.article.groupBy({ by: ["status"], where: liveArticle, _count: { _all: true } }),
    prisma.article.findMany({
      where: { ...liveArticle, createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
    prisma.player.findMany({
      where: { deletedAt: null, createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
    prisma.candidacy.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, firstName: true, lastName: true, createdAt: true },
    }),
    prisma.contactMessage.findMany({
      where: { read: false, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, fullName: true, subject: true, createdAt: true },
    }),
    prisma.event.findMany({
      where: { deletedAt: null, date: { gte: now } },
      orderBy: { date: "asc" },
      take: 4,
      select: { id: true, name: true, date: true, location: true, _count: { select: { registrations: true } } },
    }),
  ]);

  const months = monthsBack(6);
  const articleTrend = bucketByMonth(recentArticleDates.map((a) => a.createdAt), months);
  const playerTrend = bucketByMonth(recentPlayerDates.map((p) => p.createdAt), months);

  const stats = [
    { label: "Articles", value: articleCount, icon: Newspaper, color: "var(--color-primary)", trend: articleTrend, href: "/admin/articles" },
    { label: "Talents publiés", value: playerCount, icon: Users, color: "var(--color-success)", trend: playerTrend, href: "/admin/joueurs" },
    { label: "Candidatures en attente", value: candidacyCount, icon: FileText, color: "var(--color-accent)", href: "/admin/joueurs" },
    { label: "Messages non lus", value: messageCount, icon: Mail, color: "#d97706", href: "/admin/messages" },
    { label: "Vidéos", value: videoCount, icon: Video, color: "#2563eb", href: "/admin/videos" },
    { label: "Événements à venir", value: upcomingEventCount, icon: CalendarDays, color: "#0891b2", href: "/admin/evenements" },
    { label: "Membres de l'équipe", value: teamCount, icon: Contact2, color: "#71717a", href: "/admin/equipe" },
    { label: "Vues cumulées", value: (viewsAgg._sum.views ?? 0).toLocaleString("fr-FR"), icon: Eye, color: "#8b5cf6" },
  ];

  const categoryChartData = articlesByCategory
    .sort((a, b) => b._count._all - a._count._all)
    .map((row, i) => ({
      label: ARTICLE_CATEGORY_LABELS[row.category] ?? row.category,
      value: row._count._all,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));

  const statusChartData = articlesByStatus.map((row) => ({
    label: statusMeta(row.status).label,
    value: row._count._all,
    color: STATUS_COLORS[row.status] ?? "#a1a1aa",
  }));

  const firstName = session?.user?.name?.split(" ")[0];
  const today = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Tableau de bord</h1>
          <p className="mt-1 text-sm capitalize text-muted-foreground">
            {firstName ? `Bonjour ${firstName} · ` : ""}
            {today}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const content = (
            <>
              <div className="flex items-center justify-between gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `color-mix(in srgb, ${stat.color} 12%, transparent)`, color: stat.color }}
                >
                  <stat.icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                {stat.trend && <Sparkline data={stat.trend} color={stat.color} width={72} height={26} />}
              </div>
              <p className="mt-3 text-2xl font-bold leading-tight text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </>
          );
          return stat.href ? (
            <Link
              key={stat.label}
              href={stat.href}
              className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/30"
            >
              {content}
            </Link>
          ) : (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
              {content}
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <ActivityPanel title="Candidatures à traiter" href="/admin/joueurs" empty="Aucune candidature en attente.">
          {pendingCandidacies.map((c) => (
            <ActivityItem
              key={c.id}
              href={`/admin/joueurs/candidatures/${c.id}`}
              title={`${c.firstName} ${c.lastName}`}
              meta={`Reçue le ${formatDate(c.createdAt)}`}
            />
          ))}
        </ActivityPanel>
        <ActivityPanel title="Messages non lus" href="/admin/messages" empty="Aucun message non lu.">
          {unreadMessages.map((m) => (
            <ActivityItem
              key={m.id}
              href="/admin/messages"
              title={m.subject}
              meta={`${m.fullName} · ${formatDate(m.createdAt)}`}
            />
          ))}
        </ActivityPanel>
        <ActivityPanel title="Prochains événements" href="/admin/evenements" empty="Aucun événement à venir.">
          {upcomingEvents.map((e) => (
            <ActivityItem
              key={e.id}
              href="/admin/evenements"
              title={e.name}
              meta={`${formatDate(e.date)} · ${e._count.registrations} inscrit${e._count.registrations > 1 ? "s" : ""}`}
            />
          ))}
        </ActivityPanel>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <DonutChart title="Articles par catégorie" data={categoryChartData} />
        </Card>
        <Card className="p-6">
          <DonutChart title="Articles par statut" data={statusChartData} />
        </Card>
      </div>
    </div>
  );
}

function ActivityPanel({
  title,
  href,
  empty,
  children,
}: {
  title: string;
  href: string;
  empty: string;
  children: React.ReactNode[];
}) {
  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <Link href={href} className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-accent">
          Tout voir <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
      {children.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="divide-y divide-border">{children}</ul>
      )}
    </section>
  );
}

function ActivityItem({ href, title, meta }: { href: string; title: string; meta: string }) {
  return (
    <li>
      <Link href={href} className="block px-4 py-2.5 transition-colors hover:bg-muted">
        <span className="block truncate text-sm font-medium text-foreground">{title}</span>
        <span className="block truncate text-xs text-muted-foreground">{meta}</span>
      </Link>
    </li>
  );
}
