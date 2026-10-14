import type { MetadataRoute } from "next";
import {
  getSitemapActiveProducts,
  getSitemapCategories,
} from "@/lib/supabase/queries";
import { getCanonicalUrl } from "@/lib/site-url";

function lastModified(createdAt: string | null): Date | undefined {
  if (!createdAt) return undefined;
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    getSitemapCategories(),
    getSitemapActiveProducts(),
  ]);

  return [
    { url: getCanonicalUrl("/") },
    { url: getCanonicalUrl("/shop") },
    ...categories.map((category) => ({
      url: getCanonicalUrl(`/shop/${category.slug}`),
      ...(lastModified(category.createdAt)
        ? { lastModified: lastModified(category.createdAt) }
        : {}),
    })),
    ...products.map((product) => ({
      url: getCanonicalUrl(`/products/${product.slug}`),
      ...(lastModified(product.createdAt)
        ? { lastModified: lastModified(product.createdAt) }
        : {}),
    })),
  ];
}
