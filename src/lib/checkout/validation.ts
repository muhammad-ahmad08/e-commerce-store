export type OrderItemInput = { variant_id: string; quantity: number };

export type ValidatedCheckoutInput = {
  fullName: string;
  phone: string;
  city: string;
  address: string;
  paymentMethod: "cod" | "jazzcash";
  items: OrderItemInput[];
};

export type CheckoutValidationResult =
  | { value: ValidatedCheckoutInput; error?: never }
  | { value?: never; error: string };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function requiredText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= maxLength ? trimmed : null;
}

function validateItems(value: unknown): OrderItemInput[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 100) return null;

  const items: OrderItemInput[] = [];
  for (const entry of value) {
    if (typeof entry !== "object" || entry === null) return null;
    const item = entry as Record<string, unknown>;
    if (
      typeof item.variantId !== "string" ||
      !UUID_PATTERN.test(item.variantId) ||
      typeof item.quantity !== "number" ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1
    ) {
      return null;
    }
    items.push({ variant_id: item.variantId, quantity: item.quantity });
  }

  return items;
}

export function validateCheckoutInput(input: unknown): CheckoutValidationResult {
  if (typeof input !== "object" || input === null) {
    return { error: "Please check your delivery details and try again." };
  }

  const values = input as Record<string, unknown>;
  const fullName = requiredText(values.fullName, 120);
  const phone = requiredText(values.phone, 20);
  const city = requiredText(values.city, 100);
  const address = requiredText(values.address, 500);
  const paymentMethod = values.paymentMethod;
  const items = validateItems(values.items);
  const compactPhone = phone?.replace(/[\s-]/g, "");

  if (!fullName || !phone || !city || !address) {
    return { error: "Please fill in all delivery details." };
  }
  if (!compactPhone || !/^\+?\d{10,13}$/.test(compactPhone)) {
    return { error: "Enter a valid phone number with 10 to 13 digits." };
  }
  if (paymentMethod !== "cod" && paymentMethod !== "jazzcash") {
    return { error: "Please choose a valid payment method." };
  }
  if (!items) return { error: "Your cart is empty or contains invalid items." };

  return {
    value: { fullName, phone, city, address, paymentMethod, items },
  };
}
