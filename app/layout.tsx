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
    default: "FMA SPORT (FMASPORT) — Le média qui vit le foot",
    template: "%s | FMA SPORT",
  },
  description:
    "FMA SPORT (fmasport.com) : le média football du Sénégal et d'Afrique. Actualités, vidéos, jeunes talents et management sportif.",
  keywords: [
    "FMA SPORT",
    "FMASPORT",
    "fma sport sénégal",
    "fmasport.com",
    "football Sénégal",
    "actualités football",
    "football africain",
    "jeunes talents football",
    "management sportif",
    "mercato",
    "Lions de la Teranga",
  ],
  applicationName: "FMA SPORT",
  // Set these in Vercel once Google Search Console / Bing Webmaster give you a code.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${poppins.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
