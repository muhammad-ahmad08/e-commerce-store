import "server-only";

import { STORE_TIME_ZONE } from "@/config/store";
import { createClient } from "@/lib/supabase/server";

export const LOW_STOCK_THRESHOLD = 5;

export const ADMIN_ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;
export type AdminOrderStatus = (typeof ADMIN_ORDER_STATUSES)[number];
export const ADMIN_ORDER_PAGE_SIZE = 20;

export type AdminOrder = {
  id: string;
  shippingName: string;
  createdAt: string;
  totalAmount: number;
  paymentMethod: string;
  paymentReceivedAt: string | null;
  status: AdminOrderStatus;
};

export type AdminOrderDetails = AdminOrder & {
  shippingPhone: string;
  shippingCity: string;
  shippingAddress: string;
  items: Array<{
    quantity: number;
    priceAtPurchase: number;
    name: string;
    size: string;
    color: string;
  }>;
};

type AdminOrderRow = {
  id: string;
  shipping_name: string;
  created_at: string;
  total_amount: number | string;
  payment_method: string;
  payment_received_at: string | null;
  status: AdminOrderStatus;
};

function mapAdminOrder(row: AdminOrderRow): AdminOrder {
  return {
    id: row.id,
    shippingName: row.shipping_name,
    createdAt: row.created_at,
    totalAmount: Number(row.total_amount),
    paymentMethod: row.payment_method,
    paymentReceivedAt: row.payment_received_at,
    status: row.status,
  };
}

export async function getAdminOrders({
  page = 1,
  status,
}: {
  page?: number;
  status?: AdminOrderStatus;
} = {}): Promise<{ orders: AdminOrder[]; totalCount: number }> {
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select(
      "id, shipping_name, created_at, total_amount, payment_method, payment_received_at, status",
      { count: "exact" },
    );

  if (status) query = query.eq("status", status);
  const currentPage = Number.isInteger(page) && page > 0 ? page : 1;
  const from = (currentPage - 1) * ADMIN_ORDER_PAGE_SIZE;
  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, from + ADMIN_ORDER_PAGE_SIZE - 1);

  if (error) throw new Error(`Failed to load admin orders: ${error.message}`);

  return {
    orders: ((data ?? []) as AdminOrderRow[]).map(mapAdminOrder),
    totalCount: count ?? 0,
  };
}

export async function getAdminOrderById(orderId: string): Promise<AdminOrderDetails | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, shipping_name, created_at, total_amount, payment_method, payment_received_at, status, shipping_phone, shipping_city, shipping_address, order_items(quantity, price_at_purchase, product_variants(size, color, products(name)))",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as unknown as AdminOrderRow & {
    shipping_phone: string;
    shipping_city: string;
    shipping_address: string;
    order_items: Array<{
      quantity: number;
      price_at_purchase: number | string;
      product_variants:
        | { size: string; color: string; products: { name: string } | { name: string }[] | null }
        | { size: string; color: string; products: { name: string } | { name: string }[] | null }[]
        | null;
    }>;
  };
  const items = row.order_items.flatMap((item) => {
    const variant = Array.isArray(item.product_variants)
      ? item.product_variants[0]
      : item.product_variants;
    if (!variant) return [];
    const product = Array.isArray(variant.products) ? variant.products[0] : variant.products;
    if (!product) return [];
    return [{
      quantity: item.quantity,
      priceAtPurchase: Number(item.price_at_purchase),
      name: product.name,
      size: variant.size,
      color: variant.color,
    }];
  });

  return {
    ...mapAdminOrder(row),
    shippingPhone: row.shipping_phone,
    shippingCity: row.shipping_city,
    shippingAddress: row.shipping_address,
    items,
  };
}

export type AdminRecentOrder = {
  id: string;
  shippingName: string;
  createdAt: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
};

export type LowStockVariant = {
  productName: string;
  size: string;
  color: string;
  stock: number;
};

export type AdminDashboardData = {
  totalOrders: number;
  pendingOrders: number;
  ordersToday: number;
  recentOrders: AdminRecentOrder[];
  lowStockVariants: LowStockVariant[];
};

function getDateParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
}

function getZonedMidnightUtc(year: number, month: number, day: number, timeZone: string) {
  const targetAsUtc = Date.UTC(year, month - 1, day);
  let result = targetAsUtc;

  // Correct the UTC guess against the requested zone; a second pass handles
  // offsets that differ across a daylight-saving boundary.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const local = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(result));
    const values = Object.fromEntries(local.map(({ type, value }) => [type, value]));
    const representedAsUtc = Date.UTC(
      Number(values.year),
      Number(values.month) - 1,
      Number(values.day),
      Number(values.hour),
      Number(values.minute),
      Number(values.second),
    );
    result += targetAsUtc - representedAsUtc;
  }

  return new Date(result).toISOString();
}

function getTodayRange(now = new Date()) {
  const { year, month, day } = getDateParts(now, STORE_TIME_ZONE);
  const tomorrow = new Date(Date.UTC(year, month - 1, day + 1));
  return {
    start: getZonedMidnightUtc(year, month, day, STORE_TIME_ZONE),
    end: getZonedMidnightUtc(
      tomorrow.getUTCFullYear(),
      tomorrow.getUTCMonth() + 1,
      tomorrow.getUTCDate(),
      STORE_TIME_ZONE,
    ),
  };
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const supabase = await createClient();
  const { start, end } = getTodayRange();

  const [totalResult, pendingResult, todayResult, recentResult, stockResult] =
    await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .gte("created_at", start)
        .lt("created_at", end),
      supabase
        .from("orders")
        .select("id, shipping_name, created_at, total_amount, payment_method, status")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("product_variants")
        .select("stock, size, color, products(name)")
        .lte("stock", LOW_STOCK_THRESHOLD)
        .order("stock", { ascending: true }),
    ]);

  for (const result of [totalResult, pendingResult, todayResult, recentResult, stockResult]) {
    if (result.error) throw new Error(`Failed to load admin dashboard: ${result.error.message}`);
  }

  const recentOrders = (recentResult.data ?? []) as Array<{
    id: string;
    shipping_name: string;
    created_at: string;
    total_amount: number | string;
    payment_method: string;
    status: string;
  }>;
  const variants = (stockResult.data ?? []) as Array<{
    stock: number;
    size: string;
    color: string;
    products: { name: string } | { name: string }[] | null;
  }>;

  return {
    totalOrders: totalResult.count ?? 0,
    pendingOrders: pendingResult.count ?? 0,
    ordersToday: todayResult.count ?? 0,
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      shippingName: order.shipping_name,
      createdAt: order.created_at,
      totalAmount: Number(order.total_amount),
      paymentMethod: order.payment_method,
      status: order.status,
    })),
    lowStockVariants: variants.flatMap((variant) => {
      const product = Array.isArray(variant.products)
        ? variant.products[0]
        : variant.products;
      return product
        ? [{
            productName: product.name,
            size: variant.size,
            color: variant.color,
            stock: variant.stock,
          }]
        : [];
    }),
  };
}
