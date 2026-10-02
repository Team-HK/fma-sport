import type { StatusTone } from "@/components/ui/StatusBadge";

export const STATUS_META: Record<string, { label: string; tone: StatusTone }> = {
  // Articles / Videos / generic publish states
  DRAFT: { label: "Brouillon", tone: "neutral" },
  SCHEDULED: { label: "Programmé", tone: "info" },
  PUBLISHED: { label: "Publié", tone: "success" },
  RESULTS_PUBLISHED: { label: "Résultats publiés", tone: "success" },

  // Candidacies
  PENDING: { label: "En attente", tone: "warning" },
  INFO_REQUESTED: { label: "Infos demandées", tone: "info" },
  ACCEPTED: { label: "Acceptée", tone: "success" },
  REJECTED: { label: "Refusée", tone: "destructive" },
};

export function statusMeta(status: string) {
  return STATUS_META[status] ?? { label: status, tone: "neutral" as StatusTone };
}
