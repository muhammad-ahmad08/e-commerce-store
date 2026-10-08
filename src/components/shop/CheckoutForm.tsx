"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { placeOrder } from "@/app/(shop)/checkout/actions";
import { useCart } from "@/lib/cart/CartContext";

type CheckoutFormProps = {
  initialFullName: string;
  initialPhone: string;
};

const priceFormatter = new Intl.NumberFormat("en-PK", {
  maximumFractionDigits: 2,
});

export default function CheckoutForm({
  initialFullName,
  initialPhone,
}: CheckoutFormProps) {
  const router = useRouter();
  const { items, isReady, clearCart } = useCart();
  const [fullName, setFullName] = useState(initialFullName);
  const [phone, setPhone] = useState(initialPhone);
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "jazzcash">("cod");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const compactPhone = phone.trim().replace(/[\s-]/g, "");
    if (!fullName.trim() || !phone.trim() || !city.trim() || !address.trim()) {
      setError("Please fill in all delivery details.");
      return;
    }
    if (!/^\+?\d{10,13}$/.test(compactPhone)) {
      setError("Enter a valid phone number with 10 to 13 digits.");
      return;
    }
    if (items.length === 0) {
      setError("Your cart is empty. Add an item before checking out.");
      return;
    }

    startTransition(async () => {
      const result = await placeOrder({
        fullName,
        phone,
        city,
        address,
        paymentMethod,
        items: items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      });

      if ("error" in result) {
        setError(result.error);
        return;
      }

      clearCart();
      router.push(`/order-confirmation/${result.orderId}`);
    });
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-12 md:px-16 md:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-terracotta">
        Secure checkout
      </p>
      <h1 className="mt-3 font-serif text-4xl text-foreground-primary sm:text-5xl">
        Delivery &amp; payment
      </h1>

      {!isReady ? (
        <p className="mt-10 text-sm text-foreground-muted" role="status">
          Loading your cart…
        </p>
      ) : items.length === 0 ? (
        <div className="mt-10 border-y border-border-token py-14 text-center">
          <h2 className="font-serif text-2xl text-foreground-primary">
            Your cart is empty
          </h2>
          <p className="mt-3 text-sm text-foreground-muted">
            Explore the collection and add something you love.
          </p>
          <Link
            href="/shop"
            className="mt-7 inline-flex min-h-12 items-center justify-center bg-brand-forest px-7 text-xs font-semibold uppercase tracking-[0.15em] text-background-primary"
          >
            Explore the collection
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="mt-10">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="space-y-10">
              <section aria-labelledby="delivery-heading">
                <h2 id="delivery-heading" className="font-serif text-2xl text-foreground-primary">
                  Delivery details
                </h2>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Field label="Full name" id="checkout-name" value={fullName} onChange={setFullName} autoComplete="name" maxLength={120} />
                  <Field label="Phone number" id="checkout-phone" value={phone} onChange={setPhone} type="tel" autoComplete="tel" maxLength={20} />
                  <Field label="City" id="checkout-city" value={city} onChange={setCity} autoComplete="address-level2" maxLength={100} />
                  <div className="sm:col-span-2">
                    <label htmlFor="checkout-address" className="mb-2 block text-sm font-medium text-foreground-primary">
                      Delivery address
                    </label>
                    <textarea
                      id="checkout-address"
                      autoComplete="street-address"
                      required
                      maxLength={500}
                      rows={3}
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      className="w-full border border-border-token bg-background-primary px-4 py-3 text-sm outline-none transition-colors focus:border-brand-terracotta"
                    />
                  </div>
                </div>
              </section>

              <fieldset>
                <legend className="font-serif text-2xl text-foreground-primary">
                  Payment method
                </legend>
                <div className="mt-5 space-y-3">
                  <PaymentChoice
                    value="cod"
                    selected={paymentMethod}
                    onChange={setPaymentMethod}
                    title="Cash on Delivery"
                  />
                  <PaymentChoice
                    value="jazzcash"
                    selected={paymentMethod}
                    onChange={setPaymentMethod}
                    title="JazzCash"
                    help="Payment instructions will be shared after your order is placed."
                  />
                </div>
              </fieldset>
            </div>

            <aside className="h-fit bg-background-secondary p-6 sm:p-8">
              <h2 className="font-serif text-2xl text-foreground-primary">Your order</h2>
              <ul className="mt-5 divide-y divide-border-token border-y border-border-token">
                {items.map((item) => (
                  <li key={item.variantId} className="flex gap-4 py-4">
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-background-primary">
                      <Image
                        src={`/images/products/${item.productSlug}.jpg`}
                        alt={item.productName}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="font-medium text-foreground-primary">{item.productName}</p>
                      <p className="mt-1 text-xs text-foreground-muted">{item.color} / {item.size} · Qty {item.quantity}</p>
                      <p className="mt-2 text-foreground-primary">
                        Rs. {priceFormatter.format(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex justify-between text-sm font-semibold text-foreground-primary">
                <span>Total</span>
                <span>
                  Rs. {priceFormatter.format(items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0))}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-foreground-muted">
                Final item prices and availability are confirmed when your order is placed.
              </p>

              {error ? (
                <div role="alert" className="mt-5 border border-red-800/20 bg-red-50 px-4 py-3 text-sm leading-5 text-red-900">
                  <p>{error}</p>
                  <Link href="/cart" className="mt-2 inline-block font-semibold underline underline-offset-4">
                    Return to your cart
                  </Link>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isPending}
                className="mt-6 flex min-h-12 w-full items-center justify-center bg-brand-terracotta px-5 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-opacity duration-250 ease-editorial hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
              >
                {isPending ? "Placing order…" : "Place order"}
              </button>
              <Link href="/cart" className="mt-5 block text-center text-xs font-semibold uppercase tracking-[0.12em] text-brand-forest underline underline-offset-4">
                Back to cart
              </Link>
            </aside>
          </div>
        </form>
      )}
    </main>
  );
}

type FieldProps = {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  type?: string;
  maxLength: number;
};

function Field({ label, id, value, onChange, autoComplete, type = "text", maxLength }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-foreground-primary">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        required
        maxLength={maxLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 w-full border border-border-token bg-background-primary px-4 text-sm outline-none transition-colors focus:border-brand-terracotta"
      />
    </div>
  );
}

type PaymentChoiceProps = {
  value: "cod" | "jazzcash";
  selected: "cod" | "jazzcash";
  onChange: (value: "cod" | "jazzcash") => void;
  title: string;
  help?: string;
};

function PaymentChoice({ value, selected, onChange, title, help }: PaymentChoiceProps) {
  return (
    <label className="flex cursor-pointer gap-3 border border-border-token bg-background-primary p-4">
      <input
        type="radio"
        name="payment-method"
        value={value}
        checked={selected === value}
        onChange={() => onChange(value)}
        className="mt-1 accent-[var(--color-accent-terracotta)]"
      />
      <span>
        <span className="block text-sm font-medium text-foreground-primary">{title}</span>
        {help ? <span className="mt-1 block text-xs leading-5 text-foreground-muted">{help}</span> : null}
      </span>
    </label>
  );
}
