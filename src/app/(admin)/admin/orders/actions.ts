"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import {
  ADMIN_ORDER_STATUSES,
  type AdminOrderStatus,
} from "@/lib/supabase/admin-queries";
import { createClient } from "@/lib/supabase/server";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function revalidateOrderViews(orderId: string) {
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  return "The order could not be updated. Please try again.";
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: string,
): Promise<{ error?: string }> {
  await requireAdmin();

  if (!UUID_PATTERN.test(orderId)) return { error: "Invalid order reference." };
  if (!ADMIN_ORDER_STATUSES.includes(newStatus as AdminOrderStatus)) {
    return { error: "Invalid order status." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("admin_update_order_status", {
      p_order_id: orderId,
      p_new_status: newStatus,
    });
    if (error) return { error: error.message };
    revalidateOrderViews(orderId);
    return {};
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

export async function setPaymentReceived(
  orderId: string,
  received: boolean,
): Promise<{ error?: string }> {
  await requireAdmin();

  if (!UUID_PATTERN.test(orderId)) return { error: "Invalid order reference." };
  if (typeof received !== "boolean") return { error: "Invalid payment state." };

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("admin_set_payment_received", {
      p_order_id: orderId,
      p_received: received,
    });
    if (error) return { error: error.message };
    revalidateOrderViews(orderId);
    return {};
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}
