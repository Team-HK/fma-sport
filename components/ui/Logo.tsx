import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/brand/logo.jpg"
      alt="FMA SPORT"
      width={size}
      height={size}
      className={cn("shrink-0 rounded-full", className)}
      priority
    />
  );
}
