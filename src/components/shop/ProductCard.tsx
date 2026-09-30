import Link from "next/link";
import type { FeaturedProduct } from "@/lib/supabase/queries";

type ProductCardProps = {
  product: FeaturedProduct;
  showCatalogActions?: boolean;
};

const priceFormatter = new Intl.NumberFormat("en-PK", {
  maximumFractionDigits: 2,
});

export default function ProductCard({
  product,
  showCatalogActions = false,
}: ProductCardProps) {
  return (
    <article>
      <Link href={`/products/${product.slug}`} className="group block">
        <div className="relative aspect-square overflow-hidden bg-background-secondary">
          <div className="absolute inset-0 flex items-center justify-center bg-background-secondary px-6 text-center transition-transform duration-250 ease-editorial group-hover:scale-[1.03]">
            {showCatalogActions && product.categoryName ? (
              <span className="absolute left-4 top-4 rounded-full bg-background-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-muted">
                {product.categoryName}
              </span>
            ) : null}
            <span className="bg-background-primary/80 px-4 py-2 font-serif text-xl text-foreground-primary sm:text-2xl">
              {product.name}
            </span>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-1">
          <h3 className="font-sans text-sm font-medium text-foreground-primary sm:text-base">
            {product.name}
          </h3>
          <p className="text-sm text-foreground-muted">
            From Rs. {priceFormatter.format(product.price)}
          </p>
        </div>
      </Link>
      {showCatalogActions ? (
        <button
          type="button"
          className="mt-4 min-h-11 w-full border border-brand-forest px-4 text-xs font-semibold uppercase tracking-[0.15em] text-brand-forest transition-colors duration-250 ease-editorial hover:bg-brand-forest hover:text-background-primary"
        >
          Add to Cart
        </button>
      ) : null}
    </article>
  );
}
