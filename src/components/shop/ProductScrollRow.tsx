import ProductCard from "@/components/shop/ProductCard";
import type { FeaturedProduct } from "@/lib/supabase/queries";

type ProductScrollRowProps = {
  products: FeaturedProduct[];
};

export default function ProductScrollRow({ products }: ProductScrollRowProps) {
  if (products.length === 0) return null;

  return (
    <div className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 md:-mx-16 md:px-16">
      {products.map((product) => (
        <div key={product.id} className="w-[72vw] min-w-0 shrink-0 snap-start sm:w-64">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
