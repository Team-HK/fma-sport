"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { FacebookIcon, XIcon } from "@/components/ui/SocialIcons";

export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable, silently ignore
    }
  }

  const shareLinks = [
    {
      key: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.15c-.25-.12-1.45-.7-1.68-.79-.22-.08-.39-.12-.55.13-.16.25-.63.79-.78.95-.14.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.42-.55-.42h-.47c-.16 0-.43.06-.65.31s-.86.84-.86 2.06.88 2.4 1 2.56c.12.16 1.74 2.66 4.22 3.73.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.48-.07 1.45-.59 1.65-1.16.2-.57.2-1.06.14-1.16-.06-.1-.23-.16-.48-.28Z" />
        </svg>
      ),
    },
    {
      key: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      icon: <FacebookIcon className="h-5 w-5" />,
    },
    {
      key: "x",
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      icon: <XIcon className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold text-foreground">Partager :</span>
      {shareLinks.map((link) => (
        <a
          key={link.key}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Partager sur ${link.label}`}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-primary hover:text-on-primary"
        >
          {link.icon}
        </a>
      ))}
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copier le lien"
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-primary hover:text-on-primary"
      >
        {copied ? <Check className="h-5 w-5" aria-hidden="true" /> : <Link2 className="h-5 w-5" aria-hidden="true" />}
      </button>
    </div>
  );
}
