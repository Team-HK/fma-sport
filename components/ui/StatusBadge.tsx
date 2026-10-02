import { cn } from "@/lib/utils";

export type StatusTone = "success" | "warning" | "destructive" | "neutral" | "info";

const toneClasses: Record<StatusTone, string> = {
  success: "bg-success-soft text-success-soft-foreground",
  warning: "bg-warning-soft text-warning-soft-foreground",
  destructive: "bg-destructive-soft text-destructive-soft-foreground",
  neutral: "bg-neutral-soft text-neutral-soft-foreground",
  info: "bg-muted text-foreground",
};

export function StatusBadge({
  tone,
  children,
  className,
}: {
  tone: StatusTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
