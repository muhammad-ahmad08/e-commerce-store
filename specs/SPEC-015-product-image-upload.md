# Spec: Product Image Upload (Supabase Storage)

**Spec ID:** SPEC-015
**Phase:** Phase 8 — Orders, Payments & Admin
**Depends on:** SPEC-014 and `supabase/storage-images.sql` (already
applied to the live database and present in the repo)

## 1. Goal
Let an admin upload, replace, and remove a product's photo from the
product edit page. Photos are stored in the public `product-images`
Supabase Storage bucket and shown across the storefront. Products without
an uploaded photo keep working exactly as they do today.

## 2. Scope
### In scope
- Image section on `/admin/products/[productId]` (preview, choose,
  upload, replace, remove)
- Browser-side resize and re-encode before upload
- Direct browser-to-Storage upload using the admin's session
- A Server Action that saves or clears the product's `image_path`
- One shared image-resolution helper used everywhere product images show
- `next.config` image host configuration
- Updating `CONTEXT.md`

### Out of scope
- Multiple images per product, per-variant (color) images, galleries
- Category images, hero and story images
- Drag-to-reorder, cropping tools, bulk upload
- Moving the 5 seeded products' repo images into Storage (they keep
  working through the slug fallback)

## 3. Files to create/modify
- `src/lib/images.ts` — `getProductImageUrl(slug, imagePath)` helper
- `src/components/shop/ProductImage.tsx` — accept `slug` and optional
  `imagePath` instead of building the path itself
- `src/components/admin/ProductImageUploader.tsx` — new Client Component
- `src/app/(admin)/admin/products/actions.ts` — add `setProductImage` and
  `removeProductImage` Server Actions
- `src/lib/supabase/queries.ts` and `admin-queries.ts` — select
  `image_path` wherever product data is fetched
- `src/lib/cart/CartContext.tsx` — cart items also store `imagePath`
- Product card, product detail, cart, checkout, order confirmation, and
  admin list/edit components — pass `imagePath` to `ProductImage`
- `next.config.ts` — allow the Supabase Storage host
- `CONTEXT.md`

## 4. Requirements
1. **Image resolution order.** `getProductImageUrl(slug, imagePath)`:
   if `imagePath` is set, return the bucket's public URL for it (built
   with the Supabase client's `getPublicUrl`, never a hardcoded domain);
   otherwise return `/images/products/${slug}.jpg`. `ProductImage` still
   swaps to the design-token placeholder if the image fails to load.
2. **next.config.** Add the Supabase Storage host to
   `images.remotePatterns`, derived at build time from
   `NEXT_PUBLIC_SUPABASE_URL`, restricted to the path
   `/storage/v1/object/public/product-images/**`. Do not use the removed
   `images.domains` option. Note in `CONTEXT.md` that changing this
   variable requires restarting dev / redeploying.
3. **File rules.** Accept JPEG, PNG, or WebP only. Before uploading,
   resize in the browser so the longest side is at most 1600 px, then
   re-encode as WebP (quality about 0.85), falling back to JPEG if WebP
   encoding is unsupported. Reject non-images and anything that is still
   over 2 MB after compression, with a clear message. The bucket enforces
   2 MB and the allowed types server-side; the client checks are for
   usability only.
4. **Upload path.** Upload from the browser with the browser Supabase
   client (the admin's session) to
   `products/<productId>/<crypto.randomUUID()>.<ext>`. Always a new
   unique name; never overwrite. Do not send the file through a Server
   Action (Server Actions have a small default body limit).
5. **Saving the path.** After a successful upload, call
   `setProductImage(productId, path)`. The action must: call
   `requireAdmin()` first; verify the id is a UUID; verify `path` matches
   exactly `products/<that productId>/<uuid>.(webp|jpg|jpeg|png)`; update
   `products.image_path` with the session client; then delete the
   product's previous uploaded file from the bucket (best effort: if the
   delete fails, keep going and log it); then invalidate the storefront
   caches the same way as SPEC-014. If the action fails, the client
   deletes the file it just uploaded so nothing is orphaned.
6. **Remove image.** `removeProductImage(productId)`: `requireAdmin()`
   first, set `image_path` to null, delete the stored file (best effort),
   invalidate caches. The storefront then falls back to the slug file or
   the placeholder. Needs an inline confirmation.
7. **Uploader UI.** Show the current image (resolved via the helper), a
   file chooser, a preview of the chosen file after compression with its
   final size, an "Upload and save" button, and a "Remove image" button
   when an uploaded image exists. Disable controls while working. Show
   errors inline. Product slug stays read-only.
8. **Cart compatibility.** Cart items gain an optional `imagePath`.
   Existing carts already saved in localStorage have no `imagePath`;
   they must keep rendering using the slug fallback, with no errors.
9. **Deleting a product** (SPEC-014) should also best-effort delete its
   uploaded image.
10. **No secret key.** Only the session client is used. Storage writes
    are authorized by the admin-only policies in `storage-images.sql`.
11. **CONTEXT.md.** Document: product images live in the public
    `product-images` bucket with admin-only writes; `image_path` is
    stored instead of a URL; resolution order (uploaded image, then slug
    file, then placeholder); uploads go browser-to-Storage with
    client-side compression; the bucket enforces 2 MB and JPEG/PNG/WebP.

## 5. Acceptance Criteria (definition of "done")
- [ ] Uploading a photo to a product shows it in the admin preview, on
      its storefront card, on its product page, and in the cart after
      adding it
- [ ] Uploading a large phone-sized photo (several MB) works, because it
      is compressed first
- [ ] Replacing a photo shows the new one everywhere, and the old file is
      gone from the bucket (check Storage in the Supabase dashboard)
- [ ] Removing a photo falls back to the slug file (seeded products) or
      the placeholder (new products)
- [ ] A non-image file, and a file over the limit, are rejected with a
      clear message
- [ ] The 5 seeded products still show their original photos
- [ ] A cart saved before this change still renders without errors
- [ ] The optional customer test in `storage-images.sql` fails with a
      row-level-security error
- [ ] `npm run lint` and `npm run build` both pass

## 6. Notes / Constraints
- If an upload fails with a permissions error, do not work around it with
  a secret key or a Server Action upload; report it. It likely means
  `supabase/storage-images.sql` was not applied.
- Commit message: `feat: add product image upload with Supabase Storage`
