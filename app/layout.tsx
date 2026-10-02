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
    default: "FMA SPORT — L'information football. Les talents de demain.",
    template: "%s | FMA SPORT",
  },
  description:
    "FMA SPORT : actualités football du Sénégal, d'Afrique et du monde, vidéos, jeunes talents et management sportif.",
  openGraph: {
    siteName: "FMA SPORT",
    locale: "fr_FR",
    type: "website",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
