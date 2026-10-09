import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { storeConfig } from "@/config/store";
import { getOrderById } from "@/lib/supabase/orders";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type OrderConfirmationPageProps = {
  params: Promise<{ orderId: string }>;
};

const priceFormatter = new Intl.NumberFormat("en-PK", {
  maximumFractionDigits: 2,
});

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { orderId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(`/order-confirmation/${orderId}`)}`);
  }

  const order = await getOrderById(orderId);
  if (!order) notFound();

  const isJazzCash = order.paymentMethod === "jazzcash";
  const orderReference = order.id.slice(0, 8).toUpperCase();
  const formattedTotal = priceFormatter.format(order.totalAmount);
  const hasJazzCashDetails = Boolean(
    storeConfig.whatsappNumber &&
      storeConfig.jazzCashAccountNumber &&
      storeConfig.jazzCashAccountName,
  );
  const whatsappMessage = `Hi, I placed order ${orderReference} and sent Rs. ${formattedTotal} via JazzCash. Screenshot attached.`;
  const whatsappUrl = `https://wa.me/${storeConfig.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-12 md:px-16 md:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-terracotta">
        Order received
      </p>
      <h1 className="mt-3 font-serif text-4xl text-foreground-primary sm:text-5xl">
        Thank you for your order
      </h1>
      <p className="mt-4 text-sm leading-6 text-foreground-muted">
        Order reference <span className="font-semibold text-foreground-primary">{orderReference}</span>
      </p>

      <section className="mt-10 grid gap-8 border-y border-border-token py-8 sm:grid-cols-2" aria-label="Order details">
        <div>
          <h2 className="font-serif text-xl text-foreground-primary">Order status</h2>
          <p className="mt-3 text-sm capitalize text-foreground-muted">{order.status}</p>
          <p className="mt-2 text-sm text-foreground-muted">
            Payment: {isJazzCash ? "JazzCash" : "Cash on Delivery"}
          </p>
        </div>
        <div>
          <h2 className="font-serif text-xl text-foreground-primary">Delivery details</h2>
          <p className="mt-3 text-sm text-foreground-primary">{order.shippingName}</p>
          <p className="mt-1 text-sm text-foreground-muted">{order.shippingPhone}</p>
          <p className="mt-1 text-sm text-foreground-muted">{order.shippingAddress}, {order.shippingCity}</p>
        </div>
      </section>

      <section className="mt-9" aria-labelledby="confirmed-items-heading">
        <h2 id="confirmed-items-heading" className="font-serif text-2xl text-foreground-primary">
          Items ordered
        </h2>
        <ul className="mt-5 divide-y divide-border-token border-y border-border-token">
          {order.items.map((item, index) => (
            <li key={`${item.slug}-${item.size}-${item.color}-${index}`} className="flex gap-4 py-5">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-background-secondary">
                <Image
                  src={`/images/products/${item.slug}.jpg`}
                  alt={item.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-serif text-xl text-foreground-primary">{item.name}</p>
                  <p className="mt-1 text-sm text-foreground-muted">{item.color} / {item.size} · Qty {item.quantity}</p>
                  <p className="mt-2 text-sm text-foreground-muted">Rs. {priceFormatter.format(item.priceAtPurchase)} each</p>
                </div>
                <p className="text-sm font-medium text-foreground-primary">
                  Rs. {priceFormatter.format(item.priceAtPurchase * item.quantity)}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex justify-between border-b border-border-token pb-5 text-sm font-semibold text-foreground-primary">
          <span>Total</span>
          <span>Rs. {priceFormatter.format(order.totalAmount)}</span>
        </div>
      </section>

      {isJazzCash ? (
        <section className="mt-8 border border-border-token bg-background-secondary p-5 sm:p-7" aria-labelledby="jazzcash-instructions-heading">
          <h2 id="jazzcash-instructions-heading" className="font-serif text-2xl text-foreground-primary">
            JazzCash payment
          </h2>
          {hasJazzCashDetails ? (
            <>
              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-foreground-muted">Account name</dt>
                  <dd className="mt-1 font-semibold text-foreground-primary">{storeConfig.jazzCashAccountName}</dd>
                </div>
                <div>
                  <dt className="text-foreground-muted">Account number</dt>
                  <dd className="mt-1 font-semibold text-foreground-primary">{storeConfig.jazzCashAccountNumber}</dd>
                </div>
                <div>
                  <dt className="text-foreground-muted">Exact amount to send</dt>
                  <dd className="mt-1 font-semibold text-foreground-primary">Rs. {formattedTotal}</dd>
                </div>
                <div>
                  <dt className="text-foreground-muted">Order reference</dt>
                  <dd className="mt-1 font-semibold text-foreground-primary">{orderReference}</dd>
                </div>
              </dl>
              <p className="mt-5 text-sm leading-6 text-foreground-muted">
                Please quote your order reference when sending the payment.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex min-h-12 items-center justify-center bg-brand-terracotta px-7 text-xs font-semibold uppercase tracking-[0.15em] text-background-primary transition-colors duration-250 hover:bg-brand-forest"
              >
                Send payment screenshot on WhatsApp
              </a>
            </>
          ) : (
            <p className="mt-3 text-sm leading-6 text-foreground-primary">
              The store will contact you with payment details
            </p>
          )}
        </section>
      ) : (
        <p className="mt-8 bg-background-secondary p-5 text-sm leading-6 text-foreground-primary">
          Your order is pending. Please pay the courier when your order is delivered.
        </p>
      )}
      <Link
        href="/shop"
        className="mt-8 inline-flex min-h-12 items-center justify-center bg-brand-forest px-7 text-xs font-semibold uppercase tracking-[0.15em] text-background-primary"
      >
        Continue shopping
      </Link>
    </main>
  );
}
