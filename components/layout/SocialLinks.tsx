import { SOCIAL_LINKS } from "@/lib/constants";
import {
  TikTokIcon,
  FacebookIcon,
  YoutubeIcon,
  InstagramIcon,
  SnapchatIcon,
  XIcon,
} from "@/components/ui/SocialIcons";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  tiktok: TikTokIcon,
  facebook: FacebookIcon,
  youtube: YoutubeIcon,
  instagram: InstagramIcon,
  snapchat: SnapchatIcon,
  x: XIcon,
};

export function SocialLinks({
  className,
  overrides,
}: {
  className?: string;
  overrides?: Partial<Record<string, string | null | undefined>>;
}) {
  return (
    <ul className={cn("flex items-center gap-2", className)}>
      {SOCIAL_LINKS.map((link) => {
        const Icon = ICONS[link.key];
        const href = overrides?.[link.key] || link.href;
        return (
          <li key={link.key}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-foreground transition-colors hover:bg-primary hover:text-on-primary"
            >
              <Icon className="h-4.5 w-4.5" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
