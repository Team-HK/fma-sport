import type { Metadata } from "next";
import { getVisibleTeamMembers } from "@/lib/queries";
import { PageHeader } from "@/components/sections/PageHeader";
import { TeamDepartmentsOverview } from "@/components/sections/TeamDepartmentsOverview";
import { TeamMemberCard } from "@/components/sections/TeamMemberCard";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Notre équipe",
  description: "Découvrez l'équipe FMA SPORT : direction, rédaction, management et production.",
};

export default async function TeamPage() {
  const members = await getVisibleTeamMembers().catch(() => []);

  const groups = new Map<string, typeof members>();
  for (const member of members) {
    const key = member.department || "Équipe";
    groups.set(key, [...(groups.get(key) ?? []), member]);
  }

  return (
    <>
      <PageHeader
        title="Notre équipe"
        description="Les femmes et les hommes qui font vivre FMA SPORT au quotidien : direction, rédaction, management des talents et production de contenus."
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {members.length === 0 ? (
          <>
            <p className="mx-auto max-w-2xl text-center text-muted-foreground">
              FMA SPORT s&apos;organise autour de quatre grands pôles, portés au quotidien par une
              équipe passionnée de football. Les profils détaillés de chacun seront publiés très
              prochainement.
            </p>
            <div className="mt-10">
              <TeamDepartmentsOverview />
            </div>
          </>
        ) : (
          <div className="space-y-12">
            {[...groups.entries()].map(([department, people]) => (
              <section key={department}>
                <h2 className="font-heading text-xl font-semibold text-foreground">{department}</h2>
                <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                  {people.map((person) => (
                    <TeamMemberCard key={person.id} member={person} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
