import Image from "next/image";
import Link from "next/link";
import { UserRound } from "lucide-react";
import type { TeamMember } from "@prisma/client";

export function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <Link
      href={`/equipe/${member.id}`}
      className="group block overflow-hidden rounded-xl border border-border bg-card transition-shadow duration-200 hover:shadow-md"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {member.photo ? (
          <Image
            src={member.photo}
            alt={member.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <UserRound className="h-16 w-16" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-heading text-base font-semibold text-foreground group-hover:text-accent">
          {member.name}
        </h3>
        <p className="text-sm text-muted-foreground">{member.role}</p>
        {member.bio && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{member.bio}</p>}
        <span className="mt-3 inline-block text-xs font-semibold text-accent">Voir le profil →</span>
      </div>
    </Link>
  );
}
