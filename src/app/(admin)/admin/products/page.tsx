import type { Metadata } from "next";
import Link from "next/link";
import { getAdminProducts, ADMIN_PRODUCT_PAGE_SIZE } from "@/lib/supabase/admin-queries";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Products | Aurelia Admin", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ page?: string }> };
const integerFormat = new Intl.NumberFormat("en-PK");

export default async function AdminProductsPage({ searchParams }: Props) {
  await requireAdmin();
  const params = await searchParams;
  const requestedPage = Number(params.page ?? 1);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const { products, totalCount } = await getAdminProducts(page);
  const pageCount = Math.max(1, Math.ceil(totalCount / ADMIN_PRODUCT_PAGE_SIZE));

  return <main className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-12">
    <header className="flex flex-wrap items-end justify-between gap-5">
      <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-terracotta">Inventory</p><h1 className="mt-2 font-serif text-4xl text-foreground-primary">Products</h1></div>
      <Link href="/admin/products/new" className="inline-flex min-h-12 items-center bg-brand-terracotta px-6 text-xs font-semibold uppercase tracking-[0.15em] text-white">New product</Link>
    </header>
    {products.length ? <div className="mt-8 overflow-x-auto border border-border-token">
      <table className="w-full min-w-[740px] text-left text-sm">
        <thead className="bg-background-secondary text-xs uppercase tracking-wider text-foreground-muted"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Variants</th><th className="px-4 py-3">Total stock</th><th className="px-4 py-3">Visibility</th></tr></thead>
        <tbody className="divide-y divide-border-token">{products.map((product) => <tr key={product.id}>
          <td className="px-4 py-4 font-medium"><Link href={`/admin/products/${product.id}`} className="underline decoration-border-token underline-offset-4 hover:text-brand-terracotta">{product.name}</Link></td>
          <td className="px-4 py-4 text-foreground-muted">{product.categoryName}</td>
          <td className="px-4 py-4">{product.variantCount}</td>
          <td className="px-4 py-4">{integerFormat.format(product.totalStock)}</td>
          <td className="px-4 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${product.isActive ? "bg-brand-forest/10 text-brand-forest" : "bg-background-secondary text-foreground-muted"}`}>{product.isActive ? "Visible" : "Hidden"}</span></td>
        </tr>)}</tbody>
      </table>
    </div> : <p className="mt-8 border border-border-token bg-background-secondary px-5 py-10 text-center text-sm text-foreground-muted">No products yet. Create your first product to start building the catalog.</p>}
    <nav aria-label="Product pages" className="mt-6 flex items-center justify-between text-sm">
      <span className="text-foreground-muted">{totalCount ? `Showing ${(page - 1) * ADMIN_PRODUCT_PAGE_SIZE + 1}–${Math.min(page * ADMIN_PRODUCT_PAGE_SIZE, totalCount)} of ${totalCount}` : "0 products"}</span>
      <div className="flex gap-4">{page > 1 ? <Link href={`/admin/products?page=${page - 1}`} className="underline underline-offset-4">Previous</Link> : null}{page < pageCount ? <Link href={`/admin/products?page=${page + 1}`} className="underline underline-offset-4">Next</Link> : null}</div>
    </nav>
  </main>;
}
