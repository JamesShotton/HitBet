import "./globals.css";
import Providers from "./providers";
import NavBar from "./ui/NavBar";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = {
  title: {
    default: "HitBet — Live Arbitrage Betting | Guaranteed Profit on Every Bet",
    template: "%s | HitBet",
  },
  description:
    "HitBet scans 40+ UK sportsbooks every 30 seconds. Get exact stake splits, step-by-step placement cards and lock in guaranteed profit — no luck required. 24-hour free trial.",
  keywords:
    "arbitrage betting, arb betting UK, sports arbitrage, guaranteed profit betting, sure bet finder UK, arb finder, betting arbitrage tool, value betting UK",
  authors: [{ name: "HitBet" }],
  creator: "HitBet",
  publisher: "HitBet",
  metadataBase: new URL("https://hitbet.to"),
  verification: {
    google: "cT44bn1rSLXFsXve5BMbHh-GpD_e8TOfc91mHLlS-50",
  },
  openGraph: {
    type: "website",
    url: "https://hitbet.to",
    title: "HitBet — Live Arbitrage Betting | Guaranteed Profit on Every Bet",
    description:
      "Scan 40+ UK sportsbooks in real time. Exact stake splits, step-by-step placement. Guaranteed profit, pure maths. Try free 24 hours.",
    siteName: "HitBet",
  },
  twitter: {
    card: "summary_large_image",
    title: "HitBet — Live Arbitrage Betting | Guaranteed Profit",
    description:
      "Scan 40+ sportsbooks in real time. Exact stake splits. Guaranteed profit, pure maths.",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://hitbet.to/#organization",
                  name: "HitBet",
                  url: "https://hitbet.to",
                  logo: "https://hitbet.to/icon-192.png",
                  description:
                    "Live arbitrage betting feed scanning 40+ UK sportsbooks for guaranteed profit opportunities every 30 seconds.",
                },
                {
                  "@type": "WebSite",
                  "@id": "https://hitbet.to/#website",
                  name: "HitBet",
                  url: "https://hitbet.to",
                  publisher: { "@id": "https://hitbet.to/#organization" },
                },
              ],
            }),
          }}
        />
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
