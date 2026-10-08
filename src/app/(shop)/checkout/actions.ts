"use server";

import { createClient } from "@/lib/supabase/server";

type CheckoutInput = {
  fullName: unknown;
  phone: unknown;
  city: unknown;
  address: unknown;
  paymentMethod: unknown;
  items: unknown;
};

type OrderItemInput = { variant_id: string; quantity: number };
type PlaceOrderResult = { orderId: string } | { error: string };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function requiredText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= maxLength ? trimmed : null;
}

function validateItems(value: unknown): OrderItemInput[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 100) {
    return null;
  }

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

export async function placeOrder(input: CheckoutInput): Promise<PlaceOrderResult> {
  try {
    if (typeof input !== "object" || input === null) {
      return { error: "Please check your delivery details and try again." };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Please log in before placing your order." };

    const fullName = requiredText(input.fullName, 120);
    const phone = requiredText(input.phone, 20);
    const city = requiredText(input.city, 100);
    const address = requiredText(input.address, 500);
    const paymentMethod = input.paymentMethod;
    const items = validateItems(input.items);
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

    const { data: orderId, error } = await supabase.rpc("place_order", {
      p_items: items,
      p_shipping_name: fullName,
      p_shipping_phone: phone,
      p_shipping_city: city,
      p_shipping_address: address,
      p_payment_method: paymentMethod,
    });

    if (error) return { error: error.message || "We couldn't place your order. Please try again." };
    if (typeof orderId !== "string") {
      return { error: "We couldn't confirm your order. Please contact support before trying again." };
    }

    return { orderId };
  } catch {
    return { error: "We couldn't place your order right now. Please try again." };
  }
}
