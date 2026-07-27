import type { Metadata, Viewport } from "next";
import { Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { GroundTheme } from "@/components/providers/GroundTheme";
import { Cursor } from "@/components/ui/Cursor";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SITE } from "@/lib/site";

/**
 * PLACEHOLDER TYPEFACES — pending licensing.
 * Target: PP Neue Montreal (display) + Söhne Mono (meta).
 * Instrument Sans and JetBrains Mono stand in, filling the same roles.
 * See docs/01-design-principles.md.
 */
const display = Instrument_Sans({
  variable: "--font-sans-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono-meta",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
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
  themeColor: "#faf9f6",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-header-ground="bone"
      className={`${display.variable} ${mono.variable}`}
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
