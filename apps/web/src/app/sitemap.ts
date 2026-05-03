import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://hitbet.to",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://hitbet.to/pricing",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://hitbet.to/guide",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://hitbet.to/arbitrage",
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 0.7,
    },
    {
      url: "https://hitbet.to/long-run",
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 0.7,
    },
  ];
}