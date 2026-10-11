# Spec: Admin Product & Variant Management

**Spec ID:** SPEC-014
**Phase:** Phase 8 — Orders, Payments & Admin
**Depends on:** SPEC-013 and `supabase/admin-products.sql` (already
applied to the live database and present in the repo)

## 1. Goal
Let an admin create, edit, hide, and delete products and their variants
(size, color, stock, price, SKU) through the admin area, with text fields
only. Image upload is a separate, later spec.

## 2. Scope
### In scope
- `/admin/products`: list of all products, including hidden ones
- `/admin/products/new`: create a product
- `/admin/products/[productId]`: edit the product, and add, edit, and
  delete its variants
- Server Actions for each write, using the session-based Supabase client
- A fallback image so products without a photo file never show a broken
  image on the storefront
- Making storefront edits appear immediately
- Linking low-stock dashboard rows to the product edit page
- Updating `CONTEXT.md`

### Out of scope
- Image upload (next spec)
- Creating, renaming, or deleting categories (categories stay managed in
  SQL for now; the product form only offers a dropdown of existing ones)
- Bulk edit, CSV import, duplicate product, search, reordering, SEO fields

## 3. Files to create/modify
- `src/app/(admin)/admin/products/page.tsx` — list
- `src/app/(admin)/admin/products/new/page.tsx` — create page
- `src/app/(admin)/admin/products/[productId]/page.tsx` — edit page
- `src/app/(admin)/admin/products/actions.ts` — Server Actions
- `src/components/admin/ProductForm.tsx`,
  `src/components/admin/VariantsEditor.tsx` — Client Components
- `src/components/shop/ProductImage.tsx` — new Client Component wrapping
  `next/image` with a placeholder fallback
- `ProductCard.tsx` and the product detail page — use `ProductImage`
- `src/lib/supabase/admin-queries.ts` — add product list and detail
  queries
- `src/app/(admin)/admin/page.tsx` — low-stock rows link to the edit page
- `CONTEXT.md`

## 4. Requirements
1. **Admin check everywhere.** `requireAdmin()` first in every page and
   every Server Action.
2. **Product list.** Columns: name, category, variant count, total stock,
   and a Visible/Hidden badge. Newest first, 20 per page. Includes hidden
   products. Link each row to its edit page, with a "New product" button.
3. **Product fields:** name (required, max 120), slug, category
   (dropdown of existing categories, required), description (optional),
   base price (required, 0 or more, at most 2 decimals), visible
   checkbox (maps to `is_active`).
4. **Slug.** On the create form, auto-generate from the name
   (lowercase letters, digits, single hyphens) and allow editing. It must
   match `^[a-z0-9]+(?:-[a-z0-9]+)*$`, max 80. **After creation the slug
   is read-only**: it is the product's URL, and until the image-upload
   spec, the product's photo is found by slug. Show a short note saying
   so.
5. **Variant fields:** size and color (required, max 30 each), stock
   (whole number, 0 or more), price (0 or more, at most 2 decimals),
   SKU (optional, max 50). New variants prefill price from the product's
   base price. Store an empty SKU as `null`, never as an empty string
   (the SKU column is unique, so two empty strings would collide).
6. **Validate twice.** Client-side validation for usability, and the same
   rules again in every Server Action. Server-side validation is
   mandatory.
7. **Friendly database errors.** Map unique-violation errors to plain
   messages: duplicate slug ("This URL name is already used"), duplicate
   size and color on one product, and duplicate SKU. Map the foreign-key
   error on delete to "This has order history and can't be deleted. Hide
   the product or set stock to 0 instead." Never show raw database
   errors or stack traces.
8. **Do not overwrite stock by accident.** When saving a variant, send
   the `stock` value only if the admin changed it from the value the form
   loaded. Changing a price must never write a stale stock number back
   over purchases that happened in the meantime.
9. **Delete safety.** Deleting a variant or a product needs an explicit
   inline confirmation. Hiding a product (unchecking visible) is the
   normal way to remove it from the store.
10. **Storefront freshness.** After any product or variant write, call
    `revalidatePath` for the home page, `/shop` and category pages, and
    the affected `/products/[slug]` page, and also invalidate any tagged
    or time-based data cache used by the storefront product queries, so
    edits appear immediately instead of up to a minute later.
11. **Image fallback.** Create `ProductImage`: it renders `next/image`
    for `/images/products/${slug}.jpg` and, if the file does not exist
    (load error), swaps to a neutral placeholder block in the existing
    design tokens showing the product name. Use it everywhere product
    images are shown (cards, catalog, product detail, recommendations,
    cart, checkout, order confirmation, admin).
12. **No secret key, no RPC needed.** Use the normal session client and
    direct table writes; the policies from `admin-products.sql` enforce
    admin-only access. Do not use `SUPABASE_SECRET_KEY`.
13. **Never cached, never indexed.** Admin pages are dynamically rendered
    with `robots: { index: false, follow: false }`.
14. **CONTEXT.md.** Document: product and variant writes are direct table
    writes protected by admin-only RLS and column-level grants; slug is
    immutable after creation; stock is only written when changed; empty
    SKU is stored as null; products with orders are hidden, not deleted.

## 5. Acceptance Criteria (definition of "done")
- [ ] Logged out or as a customer, all `/admin/products...` routes
      redirect to login or show a 404
- [ ] Creating a product with two variants works, and it appears in
      `/shop` right away with the placeholder (no broken image icon)
- [ ] Editing a product's price shows the new price on the storefront
      immediately, without waiting a minute
- [ ] Unchecking "visible" removes the product from the home page, shop,
      and its direct URL (404), and it still appears in the admin list
      marked Hidden
- [ ] Adding a variant with an existing size and color shows the friendly
      duplicate error
- [ ] Two variants with an empty SKU can coexist
- [ ] Deleting a variant or product that has order history shows the
      friendly message and deletes nothing; deleting one with no orders
      works
- [ ] Negative price, non-numeric stock, and a bad slug are rejected
- [ ] **Stale-stock test:** open a product's edit page. In another tab,
      place an order as a customer so stock drops. Back in the first tab,
      change only the price and save. In the Table Editor, the stock must
      still show the reduced number
- [ ] Existing seeded products still show their real photos
- [ ] Low-stock dashboard rows open the right product's edit page
- [ ] `npm run lint` and `npm run build` both pass

## 6. Notes / Constraints
- Commit message: `feat: add admin product and variant management`
