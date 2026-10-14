const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

if (!rawSiteUrl) {
  throw new Error(
    "NEXT_PUBLIC_SITE_URL is required. Set it to the absolute public site origin (for example, https://www.example.com).",
  );
}

let parsedSiteUrl: URL;

try {
  parsedSiteUrl = new URL(rawSiteUrl);
} catch {
  throw new Error(
    "NEXT_PUBLIC_SITE_URL must be a valid absolute URL using http: or https:.",
  );
}

if (
  !["http:", "https:"].includes(parsedSiteUrl.protocol) ||
  !parsedSiteUrl.hostname ||
  parsedSiteUrl.username ||
  parsedSiteUrl.password ||
  parsedSiteUrl.search ||
  parsedSiteUrl.hash ||
  (parsedSiteUrl.pathname !== "/" && parsedSiteUrl.pathname !== "")
) {
  throw new Error(
    "NEXT_PUBLIC_SITE_URL must be an origin-only absolute http: or https: URL without credentials, path, query, or fragment.",
  );
}

if (process.env.NODE_ENV === "production" && parsedSiteUrl.protocol !== "https:") {
  throw new Error("NEXT_PUBLIC_SITE_URL must use HTTPS in production.");
}

export const SITE_URL = new URL(parsedSiteUrl.origin);

export function getCanonicalUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}
