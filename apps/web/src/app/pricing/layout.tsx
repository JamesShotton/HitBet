import type { ReactNode } from "react";

export const metadata = {
  title: "Plans & Pricing — Arb Feed from £9.99/wk",
  description:
    "Arbitrage feed from £9.99/wk. Long Run value bets from £14.99/wk. Both plans £19.99/wk. 24-hour free trial on every plan — card required, cancel anytime.",
  alternates: { canonical: "https://hitbet.to/pricing" },
  openGraph: {
    title: "Plans & Pricing | HitBet — Arb Feed from £9.99/wk",
    description:
      "Arbitrage from £9.99/wk. Long Run from £14.99/wk. Both for £19.99/wk. Try free 24 hours.",
    url: "https://hitbet.to/pricing",
  },
};

const pricingSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "HitBet",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  offers: [
    { "@type": "Offer", name: "Arbitrage", price: "9.99", priceCurrency: "GBP", description: "Live arbitrage feed across 40+ UK bookmakers with exact stake splits." },
    { "@type": "Offer", name: "Long Run", price: "14.99", priceCurrency: "GBP", description: "Value betting watchlist with positive EV bets against sharp exchange prices." },
    { "@type": "Offer", name: "Both", price: "19.99", priceCurrency: "GBP", description: "Full arbitrage feed plus Long Run value betting watchlist." },
  ],
};

export default function PricingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema) }} />
      {children}
    </>
  );
}
