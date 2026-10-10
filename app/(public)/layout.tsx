import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloatButton } from "@/components/layout/WhatsAppFloatButton";
import { getSiteSettings } from "@/lib/queries";
import { SITE_URL } from "@/lib/constants";

/** Name variants people (and search engines) may use for the brand. */
const BRAND_ALTERNATE_NAMES = ["FMASPORT", "FMA Sport", "FMA SPORT Sénégal", "fmasport.com"];

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings().catch(() => null);

  const sameAs = [
    settings?.facebookUrl,
    settings?.instagramUrl,
    settings?.tiktokUrl,
    settings?.youtubeUrl,
    settings?.snapchatUrl,
    settings?.xUrl,
  ].filter((url): url is string => Boolean(url));

  const siteJsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "FMA SPORT",
      alternateName: BRAND_ALTERNATE_NAMES,
      url: SITE_URL,
      logo: `${SITE_URL}/brand/logo.jpg`,
      description:
        "FMA SPORT, le média qui vit le foot : actualités, vidéos, jeunes talents et management sportif.",
      address: settings?.address ? { "@type": "PostalAddress", streetAddress: settings.address } : undefined,
      email: settings?.email || undefined,
      telephone: settings?.phone || undefined,
      sameAs: sameAs.length > 0 ? sameAs : undefined,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "FMA SPORT",
      alternateName: BRAND_ALTERNATE_NAMES,
      url: SITE_URL,
      inLanguage: "fr-FR",
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/recherche?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
      />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFloatButton />
    </div>
  );
}
