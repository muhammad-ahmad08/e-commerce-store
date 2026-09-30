import "server-only";

import { unstable_cache } from "next/cache";
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

export type ProductVariant = {
  id: string;
  size: string;
  color: string;
  stock: number;
  price: number;
};

export type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  category: Category;
  variants: ProductVariant[];
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

const getCachedProductBySlug = unstable_cache(
  async (slug: string): Promise<ProductDetail | null> => {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, slug, description, base_price, product_variants(id, size, color, stock, price), category:categories(id, name, slug)",
        )
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (error || !data) {
        if (error) console.error("Failed to fetch product detail:", error.message);
        return null;
      }

      const product = data as unknown as {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        base_price: number | string;
        product_variants: Array<{
          id: string;
          size: string;
          color: string;
          stock: number;
          price: number | string;
        }>;
        category: Category | Category[];
      };
      const category = Array.isArray(product.category)
        ? product.category[0]
        : product.category;

      if (!category) return null;

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        basePrice: Number(product.base_price),
        category,
        variants: product.product_variants.map((variant) => ({
          id: variant.id,
          size: variant.size,
          color: variant.color,
          stock: variant.stock,
          price: Number(variant.price),
        })),
      };
    } catch (error) {
      console.error("Failed to create the Supabase client for product detail:", error);
      return null;
    }
  },
  ["product-detail"],
  { revalidate: 60 },
);

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  return getCachedProductBySlug(slug);
}

const getCachedRelatedProducts = unstable_cache(
  async (
    categoryId: string,
    excludeProductId: string,
    limit: number,
  ): Promise<FeaturedProduct[]> => {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("products")
        .select("id, name, slug, base_price, product_variants(price)")
        .eq("is_active", true)
        .eq("category_id", categoryId)
        .neq("id", excludeProductId)
        .order("created_at", { ascending: false })
        .limit(Math.max(0, limit));

      if (error) {
        console.error("Failed to fetch related products:", error.message);
        return [];
      }

      return ((data ?? []) as ProductRow[]).map((product) => mapProduct(product));
    } catch (error) {
      console.error("Failed to create the Supabase client for related products:", error);
      return [];
    }
  },
  ["related-products"],
  { revalidate: 60 },
);

export async function getRelatedProducts(
  categoryId: string,
  excludeProductId: string,
  limit: number,
): Promise<FeaturedProduct[]> {
  return getCachedRelatedProducts(categoryId, excludeProductId, limit);
}

export async function getActiveProductSlugs(): Promise<string[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select("slug")
      .eq("is_active", true);

    if (error) {
      console.error("Failed to fetch active product slugs:", error.message);
      return [];
    }

    return (data ?? []).map((product) => product.slug);
  } catch (error) {
    console.error("Failed to create the Supabase client for product slugs:", error);
    return [];
  }
}
