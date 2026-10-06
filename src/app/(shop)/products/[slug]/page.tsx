import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import ProductScrollRow from "@/components/shop/ProductScrollRow";
import VariantSelector from "@/components/shop/VariantSelector";
import {
  getActiveProductSlugs,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/supabase/queries";

export const revalidate = 60;

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getActiveProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(
    product.category.id,
    product.id,
    5,
  );

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 md:px-16 md:py-12">
      <nav aria-label="Breadcrumb" className="mb-8 text-xs text-foreground-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link className="transition-colors hover:text-foreground-primary" href="/">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              className="transition-colors hover:text-foreground-primary"
              href={`/shop/${product.category.slug}`}
            >
              {product.category.name}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground-primary">
            {product.name}
          </li>
        </ol>
      </nav>

      <section className="grid gap-8 md:grid-cols-2 md:gap-16">
        <div className="relative aspect-[4/5] overflow-hidden bg-background-secondary">
          <Image
            src={`/images/products/${product.slug}.jpg`}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div className="py-2 md:py-8">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground-muted">
            {product.category.name}
          </p>
          <h1 className="mt-3 font-serif text-4xl text-foreground-primary sm:text-5xl">
            {product.name}
          </h1>
          {product.description ? (
            <p className="mt-5 whitespace-pre-line text-sm leading-7 text-foreground-muted">
              {product.description}
            </p>
          ) : null}
          <VariantSelector
            variants={product.variants}
            basePrice={product.basePrice}
            product={{ id: product.id, slug: product.slug, name: product.name }}
          />
        </div>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="mt-20 border-t border-border-token pt-12">
          <h2 className="mb-8 font-serif text-3xl text-foreground-primary">
            You may also like
          </h2>
          <ProductScrollRow products={relatedProducts} />
        </section>
      ) : null}
    </main>
  );
}
