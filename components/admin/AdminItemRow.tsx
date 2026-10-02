import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function AdminItemRow({
  href,
  thumbnail,
  title,
  meta,
  badges,
  actions,
}: {
  href?: string;
  thumbnail?: string | null;
  title: React.ReactNode;
  meta?: React.ReactNode;
  badges?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <Card className="flex flex-wrap items-center gap-4 p-3.5 sm:flex-nowrap">
      {thumbnail !== undefined && (
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[10px] border border-border bg-muted">
          {thumbnail ? (
            <Image src={thumbnail} alt="" fill sizes="56px" className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageOff className="h-5 w-5" aria-hidden="true" />
            </div>
          )}
        </div>
      )}

      <div className="min-w-0 flex-1">
        {badges && <div className="mb-1 flex flex-wrap items-center gap-1.5">{badges}</div>}
        {href ? (
          <Link href={href} className="block truncate font-medium text-foreground hover:text-primary">
            {title}
          </Link>
        ) : (
          <div className="block truncate font-medium text-foreground">{title}</div>
        )}
        {meta && <p className="mt-0.5 truncate text-xs text-muted-foreground">{meta}</p>}
      </div>

      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </Card>
  );
}
