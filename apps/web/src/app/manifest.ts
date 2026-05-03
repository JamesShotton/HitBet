import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HitBet — Live Arbitrage Feed",
    short_name: "HitBet",
    description:
      "Scan 40+ UK sportsbooks for guaranteed arbitrage profit opportunities every 30 seconds.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0f",
    theme_color: "#6366f1",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/icon-32.png", sizes: "32x32", type: "image/png" },
    ],
  };
}
