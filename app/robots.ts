import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/desk",        // private workspace
          "/icons",       // design-review surface
        ],
      },
    ],
    sitemap: "https://niallhighland.com/sitemap.xml",
    host: "https://niallhighland.com",
  };
}
