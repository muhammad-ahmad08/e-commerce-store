import "server-only";

import { createClient } from "@/lib/supabase/server";

export type OrderDetails = {
  id: string;
  status: string;
  paymentMethod: string;
  totalAmount: number;
  shippingName: string;
  shippingPhone: string;
  shippingCity: string;
  shippingAddress: string;
  items: Array<{
    quantity: number;
    priceAtPurchase: number;
    name: string;
    slug: string;
    size: string;
    color: string;
  }>;
};

export async function getOrderById(orderId: string): Promise<OrderDetails | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, status, payment_method, total_amount, shipping_name, shipping_phone, shipping_city, shipping_address, order_items(quantity, price_at_purchase, product_variants(size, color, products(name, slug)))",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as unknown as {
    id: string;
    status: string;
    payment_method: string;
    total_amount: number | string;
    shipping_name: string;
    shipping_phone: string;
    shipping_city: string;
    shipping_address: string;
    order_items: Array<{
      quantity: number;
      price_at_purchase: number | string;
      product_variants:
        | {
            size: string;
            color: string;
            products: { name: string; slug: string } | { name: string; slug: string }[];
          }
        | {
            size: string;
            color: string;
            products: { name: string; slug: string } | { name: string; slug: string }[];
          }[];
    }>;
  };

  const items = row.order_items.flatMap((orderItem) => {
    const variant = Array.isArray(orderItem.product_variants)
      ? orderItem.product_variants[0]
      : orderItem.product_variants;
    if (!variant) return [];
    const product = Array.isArray(variant.products) ? variant.products[0] : variant.products;
    if (!product) return [];

    return [{
      quantity: orderItem.quantity,
      priceAtPurchase: Number(orderItem.price_at_purchase),
      name: product.name,
      slug: product.slug,
      size: variant.size,
      color: variant.color,
    }];
  });

  return {
    id: row.id,
    status: row.status,
    paymentMethod: row.payment_method,
    totalAmount: Number(row.total_amount),
    shippingName: row.shipping_name,
    shippingPhone: row.shipping_phone,
    shippingCity: row.shipping_city,
    shippingAddress: row.shipping_address,
    items,
  };
}
