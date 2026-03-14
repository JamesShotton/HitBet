import "./globals.css";
import Providers from "./providers";
import NavBar from "./ui/NavBar";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "HitBet — Live Arbitrage Feed",
  description:
    "Scan 40+ sportsbooks in real time. Guaranteed profit, pure maths.",
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
