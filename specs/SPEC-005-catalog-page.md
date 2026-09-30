# Spec: Catalog Page (Shop Listing with Filters & Pagination)

**Spec ID:** SPEC-005
**Phase:** Phase 6 — Storefront
**Depends on:** SPEC-004

## 1. Goal
Build the product catalog page — a filterable, paginated product listing
reachable at `/shop` (all products) and `/shop/[category-slug]`
(filtered by category), matching the layout skeleton provided, adapted
to our own design tokens and current data/feature scope.

## 2. Scope
### In scope
- Sub-header: left-aligned heading text, right-aligned search input
  (visual only — no functional search logic, matches header's deferred
  search)
- Sidebar: "All Products" + one link per real category (from Supabase),
  with the active category visually highlighted; a "New Arrival" link
  that sorts products by `created_at` descending via a query param
  (e.g. `?sort=new`)
- Product grid: 3 columns desktop, responsive down to 1 column mobile.
  Each card: category pill tag, image placeholder, product name,
  "from Rs. X" price, and a visual-only "Add to Cart" button. Clicking
  the card (outside the button) navigates to `/products/[slug]`.
- Real pagination: page size of 9 products, using a `?page=` query
  param, with Previous/Next and numbered page links
- "Explore our recommendations" section below the grid: a plain
  horizontal-scrolling row (CSS `overflow-x-auto`, scroll-snap), no JS
  carousel/arrow buttons, showing a handful of other active products
- Footer CTA banner: dark forest-background block with heading text
  and a visual-only email input + submit button (not wired to save
  data yet)

### Out of scope
- No star ratings/reviews anywhere on this page (not in MVP scope)
- No "Best Seller" / "On Discount" sidebar filters — no data exists to
  back these; do not fabricate
- No functional search, no functional email capture
- No "Buy Now" button — only "Add to Cart" (visual only)
- Do NOT build a JS carousel — horizontal scroll only, as decided

## 3. Files to create/modify
- `src/app/(shop)/shop/page.tsx` — all-products catalog page
- `src/app/(shop)/shop/[category]/page.tsx` — category-filtered version
  (should share logic/components with the page above, not duplicate)
- `src/components/shop/CategorySidebar.tsx` — new component
- `src/components/shop/Pagination.tsx` — new component
- `src/components/shop/ProductScrollRow.tsx` — new component (the
  horizontal-scroll recommendations section — build this reusably,
  since SPEC-006's product page will also use it for "related
  products")
- `src/lib/supabase/queries.ts` — add `getProducts({ categorySlug?,
  sort?, page? })` with count for pagination, and
  `getRandomActiveProducts(excludeId?, limit)` for the recommendations
  row

## 4. Requirements
1. Both catalog routes are Server Components using ISR
   (`export const revalidate = 60`).
2. `getProducts()` must support: optional category filter, optional
   sort (default vs. newest-first), and pagination (page size 9),
   returning both the page of results and the total count needed to
   render pagination.
3. Sidebar category links use real category slugs from Supabase — do
   not hardcode category names/links.
4. The active category (or "All Products") must be visually
   distinguished in the sidebar (e.g. bold text + accent-colored
   trailing icon/indicator), consistent with CONTEXT.md tokens.
5. Product cards in this page reuse the existing `ProductCard`
   component from SPEC-004 — do not create a second, slightly
   different card component.
6. `ProductScrollRow` must accept a list of products as a prop and
   render them using the existing `ProductCard`, inside a horizontally
   scrollable container. Must work on both mobile (touch scroll) and
   desktop (mouse drag or trackpad scroll — no custom JS drag-to-scroll
   needed, native browser scroll is sufficient).
7. Pagination must reflect the real total product count — if there are
   5 seeded products and page size is 9, pagination controls should
   not appear at all (only one page exists). Test this is handled
   gracefully, not just assumed.
8. Footer CTA banner uses `--color-accent-forest` background per
   design tokens, consistent with the story section's alternating-band
   pattern from SPEC-004.

## 5. Acceptance Criteria (definition of "done")
- [ ] `/shop` shows all 5 seeded products across the grid
- [ ] `/shop/mens-shirts` (or your actual category slug) shows only
      that category's products, with the sidebar correctly highlighting
      it
- [ ] Clicking a product card navigates to `/products/[slug]` (even
      though that page doesn't exist yet until SPEC-006 — a 404 here is
      expected and fine for now)
- [ ] No ratings, no fabricated review counts anywhere
- [ ] Pagination either works correctly or correctly hides itself when
      there's only one page of results
- [ ] Recommendations row scrolls horizontally without layout-breaking
      on mobile
- [ ] `npm run lint` and `npm run build` both pass

## 6. Notes / Constraints
- Commit message: `feat: add catalog page with filters and pagination`
