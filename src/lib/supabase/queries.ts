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
  categoryName?: string;
};

export type ProductSort = "default" | "new";

export type ProductsResult = {
  products: FeaturedProduct[];
  totalCount: number;
};

export const PRODUCT_PAGE_SIZE = 9;

function mapProduct(product: ProductRow, categoryName?: string): FeaturedProduct {
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
    ...(categoryName ? { categoryName } : {}),
  };
}

export type GetProductsOptions = {
  categorySlug?: string;
  sort?: ProductSort;
  page?: number;
};

export async function getProducts({
  categorySlug,
  sort = "default",
  page = 1,
}: GetProductsOptions = {}): Promise<ProductsResult> {
  try {
    const supabase = createPublicClient();
    const currentPage = Number.isInteger(page) && page > 0 ? page : 1;
    let query = supabase
      .from("products")
      .select(
        "id, name, slug, base_price, product_variants(price), category:categories!inner(name, slug)",
        { count: "exact" },
      )
      .eq("is_active", true);

    if (categorySlug) query = query.eq("category.slug", categorySlug);

    const from = (currentPage - 1) * PRODUCT_PAGE_SIZE;
    const { data, error, count } = await query
      .order("created_at", { ascending: sort !== "new" })
      .range(from, from + PRODUCT_PAGE_SIZE - 1);

    if (error) {
      console.error("Failed to fetch catalog products:", error.message);
      return { products: [], totalCount: 0 };
    }

    const products = (
      (data ?? []) as Array<ProductRow & { category: { name: string; slug: string }[] }>
    ).map((product) => mapProduct(product, product.category[0]?.name));

    return { products, totalCount: count ?? 0 };
  } catch (error) {
    console.error("Failed to create the Supabase client for catalog products:", error);
    return { products: [], totalCount: 0 };
  }
}

export async function getRandomActiveProducts(
  excludeId?: string,
  limit = 5,
): Promise<FeaturedProduct[]> {
  try {
    const supabase = createPublicClient();
    let query = supabase
      .from("products")
      .select("id, name, slug, base_price, product_variants(price), category:categories(name)")
      .eq("is_active", true);

    if (excludeId) query = query.neq("id", excludeId);

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(Math.max(0, limit));

    if (error) {
      console.error("Failed to fetch recommended products:", error.message);
      return [];
    }

    return (
      (data ?? []) as Array<ProductRow & { category: { name: string }[] }>
    ).map((product) => mapProduct(product, product.category[0]?.name));
  } catch (error) {
    console.error("Failed to create the Supabase client for recommendations:", error);
    return [];
  }
}

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

    return ((data ?? []) as ProductRow[]).map((product) => mapProduct(product));
  } catch (error) {
    console.error(
      "Failed to create the Supabase client for featured products:",
      error,
    );
    return [];
  }
}
