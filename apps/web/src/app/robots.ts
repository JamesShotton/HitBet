import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/account", "/checkout", "/dashboard"],
    },
    sitemap: "https://hitbet.to/sitemap.xml",
  };
}
