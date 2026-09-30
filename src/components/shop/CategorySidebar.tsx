import Link from "next/link";
import type { Category } from "@/lib/supabase/queries";

type CategorySidebarProps = {
  categories: Category[];
  activeCategory?: string;
  sort?: "default" | "new";
};

const linkClasses =
  "flex min-h-11 items-center justify-between border-b border-border-token py-3 text-sm transition-colors duration-250 ease-editorial hover:text-brand-terracotta";

export default function CategorySidebar({
  categories,
  activeCategory,
  sort = "default",
}: CategorySidebarProps) {
  return (
    <nav aria-label="Shop categories">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-foreground-muted">
        Browse
      </h2>
      <ul>
        <li>
          <Link
            href={sort === "new" ? "/shop?sort=new" : "/shop"}
            aria-current={!activeCategory && sort !== "new" ? "page" : undefined}
            className={`${linkClasses} ${!activeCategory && sort !== "new" ? "font-semibold text-brand-terracotta" : "text-foreground-primary"}`}
          >
            All Products
            {!activeCategory && sort !== "new" ? <span aria-hidden="true">›</span> : null}
          </Link>
        </li>
        {categories.map((category) => {
          const active = activeCategory === category.slug;
          return (
            <li key={category.id}>
              <Link
                href={`/shop/${category.slug}${sort === "new" ? "?sort=new" : ""}`}
                aria-current={active ? "page" : undefined}
                className={`${linkClasses} ${active ? "font-semibold text-brand-terracotta" : "text-foreground-primary"}`}
              >
                {category.name}
                {active ? <span aria-hidden="true">›</span> : null}
              </Link>
            </li>
          );
        })}
        <li>
          <Link
            href={activeCategory ? `/shop/${activeCategory}?sort=new` : "/shop?sort=new"}
            aria-current={sort === "new" ? "page" : undefined}
            className={`${linkClasses} ${sort === "new" ? "font-semibold text-brand-terracotta" : "text-foreground-primary"}`}
          >
            New Arrival
            {sort === "new" ? <span aria-hidden="true">›</span> : null}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
