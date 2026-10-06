# Spec: Cart Context + Cart UI

**Spec ID:** SPEC-008
**Phase:** Phase 7 — Cart & Checkout
**Depends on:** SPEC-006

## 1. Goal
Implement a client-side cart (React Context + localStorage) that
persists across page navigation and browser sessions, make the
product detail page's "Add to Cart" button fully functional, wire the
Header's cart badge to show the real item count, and build a `/cart`
page where items can be reviewed, quantity-adjusted, and removed.

## 2. Scope
### In scope
- `CartContext` + `CartProvider` — client-side cart state, persisted to
  localStorage, available app-wide
- Product detail page's "Add to Cart" button becomes fully functional
  (adds the currently-selected variant + quantity to the cart)
- Header cart icon badge shows the real total item count (replacing
  the hardcoded `0` placeholder from SPEC-002)
- New `/cart` page: lists cart items (image, name, size/color, unit
  price, quantity stepper, remove button), shows a subtotal, and a
  "Proceed to Checkout" button
- Adding the same variant twice increments its quantity rather than
  creating a duplicate line

### Out of scope
- Do NOT build the checkout page/flow itself — "Proceed to Checkout"
  button should navigate to `/checkout`, which doesn't exist yet (a
  404 here is expected, fixed by the next spec)
- Catalog/homepage product cards' "Add to Cart" button does NOT become
  functional in this spec — since those cards show a product without
  a chosen size/color, there's no single variant to add. That button
  should navigate to the product's detail page instead (same
  destination as clicking the card itself), where real variant
  selection happens. Only the product DETAIL page gets a truly
  functional Add to Cart.
- Do NOT re-validate stock/price against the database when viewing the
  cart — cart quantities are capped against the stock number that was
  known at the moment the item was added. Real-time re-validation
  against current database state happens at checkout time (next spec)
  — this follows the "never trust the client" principle from
  CONTEXT.md: whatever the cart displays is provisional until checkout
  confirms it server-side.

## 3. Files to create/modify
- `src/lib/cart/CartContext.tsx` — new file, Context + Provider +
  custom hook (e.g. `useCart()`)
- `src/app/layout.tsx` — wrap children with `CartProvider`
- `src/components/shop/Header.tsx` — cart badge reads real count from
  `useCart()`
- `src/app/(shop)/products/[slug]/page.tsx` /
  `src/components/shop/VariantSelector.tsx` — wire the Add to Cart
  button to call the cart's add function
- `src/components/shop/ProductCard.tsx` — "Add to Cart" button becomes
  a Link to the product page (not a cart action)
- `src/app/(shop)/cart/page.tsx` — new cart review page (Client
  Component, since it reads/mutates cart state directly)

## 4. Requirements
1. Cart item shape must capture everything needed to display and later
   check out: `variantId`, `productId`, `productSlug`, `productName`,
   `size`, `color`, `unitPrice`, `quantity`, and `stockAtTimeAdded`
   (used to cap the quantity stepper in the cart page — NOT treated as
   authoritative at checkout time).
2. `CartProvider` must load from localStorage on mount and persist on
   every change, wrapped in try/catch (localStorage can fail — e.g.
   private browsing, storage disabled — the app must not crash if so,
   just behave as an empty cart).
3. `useCart()` hook exposes: `items`, `addItem(item)`,
   `removeItem(variantId)`, `updateQuantity(variantId, quantity)`,
   `totalItems` (sum of quantities), `totalPrice` (sum of
   unitPrice × quantity).
4. `addItem`: if a cart item with the same `variantId` already exists,
   increase its quantity (capped at `stockAtTimeAdded`) instead of
   adding a duplicate row.
5. Header cart badge must update immediately (no page refresh needed)
   when an item is added anywhere in the app — this is the actual
   proof that Context is working correctly across components.
6. `/cart` page: empty state must show a friendly message ("Your cart
   is empty") and a link back to `/shop` — not a blank page.
7. Quantity stepper in the cart page respects `stockAtTimeAdded` as its
   max, and a minimum of 1 (reaching 0 should remove the item, with a
   clear action for that — e.g. a trash/remove icon, not just
   decrementing to 0 silently).
8. All new interactive elements follow existing design tokens (colors,
   transitions) — this is still the same design system, not a
   stylistic departure.

## 5. Acceptance Criteria (definition of "done")
- [ ] Adding an item on a product detail page immediately updates the
      Header badge, visible without navigating anywhere
- [ ] Adding the same variant twice results in one cart line with
      quantity 2, not two separate lines
- [ ] Refreshing the browser (or closing and reopening the tab) keeps
      the cart contents intact
- [ ] `/cart` correctly lists items with accurate subtotal
- [ ] Removing the last unit of an item removes it from the cart
      entirely
- [ ] Quantity stepper cannot exceed `stockAtTimeAdded`
- [ ] Catalog/homepage "Add to Cart" buttons navigate to the product
      page, they do NOT add anything to the cart directly
- [ ] Empty cart state displays correctly, not a blank/broken page
- [ ] `npm run lint` and `npm run build` both pass

## 6. Notes / Constraints
- This cart is intentionally NOT tied to a logged-in user — it works
  identically for anonymous and logged-in visitors, per the MVP
  decision that login is only required at checkout, not for browsing
  or adding items.
- Commit message: `feat: add cart state management and cart page`
