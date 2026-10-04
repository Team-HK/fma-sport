import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Newspaper, Users, Video, Mail, Eye, FileText } from "lucide-react";
import { DonutChart } from "@/components/admin/DonutChart";
import { Sparkline } from "@/components/admin/Sparkline";
import { ARTICLE_CATEGORY_LABELS } from "@/lib/constants";
import { statusMeta } from "@/lib/admin-ui";

export const dynamic = "force-dynamic";

const CHART_COLORS = [
  "var(--color-primary)",
  "var(--color-accent)",
  "var(--color-secondary)",
  "var(--color-success)",
  "var(--color-warning-soft-foreground)",
  "var(--color-destructive)",
  "#8b5cf6",
  "#ec4899",
];

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

export default async function AdminDashboardPage() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [
    articleCount,
    candidacyCount,
    playerCount,
    messageCount,
    viewsAgg,
    videoCount,
    articlesByCategory,
    articlesByStatus,
    recentArticleDates,
    recentPlayerDates,
  ] = await Promise.all([
    prisma.article.count({ where: { deletedAt: null } }),
    prisma.candidacy.count({ where: { status: "PENDING" } }),
    prisma.player.count({ where: { status: "PUBLISHED", deletedAt: null } }),
    prisma.contactMessage.count({ where: { read: false, deletedAt: null } }),
    prisma.article.aggregate({ where: { deletedAt: null }, _sum: { views: true } }),
    prisma.video.count({ where: { deletedAt: null } }),
    prisma.article.groupBy({ by: ["category"], where: { deletedAt: null }, _count: { _all: true } }),
    prisma.article.groupBy({ by: ["status"], where: { deletedAt: null }, _count: { _all: true } }),
    prisma.article.findMany({
      where: { deletedAt: null, createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
    prisma.player.findMany({
      where: { deletedAt: null, createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
  ]);

  const months = monthsBack(6);
  const articleTrend = bucketByMonth(
    recentArticleDates.map((a) => a.createdAt),
    months
  );
  const playerTrend = bucketByMonth(
    recentPlayerDates.map((p) => p.createdAt),
    months
  );

  const stats = [
    { label: "Articles", value: articleCount, icon: Newspaper, color: "var(--color-primary)", trend: articleTrend },
    { label: "Candidatures en attente", value: candidacyCount, icon: FileText, color: "var(--color-accent)" },
    { label: "Talents publiés", value: playerCount, icon: Users, color: "var(--color-success)", trend: playerTrend },
    { label: "Vidéos", value: videoCount, icon: Video, color: "var(--color-secondary)" },
    { label: "Messages non lus", value: messageCount, icon: Mail, color: "var(--color-destructive)" },
    { label: "Vues cumulées", value: viewsAgg._sum.views ?? 0, icon: Eye, color: "#8b5cf6" },
  ];

  const categoryChartData = articlesByCategory
    .sort((a, b) => b._count._all - a._count._all)
    .map((row, i) => ({
      label: ARTICLE_CATEGORY_LABELS[row.category] ?? row.category,
      value: row._count._all,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));

  const statusChartData = articlesByStatus.map((row, i) => ({
    label: statusMeta(row.status).label,
    value: row._count._all,
    color: CHART_COLORS[(i + 3) % CHART_COLORS.length],
  }));

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">Tableau de bord</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="group p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `color-mix(in srgb, ${stat.color} 15%, transparent)`, color: stat.color }}
                >
                  <stat.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
              {stat.trend && (
                <Sparkline data={stat.trend} color={stat.color} width={90} height={32} />
              )}
            </div>
          </Card>
        ))}
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
