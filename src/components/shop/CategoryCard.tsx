import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/lib/supabase/queries";

type CategoryCardProps = {
  category: Category;
};

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/shop/${category.slug}`}
      className="group relative flex min-h-24 items-center justify-center overflow-hidden rounded-full border border-border-token px-6 py-6 text-center transition-colors duration-250 ease-editorial hover:border-brand-terracotta sm:min-h-28"
    >
      <Image
        src={`/images/categories/${category.slug}.jpg`}
        alt={`${category.name} collection`}
        fill
        sizes="(max-width: 640px) 100vw, 33vw"
        className="object-cover transition-transform duration-250 ease-editorial group-hover:scale-[1.03]"
      />
      <span className="absolute inset-0 bg-brand-forest/65 transition-colors duration-250 ease-editorial group-hover:bg-brand-forest/75" />
      <span className="relative font-serif text-xl text-background-primary sm:text-2xl">
        {category.name}
      </span>
    </Link>
  );
}
