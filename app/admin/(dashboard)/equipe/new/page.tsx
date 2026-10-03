import { TeamMemberForm } from "../TeamMemberForm";

export default function NewTeamMemberPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground">Nouveau membre</h1>
      <div className="mt-6">
        <TeamMemberForm />
      </div>
    </div>
  );
}
