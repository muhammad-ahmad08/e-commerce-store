"use client";

import { useState, useTransition } from "react";
import {
  setPaymentReceived,
  updateOrderStatus,
} from "@/app/(admin)/admin/orders/actions";
import type { AdminOrderStatus } from "@/lib/supabase/admin-queries";

type OrderActionsProps = {
  orderId: string;
  status: AdminOrderStatus;
  paymentReceived: boolean;
};

const buttonClass = "min-h-11 border border-border-token px-4 text-xs font-semibold uppercase tracking-[0.12em] transition-colors duration-250 hover:border-brand-terracotta hover:text-brand-terracotta disabled:cursor-not-allowed disabled:opacity-50";
const primaryButtonClass = "min-h-11 bg-brand-terracotta px-4 text-xs font-semibold uppercase tracking-[0.12em] text-background-primary transition-colors duration-250 hover:bg-brand-forest disabled:cursor-not-allowed disabled:opacity-50";

export default function OrderActions({ orderId, status, paymentReceived }: OrderActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function changeStatus(nextStatus: AdminOrderStatus) {
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, nextStatus);
      if (result.error) setError(result.error);
      else setConfirmCancel(false);
    });
  }

  function togglePayment() {
    setError(null);
    startTransition(async () => {
      const result = await setPaymentReceived(orderId, !paymentReceived);
      if (result.error) setError(result.error);
    });
  }

  const statusButtons: Partial<Record<AdminOrderStatus, Array<{ label: string; next: AdminOrderStatus }>>> = {
    pending: [{ label: "Confirm order", next: "confirmed" }],
    confirmed: [{ label: "Mark as shipped", next: "shipped" }],
    shipped: [{ label: "Mark as delivered", next: "delivered" }],
  };
  const canCancel = status === "pending" || status === "confirmed";

  return (
    <section aria-label="Order actions" className="border border-border-token bg-background-secondary p-5 sm:p-6">
      <h2 className="font-serif text-xl text-foreground-primary">Actions</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        {(statusButtons[status] ?? []).map(({ label, next }) => (
          <button key={next} type="button" disabled={isPending} className={primaryButtonClass} onClick={() => changeStatus(next)}>
            {label}
          </button>
        ))}
        {canCancel ? (
          confirmCancel ? (
            <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Confirm order cancellation">
              <span className="text-sm text-foreground-primary">Cancel and restock?</span>
              <button type="button" disabled={isPending} className={primaryButtonClass} onClick={() => changeStatus("cancelled")}>
                Yes, cancel order
              </button>
              <button type="button" disabled={isPending} className={buttonClass} onClick={() => setConfirmCancel(false)}>
                No
              </button>
            </div>
          ) : (
            <button type="button" disabled={isPending} className={buttonClass} onClick={() => setConfirmCancel(true)}>
              Cancel order
            </button>
          )
        ) : null}
        {status !== "cancelled" ? (
          <button type="button" disabled={isPending} className={buttonClass} onClick={togglePayment}>
            {paymentReceived ? "Undo" : "Mark payment received"}
          </button>
        ) : null}
      </div>
      {isPending ? <p className="mt-3 text-sm text-foreground-muted" role="status">Updating order…</p> : null}
      {error ? <p className="mt-3 text-sm text-red-800" role="alert">{error}</p> : null}
    </section>
  );
}
