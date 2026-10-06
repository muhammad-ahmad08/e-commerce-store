"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";

const priceFormatter = new Intl.NumberFormat("en-PK", {
  maximumFractionDigits: 2,
});

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-12 md:px-16 md:py-16">
      <h1 className="font-serif text-4xl text-foreground-primary sm:text-5xl">
        Your Cart
      </h1>

      {items.length === 0 ? (
        <div className="mt-12 border-y border-border-token py-16 text-center">
          <p className="font-serif text-2xl text-foreground-primary">
            Your cart is empty
          </p>
          <p className="mt-3 text-sm text-foreground-muted">
            Explore the collection and find something you love.
          </p>
          <Link
            href="/shop"
            className="mt-7 inline-flex min-h-12 items-center justify-center bg-brand-forest px-7 text-xs font-semibold uppercase tracking-[0.15em] text-background-primary transition-opacity duration-250 ease-editorial hover:opacity-90"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <ul className="divide-y divide-border-token border-y border-border-token">
            {items.map((item) => (
              <li
                key={item.variantId}
                className="grid grid-cols-[6rem_minmax(0,1fr)] gap-4 py-6 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6"
              >
                <Link
                  href={`/products/${item.productSlug}`}
                  aria-label={`View ${item.productName}`}
                  className="relative aspect-[4/5] overflow-hidden bg-background-secondary"
                >
                  <Image
                    src={`/images/products/${item.productSlug}.jpg`}
                    alt={item.productName}
                    fill
                    sizes="(max-width: 640px) 96px, 128px"
                    className="object-cover"
                  />
                </Link>

                <div className="flex min-w-0 flex-col items-start">
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="font-serif text-xl text-foreground-primary transition-colors duration-250 ease-editorial hover:text-brand-terracotta sm:text-2xl"
                  >
                    {item.productName}
                  </Link>
                  <p className="mt-2 text-sm text-foreground-muted">
                    {item.color} / {item.size}
                  </p>
                  <p className="mt-2 text-sm text-foreground-primary">
                    Rs. {priceFormatter.format(item.unitPrice)}
                  </p>

                  <div className="mt-5 flex w-full flex-wrap items-center justify-between gap-4">
                    <div
                      className="flex h-10 items-center border border-border-token"
                      aria-label={`Quantity for ${item.productName}`}
                    >
                      <button
                        type="button"
                        aria-label={`Decrease ${item.productName} quantity`}
                        disabled={item.quantity <= 1}
                        onClick={() =>
                          updateQuantity(item.variantId, item.quantity - 1)
                        }
                        className="h-full w-10 text-lg transition-colors duration-250 ease-editorial hover:text-brand-terracotta disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        −
                      </button>
                      <span
                        aria-live="polite"
                        className="min-w-8 text-center text-sm"
                      >
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase ${item.productName} quantity`}
                        disabled={item.quantity >= item.stockAtTimeAdded}
                        onClick={() =>
                          updateQuantity(item.variantId, item.quantity + 1)
                        }
                        className="h-full w-10 text-lg transition-colors duration-250 ease-editorial hover:text-brand-terracotta disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.variantId)}
                      className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground-muted underline underline-offset-4 transition-colors duration-250 ease-editorial hover:text-brand-terracotta"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit bg-background-secondary p-6 sm:p-8">
            <h2 className="font-serif text-2xl text-foreground-primary">
              Order Summary
            </h2>
            <div className="mt-6 flex justify-between border-t border-border-token pt-5 text-sm">
              <span className="text-foreground-muted">Subtotal</span>
              <span className="font-semibold text-foreground-primary">
                Rs. {priceFormatter.format(totalPrice)}
              </span>
            </div>
            <p className="mt-3 text-xs leading-5 text-foreground-muted">
              Shipping and any applicable charges are calculated at checkout.
            </p>
            <Link
              href="/checkout"
              className="mt-7 flex min-h-12 w-full items-center justify-center bg-brand-terracotta px-5 text-center text-xs font-semibold uppercase tracking-[0.15em] text-white transition-opacity duration-250 ease-editorial hover:opacity-90"
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/shop"
              className="mt-5 block text-center text-xs font-semibold uppercase tracking-[0.12em] text-brand-forest transition-colors duration-250 ease-editorial hover:text-brand-terracotta"
            >
              Continue Shopping
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
