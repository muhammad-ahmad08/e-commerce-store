import { createClient } from "@/lib/supabase/client";

export function getProductImageUrl(slug: string, imagePath?: string | null): string {
  if (imagePath) {
    const { data } = createClient().storage.from("product-images").getPublicUrl(imagePath);
    return data.publicUrl;
  }
  return `/images/products/${slug}.jpg`;
}
