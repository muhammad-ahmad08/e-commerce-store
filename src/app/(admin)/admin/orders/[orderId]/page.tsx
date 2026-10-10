import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import OrderActions from "@/components/admin/OrderActions";
import { STORE_TIME_ZONE } from "@/config/store";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getAdminOrderById } from "@/lib/supabase/admin-queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order detail | Aurelia Admin",
  robots: { index: false, follow: false },
};

type OrderDetailPageProps = {
  params: Promise<{ orderId: string }>;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const currencyFormatter = new Intl.NumberFormat("en-PK", { maximumFractionDigits: 2 });
const dateFormatter = new Intl.DateTimeFormat("en-PK", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: STORE_TIME_ZONE,
});

export default async function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  await requireAdmin();
  const { orderId } = await params;
  if (!UUID_PATTERN.test(orderId)) notFound();

  const order = await getAdminOrderById(orderId);
  if (!order) notFound();

  const paymentState = order.paymentReceivedAt
    ? `Received · ${dateFormatter.format(new Date(order.paymentReceivedAt))}`
    : order.paymentMethod === "jazzcash"
      ? "Awaiting JazzCash payment"
      : "Cash on delivery";

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 md:px-10 md:py-12">
      <Link href="/admin/orders" className="text-sm text-foreground-muted underline underline-offset-4 hover:text-brand-terracotta">← All orders</Link>
      <header className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-terracotta">Order reference {order.id.slice(0, 8).toUpperCase()}</p>
        <h1 className="mt-2 font-serif text-4xl text-foreground-primary">Order details</h1>
        <p className="mt-3 text-sm text-foreground-muted">Placed {dateFormatter.format(new Date(order.createdAt))}</p>
      </header>

      <section aria-label="Order and payment status" className="mt-8 grid gap-6 border-y border-border-token py-6 sm:grid-cols-2">
        <div>
          <h2 className="font-serif text-xl text-foreground-primary">Order status</h2>
          <p className="mt-2 capitalize text-sm text-foreground-muted">{order.status}</p>
        </div>
        <div>
          <h2 className="font-serif text-xl text-foreground-primary">Payment</h2>
          <p className="mt-2 capitalize text-sm text-foreground-primary">{order.paymentMethod === "cod" ? "Cash on delivery" : order.paymentMethod}</p>
          <p className="mt-1 text-sm text-foreground-muted">{paymentState}</p>
        </div>
      </section>

      <section aria-labelledby="delivery-heading" className="mt-8">
        <h2 id="delivery-heading" className="font-serif text-2xl text-foreground-primary">Delivery details</h2>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <p className="text-foreground-primary">{order.shippingName}</p>
          <a className="text-foreground-primary underline underline-offset-4" href={`tel:${order.shippingPhone}`}>{order.shippingPhone}</a>
          <p className="text-foreground-muted">{order.shippingCity}</p>
          <p className="text-foreground-muted sm:col-span-2">{order.shippingAddress}</p>
        </div>
      </section>

      <section aria-labelledby="items-heading" className="mt-9">
        <h2 id="items-heading" className="font-serif text-2xl text-foreground-primary">Items</h2>
        <div className="mt-4 overflow-x-auto border-y border-border-token">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-background-secondary text-xs uppercase tracking-wider text-foreground-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Size</th>
                <th className="px-4 py-3 font-semibold">Color</th>
                <th className="px-4 py-3 font-semibold">Quantity</th>
                <th className="px-4 py-3 font-semibold">Unit price</th>
                <th className="px-4 py-3 font-semibold">Line total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-token">
              {order.items.map((item, index) => (
                <tr key={`${item.name}-${item.size}-${item.color}-${index}`}>
                  <td className="px-4 py-4">{item.name}</td>
                  <td className="px-4 py-4">{item.size}</td>
                  <td className="px-4 py-4">{item.color}</td>
                  <td className="px-4 py-4">{item.quantity}</td>
                  <td className="whitespace-nowrap px-4 py-4">Rs. {currencyFormatter.format(item.priceAtPurchase)}</td>
                  <td className="whitespace-nowrap px-4 py-4">Rs. {currencyFormatter.format(item.priceAtPurchase * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-between border-b border-border-token pb-5 text-sm font-semibold text-foreground-primary">
          <span>Order total</span>
          <span>Rs. {currencyFormatter.format(order.totalAmount)}</span>
        </div>
      </section>

      <div className="mt-8">
        <OrderActions orderId={order.id} status={order.status} paymentReceived={Boolean(order.paymentReceivedAt)} />
      </div>
    </main>
  );
}
