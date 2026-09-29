import Link from "next/link";
import type { Category } from "@/lib/supabase/queries";

type CategoryCardProps = {
  category: Category;
};

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/shop/${category.slug}`}
      className="group flex min-h-24 items-center justify-center rounded-full border border-border-token bg-background-primary px-6 py-6 text-center transition-colors duration-250 ease-editorial hover:border-brand-terracotta hover:bg-background-secondary sm:min-h-28"
    >
      <span className="font-serif text-xl text-foreground-primary transition-colors duration-250 ease-editorial group-hover:text-brand-terracotta sm:text-2xl">
        {category.name}
      </span>
    </Link>
  );
}
