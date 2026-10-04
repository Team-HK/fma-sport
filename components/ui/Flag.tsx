// Flag emoji are two regional-indicator symbols; Windows can't render them, so map to an ISO code for an image.
export function flagEmojiToCode(flag: string | null | undefined) {
  if (!flag) return null;
  const letters = [...flag]
    .map((c) => c.codePointAt(0)! - 0x1f1e6)
    .filter((n) => n >= 0 && n < 26)
    .map((n) => String.fromCharCode(97 + n));
  return letters.length === 2 ? letters.join("") : null;
}

export function Flag({ emoji, className = "" }: { emoji: string | null | undefined; className?: string }) {
  const code = flagEmojiToCode(emoji);
  if (!code) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w80/${code}.png`}
      alt=""
      width={40}
      height={30}
      loading="lazy"
      className={`inline-block w-auto rounded-sm align-middle ${className}`}
    />
  );
}
