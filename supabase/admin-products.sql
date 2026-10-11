-- =============================================================
-- Admin product & variant management (write access)
-- Run in Supabase Dashboard -> SQL Editor -> New Query
-- (Run admin.sql and admin-orders.sql first.)
-- =============================================================

-- -------------------------------------------------------------
-- 1. Column-level grants: the ONLY columns that can ever be
--    written through the API. id and created_at are never
--    writable, and a variant cannot be moved to another product.
--    (Grants alone let any logged-in user try; the RLS policies
--    below are what restrict writes to admins.)
-- -------------------------------------------------------------
grant insert (category_id, name, slug, description, base_price, is_active)
  on table products to authenticated;
grant update (category_id, name, slug, description, base_price, is_active)
  on table products to authenticated;
grant delete on table products to authenticated;

grant insert (product_id, size, color, stock, price, sku)
  on table product_variants to authenticated;
grant update (size, color, stock, price, sku)
  on table product_variants to authenticated;
grant delete on table product_variants to authenticated;

-- -------------------------------------------------------------
-- 2. RLS policies: admins only.
-- -------------------------------------------------------------
create policy "Admins can insert products"
  on products for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update products"
  on products for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete products"
  on products for delete
  to authenticated
  using (public.is_admin());

create policy "Admins can insert product variants"
  on product_variants for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update product variants"
  on product_variants for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete product variants"
  on product_variants for delete
  to authenticated
  using (public.is_admin());

-- -------------------------------------------------------------
-- Note: deleting a variant (or a product) that appears in any past
-- order is blocked automatically by the foreign key from
-- order_items (ON DELETE RESTRICT). That is intentional: order
-- history must never lose its items. Hide such products instead
-- (is_active = false).
-- -------------------------------------------------------------

-- -------------------------------------------------------------
-- OPTIONAL TEST (run separately, changes nothing): pretend to be a
-- NON-admin customer and try to change a price. Replace the uuid
-- with the id of your throwaway customer from Authentication ->
-- Users. Expected result: "UPDATE 0" (the policy hides every row
-- from a non-admin). If auth.uid() does not pick up the id on your
-- project, set 'request.jwt.claims' to
-- '{"sub": "<uuid>", "role": "authenticated"}' instead.
--
-- begin;
-- set local role authenticated;
-- select set_config('request.jwt.claim.sub', 'PASTE-CUSTOMER-UUID-HERE', true);
-- update products set base_price = 1 where slug = 'leather-belt';
-- rollback;
-- -------------------------------------------------------------
