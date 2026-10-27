import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { GroundTheme } from "@/components/providers/GroundTheme";
import { Cursor } from "@/components/ui/Cursor";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SITE } from "@/lib/site";

/**
 * Poppins — Brand Identity V2, Direction One.
 * Semibold for headlines, Light for sub text. 500 carries the UI weights
 * between them. See docs/07-brand-direction-one.md.
 *
 * The logotype face (Nebula Bold) is deliberately NOT loaded: it is licensed,
 * we do not have it, and a wordmark should ship as vector artwork rather than
 * a webfont anyway.
 */
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.headline}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.tagline,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "en_SA",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f0f0f0",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-header-ground="bone"
      className={poppins.variable}
    >
      <body>
        <SmoothScroll>
          <GroundTheme />
          <Cursor />
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
