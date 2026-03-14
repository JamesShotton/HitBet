import "./globals.css";
import Providers from "./providers";
import NavBar from "./ui/NavBar";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "HitBet — Live Arbitrage Betting Feed | Guaranteed Profit",
  description:
    "HitBet scans 40+ UK sportsbooks every 30 seconds to find real arbitrage opportunities. Get exact stake splits, step-by-step placement cards and lock in guaranteed profit — no luck required.",
  keywords:
    "arbitrage betting, arb betting UK, sports arbitrage, guaranteed profit betting, arb finder, betting arbitrage tool, sure bet finder UK",
  authors: [{ name: "HitBet" }],
  creator: "HitBet",
  publisher: "HitBet",
  metadataBase: new URL("https://hitbet.to"),
  alternates: {
    canonical: "https://hitbet.to",
  },
  verification: {
    google: "cT44bn1rSLXFsXve5BMbHh-GpD_e8TOfc91mHLlS-50",
  },
  openGraph: {
    type: "website",
    url: "https://hitbet.to",
    title: "HitBet — Live Arbitrage Betting Feed",
    description:
      "Scan 40+ sportsbooks in real time. Find guaranteed profit arbitrage opportunities with exact stake splits. Try free for 7 days.",
    siteName: "HitBet",
    images: [
      {
        url: "https://hitbet.to/og-image.png",
        width: 1200,
        height: 630,
        alt: "HitBet — Live Arbitrage Betting Feed",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HitBet — Live Arbitrage Betting Feed",
    description:
      "Scan 40+ sportsbooks in real time. Guaranteed profit, pure maths.",
    images: ["https://hitbet.to/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
    shortcut: "/favicon.ico",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="bgGlow" aria-hidden />
          <div className="bgNoise" aria-hidden />
          <div className="scanlines" aria-hidden />

          <div className="navShell">
            <header className="header">
              <NavBar />
            </header>
          </div>

          <div className="pageShell">
            <main className="pageMain">{children}</main>
            <div className="footerShell">
              <footer className="footer">
                <div className="footerInner">
                  <div className="small">
                    Informational tool only. Always verify markets, odds, rules,
                    and settlement conditions before placing bets.
                  </div>
                  <div className="small muted">
                    © {new Date().getFullYear()} HitBet
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
