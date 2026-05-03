import type { ReactNode } from "react";

export const metadata = {
  title: "Long Run — Live Value Betting & Positive EV Feed",
  description:
    "Live positive expected value bets where soft bookmakers have overpriced outcomes against sharp exchange prices. Edge-based betting that compounds into consistent profit over volume.",
  alternates: { canonical: "https://hitbet.to/long-run" },
  openGraph: {
    title: "Long Run — Live Value Betting & Positive EV Feed | HitBet",
    description:
      "Live positive EV bets against sharp exchange prices. Edge compounds into consistent profit over volume.",
    url: "https://hitbet.to/long-run",
  },
};

export default function LongRunLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
