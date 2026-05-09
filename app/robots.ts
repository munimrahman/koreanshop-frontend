import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/checkout", "/_next/", "/static/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/checkout"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
