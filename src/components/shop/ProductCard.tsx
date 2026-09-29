import Link from "next/link";
import type { FeaturedProduct } from "@/lib/supabase/queries";

type ProductCardProps = {
  product: FeaturedProduct;
};

const priceFormatter = new Intl.NumberFormat("en-PK", {
  maximumFractionDigits: 2,
});

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <article>
      <Link href={`/products/${product.slug}`} className="group block">
        <div className="relative aspect-square overflow-hidden bg-background-secondary">
          <div className="absolute inset-0 flex items-center justify-center bg-background-secondary px-6 text-center transition-transform duration-250 ease-editorial group-hover:scale-[1.03]">
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
    </article>
  );
}
