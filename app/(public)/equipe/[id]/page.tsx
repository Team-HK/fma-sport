import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, UserRound } from "lucide-react";
import { getVisibleTeamMember } from "@/lib/queries";

export const revalidate = 300;

// Render each page on its first visit, then serve it from the cache and refresh
// it in the background (ISR). Without this the page is rebuilt on every request.
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const member = await getVisibleTeamMember(id).catch(() => null);
  if (!member) return { title: "Membre introuvable" };
  return {
    title: `${member.name} — ${member.role}`,
    description: member.bio?.slice(0, 160) || `${member.name}, ${member.role} chez FMA SPORT.`,
  };
}

export default async function TeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await getVisibleTeamMember(id).catch(() => null);
  if (!member) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/equipe"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Retour à l&apos;équipe
      </Link>

      <article className="mt-6 grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-start">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
          {member.photo ? (
            <Image
              src={member.photo}
              alt={member.name}
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
              priority
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <UserRound className="h-24 w-24" aria-hidden="true" />
            </div>
          )}
        </div>

        <div>
          {member.department && (
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              {member.department}
            </p>
          )}
          <h1 className="mt-2 font-heading text-3xl font-bold text-foreground sm:text-4xl">
            {member.name}
          </h1>
          <p className="mt-1 text-lg text-muted-foreground">{member.role}</p>

          <div className="mt-6 border-t border-border pt-6">
            {member.bio ? (
              <div className="space-y-4 text-base leading-relaxed text-foreground">
                {member.bio.split(/\n{2,}/).map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                {member.name} fait partie de l&apos;équipe FMA SPORT en tant que {member.role.toLowerCase()}.
              </p>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
