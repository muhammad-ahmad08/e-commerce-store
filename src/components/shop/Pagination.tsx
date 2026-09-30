import Link from "next/link";
import { PRODUCT_PAGE_SIZE } from "@/lib/supabase/queries";

type PaginationProps = {
  currentPage: number;
  totalCount: number;
  href: string;
  sort?: "default" | "new";
};

export default function Pagination({
  currentPage,
  totalCount,
  href,
  sort = "default",
}: PaginationProps) {
  const totalPages = Math.ceil(totalCount / PRODUCT_PAGE_SIZE);
  if (totalPages <= 1) return null;

  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (sort === "new") params.set("sort", "new");
    const query = params.toString();
    return `${href}${query ? `?${query}` : ""}`;
  };

  return (
    <nav aria-label="Pagination" className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {currentPage > 1 ? (
        <Link
          href={pageHref(currentPage - 1)}
          className="flex min-h-11 items-center border border-border-token px-4 text-xs font-semibold uppercase tracking-[0.12em] hover:border-brand-terracotta hover:text-brand-terracotta"
        >
          Previous
        </Link>
      ) : null}
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
        <Link
          key={page}
          href={pageHref(page)}
          aria-current={page === currentPage ? "page" : undefined}
          className={`flex size-11 items-center justify-center border text-sm ${page === currentPage ? "border-brand-terracotta bg-brand-terracotta text-background-primary" : "border-border-token text-foreground-primary hover:border-brand-terracotta"}`}
        >
          {page}
        </Link>
      ))}
      {currentPage < totalPages ? (
        <Link
          href={pageHref(currentPage + 1)}
          className="flex min-h-11 items-center border border-border-token px-4 text-xs font-semibold uppercase tracking-[0.12em] hover:border-brand-terracotta hover:text-brand-terracotta"
        >
          Next
        </Link>
      ) : null}
    </nav>
  );
}
