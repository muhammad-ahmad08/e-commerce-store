# Spec: Product Detail Page

**Spec ID:** SPEC-006
**Phase:** Phase 6 — Storefront
**Depends on:** SPEC-005

## 1. Goal
Build the product detail page at `/products/[slug]`, with real
size/color variant selection driven by actual Supabase data (live
price and stock per selected combination), following standard e-commerce
UX patterns and our existing design tokens.

## 2. Scope
### In scope
- Two-column layout: image area (left/top) + product info (right/bottom
  on mobile)
- Breadcrumb: Home / [Category Name] / [Product Name], using real data
- Product name, dynamically-priced display (updates based on selected
  variant), full description
- Color selector (buttons/swatches for each unique color the product
  has variants in)
- Size selector (buttons for sizes available for the currently selected
  color — sizes not available for that color should be visibly
  disabled, not hidden)
- Live stock status text (e.g. "5 in stock" / "Only 2 left" / "Out of
  stock") reflecting the currently selected variant
- Quantity stepper (+/- buttons, min 1, max capped at available stock)
- Visual-only "Add to Cart" button — disabled when selected variant's
  stock is 0
- "You may also like" section below, reusing `ProductScrollRow` from
  SPEC-005, showing other active products from the same category
  (excluding the current product)

### Out of scope
- Do NOT implement real cart logic — button remains visual only,
  disabled state is real (based on real stock) but clicking it does
  nothing yet
- Do NOT build an image gallery/thumbnails — single image placeholder
  only, since each product currently has one photo, not one per variant
- No reviews/ratings section

## 3. Files to create/modify
- `src/app/(shop)/products/[slug]/page.tsx` — the page itself (Server
  Component)
- `src/components/shop/VariantSelector.tsx` — new Client Component,
  handles color/size selection state and computes the active variant
- `src/lib/supabase/queries.ts` — add `getProductBySlug(slug)` (must
  include all variants and the parent category) and
  `getRelatedProducts(categoryId, excludeProductId, limit)`

## 4. Requirements
1. Page is a Server Component using ISR (`export const revalidate =
   60`), fetching the product (with variants + category) via
   `getProductBySlug()`. If no product matches the slug, render
   Next.js's `notFound()`.
2. `VariantSelector` is a Client Component (`"use client"`) that
   receives the full list of variants as a prop, then manages: selected
   color, selected size, and derives the matching variant, its price,
   and its stock from that selection — entirely client-side from the
   data already passed in (no extra network requests needed for this).
3. When a color is selected, the size selector must only enable sizes
   that actually exist as a variant for that color (e.g. if "Black"
   only comes in size M, selecting Black should disable/hide S, L, XL
   for that color).
4. Price display updates immediately when the selected variant changes
   (different sizes can have different prices, per our schema).
5. Quantity stepper cannot exceed the selected variant's current stock,
   and cannot go below 1. If stock is 0, the stepper and Add to Cart
   button are both disabled.
6. Breadcrumb and "You may also like" both use real category data —
   no hardcoded category names.
7. If a product has zero variants (edge case), display the product's
   `base_price` and show "Currently unavailable" instead of a broken
   selector.

## 5. Acceptance Criteria (definition of "done")
- [ ] Visiting `/products/blue-denim-shirt` (or another real seeded
      slug) shows correct name, description, and variant options
- [ ] Selecting different colors correctly filters available sizes
- [ ] Selecting different sizes correctly updates the displayed price
- [ ] Selecting the White Formal Shirt's size L (seeded with 0 stock)
      shows "Out of stock" and disables Add to Cart
- [ ] Quantity stepper respects the stock cap of the selected variant
- [ ] "You may also like" shows other products from the same category,
      never including the current product itself
- [ ] Visiting a non-existent slug (e.g. `/products/does-not-exist`)
      shows a proper 404, not a crash
- [ ] `npm run lint` and `npm run build` both pass

## 6. Notes / Constraints
- Commit message: `feat: add product detail page with variant selection`
