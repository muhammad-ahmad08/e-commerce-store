# Spec: Homepage (Hero, Categories, Featured Products, Story Section)

**Spec ID:** SPEC-004
**Phase:** Phase 6 — Storefront
**Depends on:** SPEC-003

## 1. Goal
Build the full editorial homepage, fetching real category and product
data from Supabase, applying the Premium Editorial Heritage design
system end-to-end for the first time on a real page.

## 2. Scope
### In scope
- Hero banner section (static content, no database fetch needed)
- Category showcase section — fetches all categories from Supabase,
  renders as pill-shaped cards linking to `/shop/[category-slug]`
  (the route itself doesn't need to work yet — that's a later spec;
  the link can point there even before the page exists)
- Featured products section — fetches active products (join their
  cheapest/first variant for display price), renders as a grid of
  `ProductCard` components
- Story/brand section — alternating deep-forest background band with
  placeholder brand copy (a paragraph or two, editorial tone)
- New `ProductCard` component (reusable, will be reused in Phase 6's
  later catalog page spec)

### Out of scope
- Do NOT build the actual `/shop/[category-slug]` or
  `/products/[slug]` pages yet — links can point to these paths even
  though they 404 for now
- Do NOT wire up real product images — use styled placeholder blocks
  (see requirement 6)
- Do NOT add cart functionality — "Add to Cart" buttons, if shown, are
  purely visual/non-functional for now (real logic is Phase 7)

## 3. Files to create/modify
- `src/app/(shop)/page.tsx` — the homepage itself
- `src/components/shop/ProductCard.tsx` — new reusable component
- `src/components/shop/CategoryCard.tsx` — new reusable component
- `src/lib/supabase/queries.ts` — new file, holds reusable data-fetching
  functions (e.g. `getCategories()`, `getFeaturedProducts()`) so query
  logic isn't duplicated across pages later

## 4. Requirements
1. `src/app/(shop)/page.tsx` is a Server Component that fetches data
   directly (no client-side loading state needed) using the server
   Supabase client from `src/lib/supabase/server.ts`.
2. Use Next.js ISR: export `export const revalidate = 60;` from
   `page.tsx` — matches the rendering strategy decided in Phase 2 for
   homepage/catalog content.
3. `getFeaturedProducts()` should fetch active products along with
   their variants, and compute the lowest variant price per product to
   display as "from Rs. X" on the ProductCard (since a product can have
   multiple prices across variants).
4. `ProductCard` displays: placeholder image block (aspect-square,
   bg using `--color-bg-secondary`, product name centered as text
   overlay), product name (sans-serif, per design tokens), price,
   and uses the `scale(1.03)` hover effect on the image block per
   CONTEXT.md interaction tokens.
5. `CategoryCard` uses `border-radius: 9999px` (pill shape) per
   CONTEXT.md, showing the category name centered.
6. Story/brand section must use the deep forest background
   (`--color-accent-forest`) with light text on top (readable contrast
   — do not use dark text on this dark background), consistent with
   the "alternating background bands" structural rule.
7. All sections must be responsive: category cards and product grid
   reflow to fewer columns on mobile (use Tailwind's responsive grid
   utilities).
8. Limit featured products to the first 4 active products (by
   `created_at`) for now — pagination/full catalog browsing is a
   separate spec.

## 5. Acceptance Criteria (definition of "done")
- [ ] Homepage loads and displays a hero section, 3 category cards
      (from your seeded categories), 4 featured product cards, and a
      story section
- [ ] Category cards are pill-shaped; product image placeholders are
      sharp-edged (0px radius) per design tokens
- [ ] Story section has a visibly different (deep forest) background
      than the ivory sections around it, with legible light text
- [ ] Product cards show a "from Rs. X" price reflecting each
      product's cheapest variant, not a hardcoded/wrong price
- [ ] Hovering a product card image triggers the 1.03 scale effect
      smoothly (250ms transition)
- [ ] Page is usable on both mobile and desktop widths (grid reflows,
      no horizontal overflow)
- [ ] `npm run lint` and `npm run build` both pass
- [ ] No hardcoded Supabase query logic directly inside `page.tsx` —
      all fetching goes through functions in `queries.ts`

## 6. Notes / Constraints
- If a product has zero variants (shouldn't happen with current seed
  data, but code defensively), the ProductCard should not crash —
  show the product's `base_price` as a fallback.
- Commit message: `feat: add homepage with categories and featured
  products`
