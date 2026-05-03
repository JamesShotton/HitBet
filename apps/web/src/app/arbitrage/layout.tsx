import type { ReactNode } from "react";

export const metadata = {
  title: "Live Arb Feed — Real-Time Guaranteed Arbitrage Opportunities",
  description:
    "Real-time arbitrage opportunities across 40+ UK bookmakers. Exact stake splits and step-by-step placement cards. Every bet is guaranteed profit before the event starts.",
  alternates: { canonical: "https://hitbet.to/arbitrage" },
  openGraph: {
    title: "Live Arb Feed | HitBet — Real-Time Guaranteed Arbitrage",
    description:
      "Real-time arbitrage across 40+ UK bookmakers. Exact stake splits, guaranteed profit on every bet.",
    url: "https://hitbet.to/arbitrage",
  },
};

export default function ArbitrageLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
