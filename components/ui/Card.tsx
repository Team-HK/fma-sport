import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground rounded-xl border border-border shadow-sm transition-shadow duration-200 hover:shadow-md",
        className
      )}
      {...props}
    />
  );
}
