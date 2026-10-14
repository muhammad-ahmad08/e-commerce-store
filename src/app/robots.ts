import type { MetadataRoute } from "next";
import { getCanonicalUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/cart",
        "/checkout",
        "/login",
        "/signup",
        "/order-confirmation",
      ],
    },
    sitemap: getCanonicalUrl("/sitemap.xml"),
  };
}
