import type { Metadata } from "next";
import Link from "next/link";
import { STORE_TIME_ZONE } from "@/config/store";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getAdminDashboardData } from "@/lib/supabase/admin-queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard | Aurelia Admin",
  robots: { index: false, follow: false },
};

const currencyFormatter = new Intl.NumberFormat("en-PK", {
  maximumFractionDigits: 2,
});
const dateFormatter = new Intl.DateTimeFormat("en-PK", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: STORE_TIME_ZONE,
});

const summaryLabels = [
  { key: "totalOrders", label: "Total orders" },
  { key: "pendingOrders", label: "Pending orders" },
  { key: "ordersToday", label: "Orders today" },
] as const;

export default async function AdminDashboardPage() {
  // Layouts may not re-run on every App Router navigation, so protect each page too.
  await requireAdmin();
  const dashboard = await getAdminDashboardData();

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-12">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-terracotta">
          Store overview
        </p>
        <h1 className="mt-2 font-serif text-4xl text-foreground-primary">Dashboard</h1>
      </header>

      <section aria-label="Order summary" className="mt-8 grid gap-4 sm:grid-cols-3">
        {summaryLabels.map(({ key, label }) => (
          key === "pendingOrders" ? (
            <Link key={key} href="/admin/orders?status=pending" className="border border-border-token bg-background-secondary p-5 sm:p-6">
              <p className="text-sm text-foreground-muted">{label}</p>
              <p className="mt-3 font-serif text-4xl text-foreground-primary hover:text-brand-terracotta">
                {dashboard[key]}
              </p>
            </Link>
          ) : (
            <article key={key} className="border border-border-token bg-background-secondary p-5 sm:p-6">
              <p className="text-sm text-foreground-muted">{label}</p>
              <p className="mt-3 font-serif text-4xl text-foreground-primary">{dashboard[key]}</p>
            </article>
          )
        ))}
      </section>

      <section aria-labelledby="recent-orders-heading" className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-terracotta">
              Latest activity
            </p>
            <h2 id="recent-orders-heading" className="mt-2 font-serif text-2xl text-foreground-primary">
              Recent orders
            </h2>
          </div>
          <span className="text-sm text-foreground-muted">Latest 10</span>
        </div>
        {dashboard.recentOrders.length ? (
          <div className="mt-5 overflow-x-auto border border-border-token">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-background-secondary text-xs uppercase tracking-wider text-foreground-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Reference</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Payment</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-token">
                {dashboard.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-4 font-semibold">
                      <Link href={`/admin/orders/${order.id}`} className="underline decoration-border-token underline-offset-4 hover:text-brand-terracotta">
                        {order.id.slice(0, 8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-4 py-4">{order.shippingName}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-foreground-muted">
                      {dateFormatter.format(new Date(order.createdAt))}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">Rs. {currencyFormatter.format(order.totalAmount)}</td>
                    <td className="px-4 py-4 capitalize">{order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod}</td>
                    <td className="px-4 py-4 capitalize">{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-5 border border-border-token bg-background-secondary px-5 py-8 text-center text-sm text-foreground-muted">
            No orders yet. New orders will appear here.
          </p>
        )}
      </section>

      <section aria-labelledby="low-stock-heading" className="mt-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-terracotta">
          Inventory attention
        </p>
        <h2 id="low-stock-heading" className="mt-2 font-serif text-2xl text-foreground-primary">
          Low stock
        </h2>
        {dashboard.lowStockVariants.length ? (
          <div className="mt-5 overflow-x-auto border border-border-token">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-background-secondary text-xs uppercase tracking-wider text-foreground-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Size</th>
                  <th className="px-4 py-3 font-semibold">Color</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-token">
                {dashboard.lowStockVariants.map((variant, index) => (
                  <tr key={`${variant.productName}-${variant.size}-${variant.color}-${index}`}>
                    <td className="px-4 py-4">{variant.productName}</td>
                    <td className="px-4 py-4">{variant.size}</td>
                    <td className="px-4 py-4">{variant.color}</td>
                    <td className="px-4 py-4 font-semibold">{variant.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-5 border border-border-token bg-background-secondary px-5 py-8 text-center text-sm text-foreground-muted">
            No low-stock variants. Inventory is looking good.
          </p>
        )}
      </section>
    </main>
  );
}
