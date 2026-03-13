import "./globals.css";
import Link from "next/link";
import Providers from "./providers";
import AuthButton from "./ui/AuthButton";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body className={inter.className}>
        <Providers>
          <div className="bgGlow" aria-hidden />
          <div className="bgNoise" aria-hidden />
          <div className="scanlines" aria-hidden />

          {/* Nav shell — full viewport width, nav bar inside is max-width contained */}
          <div className="navShell">
            <header className="header">
              <div className="nav">
                <Link href="/" className="brandWrap">
                  <div className="logoDot" />
                  <div className="brandText">
                    <div className="brand">HitBet</div>
                    <div className="tag">Cyber-clarity • Execution-ready</div>
                  </div>
                </Link>
                <nav className="navlinks">
                  <Link className="navLink" href="/">
                    Home
                  </Link>
                  <Link className="navLink" href="/dashboard">
                    Dashboard
                  </Link>
                  <Link className="navLink" href="/guide">
                    Guide
                  </Link>
                  <Link className="navLink" href="/pricing">
                    Plans
                  </Link>
                  <AuthButton />
                </nav>
              </div>
            </header>
          </div>

          {/* Page shell — full width. Each page wraps itself if it wants to be narrow. */}
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
