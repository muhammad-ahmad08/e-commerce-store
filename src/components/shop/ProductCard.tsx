import Link from "next/link";
import Image from "next/image";
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
          <Image
            src={`/images/products/${product.slug}.jpg`}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-250 ease-editorial group-hover:scale-[1.03]"
          />
          {showCatalogActions && product.categoryName ? (
            <span className="absolute left-4 top-4 rounded-full bg-background-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground-muted">
              {product.categoryName}
            </span>
          ) : null}
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
        <Link
          href={`/products/${product.slug}`}
          className="mt-4 flex min-h-11 w-full items-center justify-center border border-brand-forest px-4 text-xs font-semibold uppercase tracking-[0.15em] text-brand-forest transition-colors duration-250 ease-editorial hover:bg-brand-forest hover:text-background-primary"
        >
          Add to Cart
        </Link>
      ) : null}
    </article>
  );
}
