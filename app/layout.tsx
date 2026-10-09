import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import { SITE_URL } from "@/lib/constants";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FMA SPORT — Le Média qui vit le foot",
    template: "%s | FMA SPORT",
  },
  description:
    "FMA SPORT : actualités football du Sénégal, d'Afrique et du monde, vidéos, jeunes talents et management sportif.",
  keywords: [
    "FMA SPORT",
    "football Sénégal",
    "actualités football",
    "football africain",
    "jeunes talents football",
    "management sportif",
    "mercato",
    "Lions de la Teranga",
  ],
  applicationName: "FMA SPORT",
  alternates: { canonical: "./" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    siteName: "FMA SPORT",
    locale: "fr_FR",
    type: "website",
    url: SITE_URL,
    images: [{ url: "/brand/logo.jpg", alt: "FMA SPORT" }],
  },
  twitter: {
    card: "summary_large_image",
  },
};

const siteJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "FMA SPORT",
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo.jpg`,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "FMA SPORT",
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${poppins.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
