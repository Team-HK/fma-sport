import { WhatsAppIcon } from "@/components/ui/SocialIcons";
import { getSiteSettings } from "@/lib/queries";

const DEFAULT_WHATSAPP = "+221776823628";

export async function WhatsAppFloatButton() {
  const settings = await getSiteSettings().catch(() => null);
  const number = (settings?.whatsapp || DEFAULT_WHATSAPP).replace(/[^\d]/g, "");

  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Discuter sur WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-200 hover:scale-110 hover:shadow-xl"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
