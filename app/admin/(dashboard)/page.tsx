import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Newspaper, Users, Video, Mail, Eye, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [articleCount, candidacyCount, playerCount, messageCount, viewsAgg, videoCount] =
    await Promise.all([
      prisma.article.count(),
      prisma.candidacy.count({ where: { status: "PENDING" } }),
      prisma.player.count(),
      prisma.contactMessage.count({ where: { read: false } }),
      prisma.article.aggregate({ _sum: { views: true } }),
      prisma.video.count(),
    ]);

  const stats = [
    { label: "Articles", value: articleCount, icon: Newspaper },
    { label: "Candidatures en attente", value: candidacyCount, icon: FileText },
    { label: "Talents publiés", value: playerCount, icon: Users },
    { label: "Vidéos", value: videoCount, icon: Video },
    { label: "Messages non lus", value: messageCount, icon: Mail },
    { label: "Vues cumulées", value: viewsAgg._sum.views ?? 0, icon: Eye },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">Tableau de bord</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="flex items-center gap-4 p-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
              <stat.icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
