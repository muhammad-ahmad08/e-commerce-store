import { notFound } from "next/navigation";
import CategorySidebar from "@/components/shop/CategorySidebar";
import Pagination from "@/components/shop/Pagination";
import ProductCard from "@/components/shop/ProductCard";
import ProductScrollRow from "@/components/shop/ProductScrollRow";
import {
  getCategories,
  getProducts,
  getRandomActiveProducts,
  PRODUCT_PAGE_SIZE,
} from "@/lib/supabase/queries";

type CatalogPageProps = {
  categorySlug?: string;
  searchParams: Promise<{ page?: string; sort?: string }>;
};

export default async function CatalogPage({
  categorySlug,
  searchParams,
}: CatalogPageProps) {
  const params = await searchParams;
  const parsedPage = Number.parseInt(params.page ?? "1", 10);
  const requestedPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const sort = params.sort === "new" ? "new" : "default";
  const categories = await getCategories();

  if (categorySlug && !categories.some((category) => category.slug === categorySlug)) {
    notFound();
  }

  let { products, totalCount } = await getProducts({
    categorySlug,
    sort,
    page: requestedPage,
  });
  const totalPages = Math.ceil(totalCount / PRODUCT_PAGE_SIZE);
  const currentPage = totalPages > 0 ? Math.min(requestedPage, totalPages) : 1;

  if (currentPage !== requestedPage) {
    ({ products, totalCount } = await getProducts({ categorySlug, sort, page: currentPage }));
  }

  const recommendations = await getRandomActiveProducts(products[0]?.id, 5);
  const title = categorySlug
    ? categories.find((category) => category.slug === categorySlug)?.name ?? "Collection"
    : "All Products";
  const catalogHref = categorySlug ? `/shop/${categorySlug}` : "/shop";

  return (
    <main className="flex-1 bg-background-primary">
      <section className="border-b border-border-token bg-background-secondary">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-end sm:justify-between md:px-16 md:py-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-terracotta">
              The Aurelia collection
            </p>
            <h1 className="mt-2 font-serif text-4xl text-foreground-primary sm:text-5xl">
              {title}
            </h1>
          </div>
          <label className="flex min-h-12 w-full items-center border-b border-foreground-primary/30 sm:max-w-xs">
            <span className="sr-only">Search products</span>
            <input
              type="search"
              placeholder="Search pieces"
              className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm text-foreground-primary outline-none placeholder:text-foreground-muted"
            />
            <span aria-hidden="true" className="px-2 text-foreground-muted">⌕</span>
          </label>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[190px_1fr] md:gap-12 md:px-16 md:py-16">
        <aside>
          <CategorySidebar categories={categories} activeCategory={categorySlug} sort={sort} />
        </aside>

        <div>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-foreground-muted">
              {totalCount} {totalCount === 1 ? "piece" : "pieces"}
            </p>
          </div>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} showCatalogActions />
              ))}
            </div>
          ) : (
            <p className="border border-border-token px-5 py-10 text-center text-sm text-foreground-muted">
              No pieces found in this collection yet.
            </p>
          )}
          <Pagination
            currentPage={currentPage}
            totalCount={totalCount}
            href={catalogHref}
            sort={sort}
          />
        </div>
      </section>

      {recommendations.length > 0 ? (
        <section aria-labelledby="recommendations-heading" className="overflow-hidden bg-background-secondary">
          <div className="mx-auto max-w-7xl px-5 py-14 md:px-16 md:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-terracotta">
              A considered selection
            </p>
            <h2 id="recommendations-heading" className="mb-8 mt-2 font-serif text-3xl text-foreground-primary sm:text-4xl">
              Explore our recommendations
            </h2>
            <ProductScrollRow products={recommendations} />
          </div>
        </section>
      ) : null}

      <section className="bg-brand-forest text-background-primary">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:py-16 md:grid-cols-[1fr_1fr] md:items-center md:gap-16 md:px-16 md:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-background-secondary">
              Notes from Aurelia
            </p>
            <h2 className="mt-3 max-w-md font-serif text-4xl leading-tight sm:text-5xl">
              A little inspiration, thoughtfully delivered.
            </h2>
          </div>
          <div>
            <p className="mb-5 text-sm leading-6 text-background-secondary">
              Be the first to hear about new collections and considered essentials.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="catalog-email">Email address</label>
              <input
                id="catalog-email"
                type="email"
                placeholder="Your email address"
                className="min-h-12 min-w-0 flex-1 border border-background-primary/35 bg-transparent px-4 text-sm text-background-primary outline-none placeholder:text-background-secondary/70"
              />
              <button
                type="button"
                className="min-h-12 bg-background-primary px-6 text-xs font-semibold uppercase tracking-[0.15em] text-brand-forest transition-colors duration-250 ease-editorial hover:bg-background-secondary"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
