import Link from "next/link";

const navigation = [
  { label: "Dashboard", href: "/admin" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Products", href: "/admin/products" },
];

export default function AdminSidebar() {
  return (
    <aside className="border-b border-border-token bg-background-secondary px-5 py-6 md:min-h-screen md:border-b-0 md:border-r md:px-6 md:py-8">
      <Link href="/admin" className="font-serif text-2xl text-foreground-primary">
        Aurelia <span className="text-sm text-foreground-muted">Admin</span>
      </Link>
      <nav aria-label="Admin navigation" className="mt-8 flex gap-5 md:flex-col md:gap-2">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="py-2 text-xs font-semibold uppercase tracking-[0.15em] text-foreground-primary transition-colors duration-250 hover:text-brand-terracotta"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <Link
        href="/"
        className="mt-8 inline-block text-sm text-foreground-muted underline underline-offset-4 transition-colors hover:text-brand-terracotta"
      >
        Back to store
      </Link>
    </aside>
  );
}
