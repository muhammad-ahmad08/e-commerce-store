"use server";

import { createClient } from "@/lib/supabase/server";
import { validateCheckoutInput } from "@/lib/checkout/validation";

type CheckoutInput = {
  fullName: unknown;
  phone: unknown;
  city: unknown;
  address: unknown;
  paymentMethod: unknown;
  items: unknown;
};

type PlaceOrderResult = { orderId: string } | { error: string };

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

    const validation = validateCheckoutInput(input);
    if (!validation.value) return { error: validation.error };
    const { fullName, phone, city, address, paymentMethod, items } = validation.value;

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
