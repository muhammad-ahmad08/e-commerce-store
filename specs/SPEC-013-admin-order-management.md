# Spec: Admin Order Management

**Spec ID:** SPEC-013
**Phase:** Phase 8 — Orders, Payments & Admin
**Depends on:** SPEC-012 and `supabase/admin-orders.sql` (already
applied to the live database and present in the repo)

## 1. Goal
Let an admin browse all orders, open any order, move it through its
statuses, cancel it (returning stock), and mark JazzCash/other payments
as received.

## 2. Scope
### In scope
- `/admin/orders`: list of all orders, filter by status, paginated
- `/admin/orders/[orderId]`: full order detail with action buttons
- Server Actions for status changes and the payment marker, calling the
  database functions from `admin-orders.sql`
- Linking the dashboard to these pages
- Updating `CONTEXT.md`

### Out of scope
- Product and variant management (next spec)
- Editing an order's items, address, or total
- Refunds, customer notifications, bulk actions, search, CSV export

## 3. Files to create/modify
- `src/app/(admin)/admin/orders/page.tsx` — order list
- `src/app/(admin)/admin/orders/[orderId]/page.tsx` — order detail
- `src/app/(admin)/admin/orders/actions.ts` — Server Actions
- `src/components/admin/OrderActions.tsx` — Client Component for the
  buttons (pending states, confirmation step)
- `src/lib/supabase/admin-queries.ts` — add `getAdminOrders` and
  `getAdminOrderById`
- `src/app/(admin)/admin/page.tsx` — recent-order references link to the
  detail page; the "pending orders" card links to
  `/admin/orders?status=pending`
- `CONTEXT.md` — document the order-management rules

## 4. Requirements
1. **Admin check everywhere.** `requireAdmin()` must be called at the top
   of both pages AND at the top of both Server Actions, before anything
   else.
2. **Order list.** Columns: reference (first 8 characters of the id,
   uppercased), customer name (`shipping_name`), date (in the store
   timezone from `src/config/store.ts`), total, payment method, payment
   state, and status. Newest first, 20 per page using a `?page=` param.
   A `?status=` param filters by one status; show filter links for All
   plus each status. An unrecognized `status` value must fall back to
   All, not error. Reuse the existing `Pagination` component if it can
   preserve the `status` param; otherwise generalize it minimally without
   breaking the storefront catalog.
3. **Payment state wording.** If `payment_received_at` is set: "Received"
   with the date. If not set and the method is `jazzcash`: "Awaiting
   JazzCash payment". If not set and the method is `cod`: "Cash on
   delivery".
4. **Order detail.** Show the reference, placed date, status, payment
   method and state, delivery details (name, phone as a `tel:` link,
   city, address), the items (product name, size, color, quantity,
   `price_at_purchase`, line total), and the order total. Validate that
   `orderId` is a well-formed UUID before querying; a malformed or
   unknown id must call `notFound()`, never crash.
5. **Status buttons.** Show ONLY the valid next steps for the current
   status: pending → "Confirm order" and "Cancel order"; confirmed →
   "Mark as shipped" and "Cancel order"; shipped → "Mark as delivered";
   delivered and cancelled → no buttons. This is a convenience only: the
   database function is the real enforcement.
6. **Cancel needs a second step.** Cancelling restores stock and cannot
   be undone, so require an explicit inline confirmation (for example
   "Cancel and restock? Yes / No") before calling the action.
7. **Payment marker.** A button toggles between "Mark payment received"
   and "Undo". Hide the button for cancelled orders.
8. **Server Actions** (`updateOrderStatus`, `setPaymentReceived`): call
   `requireAdmin()`; validate that the id is a UUID and the status is one
   of the five known values; call the matching RPC
   (`admin_update_order_status`, `admin_set_payment_received`) with the
   session-based server client; on success `revalidatePath` for the list,
   detail, and dashboard; on failure return the database's plain-language
   message without stack traces.
9. **Errors and pending state.** Show returned errors on the page (for
   example, if another admin already changed the order). Disable buttons
   while an action is running to prevent double submits.
10. **No direct writes, no secret key.** Never update `orders` or
    `product_variants` directly from the app, and do not use
    `SUPABASE_SECRET_KEY`. All changes go through the two RPC functions.
11. **Never cached.** Both pages are dynamically rendered. Admin
    metadata keeps `robots: { index: false, follow: false }`.
12. **CONTEXT.md.** Document that order status changes happen only through
    `admin_update_order_status()` (valid transitions only; cancelling
    restocks), the payment marker only through
    `admin_set_payment_received()`, and that admins and customers have no
    direct UPDATE privilege on `orders`.

## 5. Acceptance Criteria (definition of "done")
- [ ] Logged out or as a customer, `/admin/orders` and
      `/admin/orders/[id]` redirect to login or show a 404
- [ ] The list shows orders from all customers, newest first, and the
      status filter and pagination work
- [ ] A malformed id such as `/admin/orders/abc` shows a 404
- [ ] Walking one order through pending → confirmed → shipped → delivered
      works, and a delivered order shows no status buttons
- [ ] **Restock test:** note a variant's stock, place an order for 2 of
      it (stock drops by 2), cancel that order in the admin — stock rises
      back by 2 and the order shows as cancelled
- [ ] A cancelled order cannot be cancelled again or marked as paid
- [ ] The payment marker toggles on and off and the list reflects it
- [ ] **Stale-tab test:** open the same pending order in two browser
      tabs. In tab 1, cancel it. In tab 2 (which still shows the old
      "Confirm order" button), click "Confirm order". Tab 2 must show a
      clear error such as "Cannot change an order from cancelled to
      confirmed", the order must stay cancelled, and nothing may break
- [ ] This query returns `false` for `anon` and `true` for `authenticated`
      (customers are still blocked inside the function by `is_admin()`):
      `select has_function_privilege('anon', 'public.admin_update_order_status(uuid,text)', 'execute');`
- [ ] `npm run lint` and `npm run build` both pass

## 6. Notes / Constraints
- Commit message: `feat: add admin order management`
