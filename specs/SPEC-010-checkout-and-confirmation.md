# Spec: Checkout Page, Order Placement, Order Confirmation

**Spec ID:** SPEC-010
**Phase:** Phase 7 — Cart & Checkout
**Depends on:** SPEC-008, SPEC-009, and `supabase/checkout.sql`
(already applied to the live database and present in the repo)

## 1. Goal
Build a single-page checkout where a logged-in customer enters delivery
details, picks a payment method, reviews their order, and places it —
creating a real order in Supabase through the atomic `place_order()`
database function — followed by an order confirmation page.

## 2. Scope
### In scope
- `/checkout`: requires login (server-side check), single page with
  delivery form + payment method + order summary
- Server Action that places the order by calling the `place_order` RPC
- Clearing the cart after a successful order
- `/order-confirmation/[orderId]`: shows the placed order
- Updating `CONTEXT.md` (see requirement 10)

### Out of scope
- Real JazzCash payment gateway integration (redirects, API calls,
  merchant credentials) — that is Phase 8. In this spec, selecting
  JazzCash simply records `payment_method = 'jazzcash'` on a pending
  order, exactly like COD. The UI must be honest about this (see
  requirement 5).
- Delivery fees / shipping cost calculation (total = sum of items for
  now)
- Email/WhatsApp order notifications
- Order history page, order cancellation
- Admin order management (Phase 8)

## 3. Files to create/modify
- `src/app/(shop)/checkout/page.tsx` — Server Component: auth gate,
  loads the customer's profile for prefill, renders the form
- `src/components/shop/CheckoutForm.tsx` — Client Component (reads the
  cart via `useCart()`, manages form state)
- `src/app/(shop)/checkout/actions.ts` — Server Action `placeOrder`
- `src/lib/supabase/orders.ts` — new file: `getOrderById(orderId)`
  (user-specific data, kept separate from the public catalog queries)
- `src/app/(shop)/order-confirmation/[orderId]/page.tsx` — new page
- `CONTEXT.md` — document `place_order` (requirement 10)

## 4. Requirements
1. **Auth gate (server-side).** `/checkout` must verify the session on
   the server using the server Supabase client. If there is no
   authenticated user, redirect to `/login?redirect=/checkout`. Do not
   rely on `proxy.ts` or client-side checks for this — the check must
   live in the page/route itself.
2. **Prefill.** Prefill the full-name (and phone, if present) fields
   from the customer's `profiles` row. All fields remain editable.
3. **Form fields:** full name, phone number, city, delivery address
   (all required), payment method (radio: Cash on Delivery /
   JazzCash, default COD). Validate on the client for UX AND again in
   the Server Action — server-side validation is mandatory, client
   validation alone is never sufficient. Phone: accept 10–13 digits,
   allowing a leading `+` and common separators (spaces/dashes),
   stored trimmed.
4. **Order summary:** list cart items (image, name, size/color,
   quantity, line total), and a total. Label the amounts as
   provisional is NOT required in the UI, but the final stored total
   always comes from the database function.
5. **Honest JazzCash labeling.** Next to the JazzCash option, show
   helper text such as "Payment instructions will be shared after your
   order is placed." Do not imply the customer is charged at checkout.
6. **Placing the order.** The `placeOrder` Server Action must:
   a. Re-verify the user is authenticated.
   b. Validate all inputs server-side.
   c. Call `supabase.rpc('place_order', {...})` using the SERVER
      Supabase client (so the user's session/`auth.uid()` is
      available to the function).
   d. Send ONLY `variant_id` and `quantity` for each cart item — never
      prices, product names, or stock numbers. The database function
      is the only source of truth for price and stock.
   e. Return either `{ orderId }` on success or `{ error }` with the
      database's plain-language message (e.g. insufficient stock) on
      failure. Never expose raw stack traces.
7. **Cart handling.** Clear the cart ONLY after the action returns
   success, then navigate to `/order-confirmation/[orderId]`. On
   failure, keep the cart intact and show the error clearly, with a
   link back to `/cart`.
8. **Double-submit protection.** Disable the submit button and show a
   pending state while the action runs.
9. **Confirmation page.** Server Component, login required (same
   server-side gate). Fetch the order and its items via
   `getOrderById` using the user's session — RLS ensures a customer
   can only ever read their own orders. If the order does not exist or
   belongs to someone else, call `notFound()`. Show: a short order
   reference (first 8 characters of the id, uppercased), status,
   payment method, delivery details, items with the
   `price_at_purchase` values, total, and a next-steps message that
   differs by payment method (COD: pay the courier on delivery;
   JazzCash: instructions will follow). Because this page is
   user-specific it must NOT be statically cached or use ISR.
10. **CONTEXT.md.** Add a short section stating that all orders are
    created exclusively through the `place_order()` database function
    (atomic: validates stock, locks rows, creates order + items,
    decrements stock), that prices/stock are never accepted from the
    client, and that customers have no direct INSERT privilege on
    `orders` / `order_items`. Future specs must reuse this function
    rather than inserting orders directly.

## 5. Acceptance Criteria (definition of "done")
- [ ] Visiting `/checkout` while logged out redirects to
      `/login?redirect=/checkout`, and after login lands back on
      checkout
- [ ] Visiting `/checkout` with an empty cart shows a friendly empty
      state with a link to `/shop`
- [ ] Placing a COD order creates: one `orders` row (status
      `pending`, correct shipping fields and total) and matching
      `order_items` rows (verify in Supabase Table Editor)
- [ ] Stock in `product_variants` decreases by the purchased
      quantities
- [ ] The cart is empty after a successful order, and the confirmation
      page shows the correct details
- [ ] **Price tampering test:** manually edit a cart item's `unitPrice`
      to `1` in localStorage, place the order — `price_at_purchase`
      and `total_amount` still use the real database price
- [ ] **Stock test:** manually raise a cart item's quantity in
      localStorage above available stock, place the order — a clear
      error appears, NO order row is created, and stock is unchanged
      (this proves the transaction rolls back cleanly)
- [ ] Opening `/order-confirmation/[some-other-users-order-id]` or a
      random id shows a 404
- [ ] JazzCash order is created as `pending` with
      `payment_method = 'jazzcash'` and honest helper text shown
- [ ] `npm run lint` and `npm run build` both pass

## 6. Notes / Constraints
- If the `place_order` RPC call fails with a permission or "function
  not found" error, do not work around it by inserting into `orders`
  directly — report the problem; it likely means `supabase/checkout.sql`
  was not applied to the live database.
- Commit message: `feat: add checkout, order placement and confirmation`
