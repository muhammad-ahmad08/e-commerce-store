# Spec: Wire Real Images (Replace All Placeholders)

**Spec ID:** SPEC-007
**Phase:** Phase 6 — Storefront (closing task)
**Depends on:** SPEC-004, SPEC-005, SPEC-006

## 1. Goal
Replace every placeholder image block across the app with real images
using `next/image`, now that actual generated images exist in
`public/images/`.

## 2. Scope
### In scope
- Hero banner section on homepage — real image instead of empty/color
  block
- Category cards (homepage + catalog sidebar, wherever they render) —
  real per-category image inside the pill/circle shape
- Product cards (homepage featured, catalog grid, recommendations row)
  — real per-product image instead of the text-overlay placeholder
- Product detail page — real product image in the main image area
- Story/brand section — real image as the section background, with a
  semi-transparent deep-forest color overlay on top so the existing
  light-colored text remains legible (do NOT simply replace the solid
  color with a plain unfiltered photo — contrast must be preserved)

### Out of scope
- Do NOT change any layout, spacing, or component structure beyond
  what's needed to swap in `next/image` — this is an asset swap, not a
  redesign
- Do NOT add multiple images per product (galleries) — one image per
  product, as already established
- Do NOT change filenames or folder structure — use exactly what's in
  `public/images/` already

## 3. Files to create/modify
- `src/components/shop/ProductCard.tsx` — replace placeholder block
  with `next/image`, sourced from `/images/products/${slug}.jpg`
- `src/components/shop/CategoryCard.tsx` (or wherever category images
  render) — replace with `next/image`, sourced from
  `/images/categories/${slug}.jpg`
- `src/app/(shop)/page.tsx` (homepage) — hero section and story section
  updated to use real images
- `src/app/(shop)/products/[slug]/page.tsx` — main product image area
  updated

## 4. Requirements
1. Use `next/image`'s `<Image>` component everywhere, not plain `<img>`
   tags — this is what gives automatic optimization/compression for
   real users despite the large source file sizes.
2. Image source paths follow the existing slug convention exactly:
   `/images/products/${product.slug}.jpg`,
   `/images/categories/${category.slug}.jpg`,
   `/images/hero/hero-banner.jpg`, `/images/story/story-section.jpg`.
3. Product and category images: use `fill` layout inside an
   appropriately sized relative-positioned container (matching the
   existing aspect-square dimensions from the placeholder blocks), with
   `object-fit: cover`.
4. Preserve the existing shape rules from CONTEXT.md: category images
   stay pill/circle-cropped (`overflow-hidden` + `rounded-full` on the
   container), product images stay sharp-edged (`rounded-none`).
5. Preserve the existing hover effect: product image `scale(1.03)` on
   card hover must still work with the real image (test this
   specifically — swapping to `next/image` sometimes requires the scale
   transform to target the `<Image>`'s wrapping element rather than the
   image itself).
6. Story section: apply the image as a background using `next/image`
   with `fill`, then layer a semi-transparent
   `--color-accent-forest`-based overlay (e.g. `rgba` version at
   roughly 70-80% opacity) between the image and the text content, so
   existing text contrast is preserved. Do not lower text contrast
   below what it currently is with the solid color background.
7. Add `alt` text for every image that meaningfully describes it (e.g.
   `alt={product.name}`, not generic/empty alt text) — this matters for
   accessibility and SEO (relevant for Phase 9 later).
8. Hero banner image should use `priority` loading (it's above the
   fold, so it should NOT lazy-load like the others).

## 5. Acceptance Criteria (definition of "done")
- [ ] Homepage hero shows the real hero image, loads immediately (no
      lazy-load flash)
- [ ] All 3 category cards show their real images, still pill/circle
      shaped
- [ ] All 5 products show their real images on homepage, catalog, and
      product detail page — sharp-edged, not cropped into circles
- [ ] Story section shows the real image with legible light text on
      top (verify this visually, not just "it renders")
- [ ] Hover scale effect on product cards still works smoothly with
      real images
- [ ] No broken image icons anywhere (would indicate a filename/path
      mismatch — check the browser console for 404s on image requests)
- [ ] `npm run lint` and `npm run build` both pass
- [ ] Lighthouse/build output shows reasonable image optimization
      (Next.js build output will show generated image sizes — flag if
      anything looks unexpectedly large)

## 6. Notes / Constraints
- If any image fails to load due to a path mismatch, check exact
  filename casing first (Linux is case-sensitive) before assuming the
  code is wrong.
- Commit message: `feat: replace placeholder images with real assets`
