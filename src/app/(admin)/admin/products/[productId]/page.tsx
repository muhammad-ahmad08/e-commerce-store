import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import VariantsEditor from "@/components/admin/VariantsEditor";
import ProductImageUploader from "@/components/admin/ProductImageUploader";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getAdminCategories, getAdminProductById } from "@/lib/supabase/admin-queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit product | Aurelia Admin", robots: { index: false, follow: false } };

export default async function EditAdminProductPage({ params }: { params: Promise<{ productId: string }> }) {
  await requireAdmin();
  const { productId } = await params;
  const [product, categories] = await Promise.all([getAdminProductById(productId), getAdminCategories()]);
  if (!product) notFound();
  const customerPrice = product.variants.length
    ? Math.min(...product.variants.map((variant) => variant.price))
    : product.basePrice;
  const priceFormatter = new Intl.NumberFormat("en-PK", { maximumFractionDigits: 2 });
  return <main className="mx-auto max-w-5xl px-5 py-10 md:px-10 md:py-12">
    <Link href="/admin/products" className="text-sm text-foreground-muted underline underline-offset-4">← Products</Link>
    <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-brand-terracotta">Inventory</p>
    <h1 className="mt-2 font-serif text-4xl text-foreground-primary">Edit product</h1>
    <p className="mt-3 text-sm text-foreground-muted">Customers see: from Rs. {priceFormatter.format(customerPrice)}</p>
    <ProductForm categories={categories} product={product} />
    <ProductImageUploader productId={product.id} slug={product.slug} name={product.name} imagePath={product.imagePath} />
    <VariantsEditor product={product} />
  </main>;
}
