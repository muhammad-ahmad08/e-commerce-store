import type { Metadata } from "next";
import Link from "next/link";
import Pagination from "@/components/shop/Pagination";
import { STORE_TIME_ZONE } from "@/config/store";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import {
  ADMIN_ORDER_PAGE_SIZE,
  ADMIN_ORDER_STATUSES,
  type AdminOrderStatus,
  getAdminOrders,
} from "@/lib/supabase/admin-queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Orders | Aurelia Admin",
  robots: { index: false, follow: false },
};

type OrdersPageProps = {
  searchParams: Promise<{ page?: string | string[]; status?: string | string[] }>;
};

const currencyFormatter = new Intl.NumberFormat("en-PK", { maximumFractionDigits: 2 });
const dateFormatter = new Intl.DateTimeFormat("en-PK", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: STORE_TIME_ZONE,
});

function paymentState(method: string, receivedAt: string | null) {
  if (receivedAt) return `Received · ${dateFormatter.format(new Date(receivedAt))}`;
  if (method === "jazzcash") return "Awaiting JazzCash payment";
  return "Cash on delivery";
}

function singleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isOrderStatus(value: string | undefined): value is AdminOrderStatus {
  return ADMIN_ORDER_STATUSES.some((status) => status === value);
}

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const requestedStatus = singleParam(params.status);
  const status = isOrderStatus(requestedStatus) ? requestedStatus : undefined;
  const parsedPage = Number.parseInt(singleParam(params.page) ?? "1", 10);
  const requestedPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  let { orders, totalCount } = await getAdminOrders({ page: requestedPage, status });
  const totalPages = Math.ceil(totalCount / ADMIN_ORDER_PAGE_SIZE);
  const currentPage = totalPages > 0 ? Math.min(requestedPage, totalPages) : 1;
  if (currentPage !== requestedPage) {
    ({ orders, totalCount } = await getAdminOrders({ page: currentPage, status }));
  }

  const filterHref = (filter?: AdminOrderStatus) =>
    filter ? `/admin/orders?status=${filter}` : "/admin/orders";

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-12">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-terracotta">Store operations</p>
        <h1 className="mt-2 font-serif text-4xl text-foreground-primary">Orders</h1>
      </header>

      <nav aria-label="Filter orders by status" className="mt-7 flex flex-wrap gap-2">
        <Link href={filterHref()} aria-current={!status ? "page" : undefined} className={`border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${!status ? "border-brand-terracotta bg-brand-terracotta text-background-primary" : "border-border-token hover:border-brand-terracotta"}`}>
          All
        </Link>
        {ADMIN_ORDER_STATUSES.map((filter) => (
          <Link key={filter} href={filterHref(filter)} aria-current={status === filter ? "page" : undefined} className={`border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] capitalize ${status === filter ? "border-brand-terracotta bg-brand-terracotta text-background-primary" : "border-border-token hover:border-brand-terracotta"}`}>
            {filter}
          </Link>
        ))}
      </nav>

      {orders.length ? (
        <div className="mt-6 overflow-x-auto border border-border-token">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-background-secondary text-xs uppercase tracking-wider text-foreground-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Reference</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Payment method</th>
                <th className="px-4 py-3 font-semibold">Payment state</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-token">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="whitespace-nowrap px-4 py-4 font-semibold">
                    <Link className="underline decoration-border-token underline-offset-4 hover:text-brand-terracotta" href={`/admin/orders/${order.id}`}>
                      {order.id.slice(0, 8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-4 py-4">{order.shippingName}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-foreground-muted">{dateFormatter.format(new Date(order.createdAt))}</td>
                  <td className="whitespace-nowrap px-4 py-4">Rs. {currencyFormatter.format(order.totalAmount)}</td>
                  <td className="px-4 py-4 capitalize">{order.paymentMethod === "cod" ? "Cash on delivery" : order.paymentMethod}</td>
                  <td className="px-4 py-4">{paymentState(order.paymentMethod, order.paymentReceivedAt)}</td>
                  <td className="px-4 py-4 capitalize">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-6 border border-border-token bg-background-secondary px-5 py-8 text-center text-sm text-foreground-muted">No orders found.</p>
      )}

      <Pagination
        currentPage={currentPage}
        totalCount={totalCount}
        href="/admin/orders"
        pageSize={ADMIN_ORDER_PAGE_SIZE}
        status={status}
      />
    </main>
  );
}
