-- =============================================================
-- Admin order management: payment marker, status changes,
-- restock on cancel
-- Run in Supabase Dashboard -> SQL Editor -> New Query
-- (Run admin.sql first.)
-- =============================================================

-- -------------------------------------------------------------
-- 1. Payment marker. NULL = payment not marked as received;
--    a timestamp = the admin marked it received at that moment.
-- -------------------------------------------------------------
alter table orders
  add column payment_received_at timestamptz;

-- -------------------------------------------------------------
-- 2. Admins must be able to see ALL products (including inactive
--    ones) so old orders still show product names.
-- -------------------------------------------------------------
create policy "Admins can view all products"
  on products for select
  to authenticated
  using (public.is_admin());

-- -------------------------------------------------------------
-- 3. admin_update_order_status(): the ONLY way to change an
--    order's status. Admin-only, valid transitions only, and
--    cancelling returns the stock — all in one transaction.
--
--    Allowed moves:
--      pending   -> confirmed, cancelled
--      confirmed -> shipped,   cancelled
--      shipped   -> delivered
--      delivered / cancelled are final
-- -------------------------------------------------------------
create or replace function public.admin_update_order_status(
  p_order_id uuid,
  p_new_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current text;
  v_item record;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  -- Lock the order row so two admins cannot change it at once
  select status into v_current
  from orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found';
  end if;

  if not (
    (v_current = 'pending'   and p_new_status in ('confirmed', 'cancelled')) or
    (v_current = 'confirmed' and p_new_status in ('shipped', 'cancelled')) or
    (v_current = 'shipped'   and p_new_status = 'delivered')
  ) then
    raise exception 'Cannot change an order from % to %', v_current, p_new_status;
  end if;

  -- Cancelling returns every item's quantity to stock
  if p_new_status = 'cancelled' then
    for v_item in
      select variant_id, quantity from order_items where order_id = p_order_id
    loop
      update product_variants
        set stock = stock + v_item.quantity
        where id = v_item.variant_id;
    end loop;
  end if;

  update orders set status = p_new_status where id = p_order_id;
end;
$$;

-- -------------------------------------------------------------
-- 4. admin_set_payment_received(): toggle the payment marker.
--    A cancelled order cannot be marked as paid.
-- -------------------------------------------------------------
create or replace function public.admin_set_payment_received(
  p_order_id uuid,
  p_received boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  select status into v_status
  from orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found';
  end if;

  if p_received and v_status = 'cancelled' then
    raise exception 'A cancelled order cannot be marked as paid';
  end if;

  update orders
    set payment_received_at = case when p_received then now() else null end
    where id = p_order_id;
end;
$$;

-- -------------------------------------------------------------
-- 5. Execute permissions: logged-in users only. (Each function
--    also checks is_admin() itself, so a normal customer who
--    calls it is rejected with "Not authorized".)
-- -------------------------------------------------------------
revoke all on function public.admin_update_order_status(uuid, text) from public;
revoke all on function public.admin_update_order_status(uuid, text) from anon;
grant execute on function public.admin_update_order_status(uuid, text) to authenticated;

revoke all on function public.admin_set_payment_received(uuid, boolean) from public;
revoke all on function public.admin_set_payment_received(uuid, boolean) from anon;
grant execute on function public.admin_set_payment_received(uuid, boolean) to authenticated;
