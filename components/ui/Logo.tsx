import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  size = 40,
  className,
  onDark = false,
}: {
  size?: number;
  className?: string;
  /** Wrap the logo in a white backing plate for use on dark/colored backgrounds. */
  onDark?: boolean;
}) {
  const image = (
    <Image
      src="/brand/logo.jpg"
      alt="FMA SPORT"
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", !onDark && className)}
      priority
    />
  );

  if (!onDark) return image;

  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-sm", className)}
      style={{ width: size + 12, height: size + 12 }}
    >
      {image}
    </span>
  );
}
