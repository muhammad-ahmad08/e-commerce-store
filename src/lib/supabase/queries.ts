import "server-only";

import { createPublicClient } from "@/lib/supabase/server";

export type Category = {
  id: string;
  name: string;
  slug: string;
};

type ProductVariantPrice = {
  price: number | string;
};

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  base_price: number | string;
  product_variants: ProductVariantPrice[];
};

export type FeaturedProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
};

export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to fetch categories:", error.message);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error("Failed to create the Supabase client for categories:", error);
    return [];
  }
}

export async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, base_price, product_variants(price)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(4);

    if (error) {
      console.error("Failed to fetch featured products:", error.message);
      return [];
    }

    return ((data ?? []) as ProductRow[]).map((product) => {
      const variantPrices = product.product_variants
        .map((variant) => Number(variant.price))
        .filter(Number.isFinite);
      const price =
        variantPrices.length > 0
          ? Math.min(...variantPrices)
          : Number(product.base_price);

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: Number.isFinite(price) ? price : 0,
      };
    });
  } catch (error) {
    console.error(
      "Failed to create the Supabase client for featured products:",
      error,
    );
    return [];
  }
}
