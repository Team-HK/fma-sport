import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[10px] font-medium font-heading transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap";

const variants = {
  primary: "bg-primary text-on-primary hover:bg-secondary",
  secondary:
    "bg-card text-primary border-[1.5px] border-primary hover:bg-muted",
  soft: "bg-muted text-foreground hover:bg-border/60",
  accent: "bg-accent text-on-accent hover:brightness-95",
  ghost: "bg-transparent text-foreground hover:bg-muted",
  destructive: "bg-destructive text-on-destructive hover:opacity-90",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type LinkButtonProps = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export function Button(props: ButtonProps | LinkButtonProps) {
  const { variant = "primary", size = "md", className, children, ...rest } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if ("href" in rest && rest.href) {
    const { href, ...anchorRest } = rest as LinkButtonProps;
    return (
      <Link href={href} className={classes} {...anchorRest}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
