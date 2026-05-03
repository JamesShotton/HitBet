import type { ReactNode } from "react";

export const metadata = {
  title: "How to Arb Without Getting Banned — Stealth Guide",
  description:
    "The complete guide to staying under the radar. Stake sizing, timing, account management and long-term strategy to protect your bookmaker accounts while arb betting.",
  alternates: { canonical: "https://hitbet.to/guide" },
  openGraph: {
    title: "How to Arb Without Getting Banned | HitBet Stealth Guide",
    description:
      "Stake sizing, timing, account management and long-term strategy to keep your bookmaker accounts open.",
    url: "https://hitbet.to/guide",
  },
};

export default function GuideLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
