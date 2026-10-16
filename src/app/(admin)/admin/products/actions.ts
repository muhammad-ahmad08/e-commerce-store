"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createClient } from "@/lib/supabase/server";
import { normalizeSku, validateProduct, validateVariant } from "@/lib/admin/product-validation";

type ProductInput = {
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  basePrice: number;
  isActive: boolean;
};

type VariantInput = {
  size: string;
  color: string;
  stock: number;
  price: number;
  sku: string;
};

type ExistingVariantInput = VariantInput & { id: string; originalStock: number };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function friendlyDatabaseError(error: { code?: string; message?: string; details?: string | null }) {
  if (error.code === "23505") {
    const description = `${error.message ?? ""} ${error.details ?? ""}`.toLowerCase();
    if (description.includes("slug")) return "This URL name is already used.";
    if (description.includes("sku")) return "This SKU is already used.";
    if (description.includes("product_id") || description.includes("size") || description.includes("color")) return "A variant with this size and color already exists for this product.";
  }
  if (error.code === "23503") return "This has order history and can't be deleted. Hide the product or set stock to 0 instead.";
  return "The product could not be saved. Please review the details and try again.";
}

function revalidateProductViews(slug?: string) {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/shop/[category]", "page");
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidateTag("product-detail", { expire: 0 });
  revalidateTag("related-products", { expire: 0 });
  if (slug) revalidatePath(`/products/${slug}`);
}

async function deleteStoredImage(supabase: Awaited<ReturnType<typeof createClient>>, path: string, reason: string) {
  try {
    const { error } = await supabase.storage.from("product-images").remove([path]);
    if (error) console.error(`${reason}:`, error.message);
  } catch (error) {
    console.error(`${reason}:`, error);
  }
}

export async function createProduct(input: ProductInput, variants: VariantInput[] = []): Promise<{ productId?: string; error?: string }> {
  await requireAdmin();
  const productError = validateProduct(input);
  if (productError) return { error: productError };
  if (!Array.isArray(variants) || variants.length > 100) return { error: "Invalid variant list." };
  for (const variant of variants) {
    const error = validateVariant(variant);
    if (error) return { error };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("products").insert({
    name: input.name.trim(), slug: input.slug, category_id: input.categoryId,
    description: input.description.trim() || null, base_price: input.basePrice, is_active: input.isActive,
  }).select("id").single();
  if (error || !data) return { error: error ? friendlyDatabaseError(error) : "The product could not be created." };
  if (variants.length) {
    const { error: variantError } = await supabase.from("product_variants").insert(variants.map((variant) => ({
      product_id: data.id, size: variant.size.trim(), color: variant.color.trim(),
      stock: variant.stock, price: variant.price, sku: normalizeSku(variant.sku),
    })));
    if (variantError) {
      await supabase.from("products").delete().eq("id", data.id);
      return { error: friendlyDatabaseError(variantError) };
    }
  }
  revalidateProductViews(input.slug);
  return { productId: data.id };
}

export async function updateProduct(productId: string, input: Omit<ProductInput, "slug">): Promise<{ error?: string }> {
  await requireAdmin();
  if (!UUID_PATTERN.test(productId)) return { error: "Invalid product." };
  const productError = validateProduct({ ...input, slug: "unchanged-valid-slug" });
  if (productError) return { error: productError };
  const supabase = await createClient();
  const { data: product } = await supabase.from("products").select("slug").eq("id", productId).maybeSingle();
  if (!product) return { error: "Product not found." };
  const { error } = await supabase.from("products").update({
    name: input.name.trim(), category_id: input.categoryId, description: input.description.trim() || null,
    base_price: input.basePrice, is_active: input.isActive,
  }).eq("id", productId);
  if (error) return { error: friendlyDatabaseError(error) };
  revalidateProductViews(product.slug);
  return {};
}

export async function addVariant(productId: string, input: VariantInput): Promise<{ error?: string }> {
  await requireAdmin();
  if (!UUID_PATTERN.test(productId)) return { error: "Invalid product." };
  const validationError = validateVariant(input);
  if (validationError) return { error: validationError };
  const supabase = await createClient();
  const { data: product } = await supabase.from("products").select("slug").eq("id", productId).maybeSingle();
  if (!product) return { error: "Product not found." };
  const { error } = await supabase.from("product_variants").insert({
    product_id: productId, size: input.size.trim(), color: input.color.trim(), stock: input.stock,
    price: input.price, sku: normalizeSku(input.sku),
  });
  if (error) return { error: friendlyDatabaseError(error) };
  revalidateProductViews(product.slug);
  revalidatePath(`/admin/products/${productId}`);
  return {};
}

export async function updateVariant(productId: string, variant: ExistingVariantInput): Promise<{ error?: string }> {
  await requireAdmin();
  if (!UUID_PATTERN.test(productId) || !UUID_PATTERN.test(variant.id)) return { error: "Invalid product variant." };
  const validationError = validateVariant(variant);
  if (validationError) return { error: validationError };
  if (!Number.isInteger(variant.originalStock) || variant.originalStock < 0) return { error: "Invalid original stock value." };
  const supabase = await createClient();
  const { data: product } = await supabase.from("products").select("slug").eq("id", productId).maybeSingle();
  if (!product) return { error: "Product not found." };
  const values: { size: string; color: string; price: number; sku: string | null; stock?: number } = {
    size: variant.size.trim(), color: variant.color.trim(), price: variant.price, sku: normalizeSku(variant.sku),
  };
  if (variant.stock !== variant.originalStock) values.stock = variant.stock;
  const { error } = await supabase.from("product_variants").update(values).eq("id", variant.id).eq("product_id", productId);
  if (error) return { error: friendlyDatabaseError(error) };
  revalidateProductViews(product.slug);
  revalidatePath(`/admin/products/${productId}`);
  return {};
}

export async function deleteVariant(productId: string, variantId: string): Promise<{ error?: string }> {
  await requireAdmin();
  if (!UUID_PATTERN.test(productId) || !UUID_PATTERN.test(variantId)) return { error: "Invalid product variant." };
  const supabase = await createClient();
  const { data: product } = await supabase.from("products").select("slug").eq("id", productId).maybeSingle();
  if (!product) return { error: "Product not found." };
  const { error } = await supabase.from("product_variants").delete().eq("id", variantId).eq("product_id", productId);
  if (error) return { error: friendlyDatabaseError(error) };
  revalidateProductViews(product.slug);
  revalidatePath(`/admin/products/${productId}`);
  return {};
}

export async function deleteProduct(productId: string): Promise<{ error?: string }> {
  await requireAdmin();
  if (!UUID_PATTERN.test(productId)) return { error: "Invalid product." };
  const supabase = await createClient();
  const { data: product } = await supabase.from("products").select("slug, image_path").eq("id", productId).maybeSingle();
  if (!product) return { error: "Product not found." };
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) return { error: friendlyDatabaseError(error) };
  if (product.image_path) await deleteStoredImage(supabase, product.image_path, "Failed to delete product image after product deletion");
  revalidateProductViews(product.slug);
  return {};
}

export async function setProductImage(productId: string, path: string): Promise<{ error?: string }> {
  await requireAdmin();
  if (!UUID_PATTERN.test(productId)) return { error: "Invalid product." };
  const uuid = "[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";
  if (typeof path !== "string" || !new RegExp(`^products/${productId}/${uuid}\\.(?:webp|jpg|jpeg|png)$`, "i").test(path)) {
    return { error: "Invalid product image path." };
  }

  const supabase = await createClient();
  const { data: product } = await supabase.from("products").select("slug, image_path").eq("id", productId).maybeSingle();
  if (!product) return { error: "Product not found." };
  const { error } = await supabase.from("products").update({ image_path: path }).eq("id", productId);
  if (error) return { error: friendlyDatabaseError(error) };
  if (product.image_path && product.image_path !== path) {
    await deleteStoredImage(supabase, product.image_path, "Failed to delete replaced product image");
  }
  revalidateProductViews(product.slug);
  revalidatePath(`/admin/products/${productId}`);
  return {};
}

export async function removeProductImage(productId: string): Promise<{ error?: string }> {
  await requireAdmin();
  if (!UUID_PATTERN.test(productId)) return { error: "Invalid product." };
  const supabase = await createClient();
  const { data: product } = await supabase.from("products").select("slug, image_path").eq("id", productId).maybeSingle();
  if (!product) return { error: "Product not found." };
  const { error } = await supabase.from("products").update({ image_path: null }).eq("id", productId);
  if (error) return { error: friendlyDatabaseError(error) };
  if (product.image_path) await deleteStoredImage(supabase, product.image_path, "Failed to delete removed product image");
  revalidateProductViews(product.slug);
  revalidatePath(`/admin/products/${productId}`);
  return {};
}
