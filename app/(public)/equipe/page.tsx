import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/sections/PageHeader";
import { Card } from "@/components/ui/Card";
import { UserRound } from "lucide-react";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Notre équipe",
  description: "Découvrez l'équipe FMA SPORT : direction, rédaction, management et production.",
};

export default async function TeamPage() {
  const members = await prisma.teamMember.findMany({
    where: { visible: true, deletedAt: null },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  const groups = new Map<string, typeof members>();
  for (const member of members) {
    const key = member.department || "Équipe";
    groups.set(key, [...(groups.get(key) ?? []), member]);
  }

  return (
    <>
      <PageHeader
        title="Notre équipe"
        description="Les femmes et les hommes qui font vivre FMA SPORT au quotidien."
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {members.length === 0 && (
          <p className="text-center text-muted-foreground">
            La présentation de l&apos;équipe sera bientôt disponible.
          </p>
        )}

        <div className="space-y-12">
          {[...groups.entries()].map(([department, people]) => (
            <section key={department}>
              <h2 className="font-heading text-xl font-semibold text-foreground">{department}</h2>
              <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {people.map((person) => (
                  <Card key={person.id} className="p-6 text-center">
                    <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full border border-border bg-muted">
                      {person.photo ? (
                        <Image src={person.photo} alt="" fill sizes="96px" className="object-cover" unoptimized />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <UserRound className="h-10 w-10" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">{person.name}</h3>
                    <p className="text-sm font-medium text-primary">{person.role}</p>
                    {person.bio && <p className="mt-2 text-sm text-muted-foreground">{person.bio}</p>}
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
