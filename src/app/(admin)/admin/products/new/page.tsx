import type { Metadata } from "next";
import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getAdminCategories } from "@/lib/supabase/admin-queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "New product | Aurelia Admin", robots: { index: false, follow: false } };

export default async function NewAdminProductPage() {
  await requireAdmin();
  const categories = await getAdminCategories();
  return <main id="main-content" tabIndex={-1} className="mx-auto max-w-4xl px-5 py-10 md:px-10 md:py-12">
    <Link href="/admin/products" className="text-sm text-foreground-muted underline underline-offset-4">← Products</Link>
    <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-brand-terracotta">Inventory</p>
    <h1 className="mt-2 font-serif text-4xl text-foreground-primary">New product</h1>
    <ProductForm categories={categories} />
  </main>;
}
