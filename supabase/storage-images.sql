-- =============================================================
-- Product image upload: image_path column, Storage bucket,
-- admin-only write policies
-- Run in Supabase Dashboard -> SQL Editor -> New Query
-- (Run admin.sql and admin-products.sql first.)
-- =============================================================

-- -------------------------------------------------------------
-- 1. Where a product's uploaded image lives inside the bucket,
--    e.g. 'products/<product-id>/<uuid>.webp'. NULL means "no
--    uploaded image": the storefront then falls back to the
--    /images/products/<slug>.jpg file in the repo.
-- -------------------------------------------------------------
alter table products add column image_path text;

grant insert (image_path), update (image_path)
  on table products to authenticated;

-- -------------------------------------------------------------
-- 2. The bucket. Public = anyone can VIEW an image by its URL.
--    The limits are enforced by Storage itself, so they cannot be
--    bypassed from the browser: max 2 MB, JPEG/PNG/WebP only.
-- -------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- -------------------------------------------------------------
-- 3. WHO may write. Admins only. We only ever upload new files
--    (unique names) and delete old ones, so no UPDATE policy is
--    granted. The admin SELECT policy lets the Storage API find
--    the object it is about to delete.
-- -------------------------------------------------------------
create policy "Admins can upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admins can view product image objects"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

create policy "Admins can delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

-- -------------------------------------------------------------
-- OPTIONAL TEST (run separately, changes nothing): pretend to be a
-- NON-admin customer and try to add a file to the bucket. Replace
-- the uuid with your throwaway customer's id (Authentication ->
-- Users). Expected result: an error saying the new row violates
-- row-level security. If auth.uid() does not pick up the id, set
-- 'request.jwt.claims' to
-- '{"sub": "<uuid>", "role": "authenticated"}' instead.
--
-- begin;
-- set local role authenticated;
-- select set_config('request.jwt.claim.sub', 'PASTE-CUSTOMER-UUID-HERE', true);
-- insert into storage.objects (bucket_id, name)
--   values ('product-images', 'products/test/fake.jpg');
-- rollback;
-- -------------------------------------------------------------
