-- =============================================================
-- Checkout support: shipping fields, grants, atomic place_order()
-- Run in Supabase Dashboard -> SQL Editor -> New Query
-- (Run schema.sql and rls-policies.sql first.)
-- =============================================================

-- -------------------------------------------------------------
-- 1. Structured shipping fields (courier needs name/phone/city;
--    shipping_address keeps the street address)
-- -------------------------------------------------------------
alter table orders
  add column shipping_name text,
  add column shipping_phone text,
  add column shipping_city text;

-- -------------------------------------------------------------
-- 2. Table-level grants (RLS policies alone are not enough —
--    see the categories/products grant fix in Phase 6).
--    Customers can READ their own orders/profile. They cannot
--    INSERT into orders directly: orders are created only through
--    place_order() below.
-- -------------------------------------------------------------
grant select on table orders, order_items to authenticated;
grant select, update on table profiles to authenticated;

-- -------------------------------------------------------------
-- 3. place_order(): validates, locks stock, creates the order and
--    its items, and decrements stock — all in ONE transaction.
--    If anything raises an exception, EVERYTHING rolls back.
--
--    The client sends only variant_id + quantity. Prices are read
--    from product_variants here, never trusted from the browser.
--
--    p_items example:
--      [{"variant_id": "uuid-here", "quantity": 2}, ...]
-- -------------------------------------------------------------
create or replace function public.place_order(
  p_items jsonb,
  p_shipping_name text,
  p_shipping_phone text,
  p_shipping_city text,
  p_shipping_address text,
  p_payment_method text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_order_id uuid;
  v_item jsonb;
  v_variant product_variants%rowtype;
  v_qty integer;
  v_total numeric(10, 2) := 0;
begin
  if v_user_id is null then
    raise exception 'You must be logged in to place an order';
  end if;

  if p_items is null
     or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 then
    raise exception 'Your cart is empty';
  end if;

  if p_payment_method not in ('cod', 'jazzcash') then
    raise exception 'Invalid payment method';
  end if;

  if coalesce(trim(p_shipping_name), '') = ''
     or coalesce(trim(p_shipping_phone), '') = ''
     or coalesce(trim(p_shipping_city), '') = ''
     or coalesce(trim(p_shipping_address), '') = '' then
    raise exception 'Please fill in all delivery details';
  end if;

  -- Create the order first (total is filled in after items are priced)
  insert into orders (
    customer_id, status, payment_method, total_amount,
    shipping_name, shipping_phone, shipping_city, shipping_address
  )
  values (
    v_user_id, 'pending', p_payment_method, 0,
    trim(p_shipping_name), trim(p_shipping_phone),
    trim(p_shipping_city), trim(p_shipping_address)
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item->>'quantity')::integer;

    if v_qty is null or v_qty < 1 then
      raise exception 'Invalid quantity in your cart';
    end if;

    -- Lock this variant row until the transaction ends, so two
    -- simultaneous buyers cannot both take the last unit.
    select pv.* into v_variant
    from product_variants pv
    join products p on p.id = pv.product_id
    where pv.id = (v_item->>'variant_id')::uuid
      and p.is_active = true
    for update of pv;

    if not found then
      raise exception 'An item in your cart is no longer available';
    end if;

    if v_variant.stock < v_qty then
      raise exception 'Not enough stock for size % / %: only % left',
        v_variant.size, v_variant.color, v_variant.stock;
    end if;

    update product_variants
      set stock = stock - v_qty
      where id = v_variant.id;

    insert into order_items (order_id, variant_id, quantity, price_at_purchase)
    values (v_order_id, v_variant.id, v_qty, v_variant.price);

    v_total := v_total + (v_variant.price * v_qty);
  end loop;

  update orders set total_amount = v_total where id = v_order_id;

  return v_order_id;
end;
$$;

-- -------------------------------------------------------------
-- 4. Only logged-in customers may call place_order().
--    (Postgres grants EXECUTE to everyone by default — revoke it.)
-- -------------------------------------------------------------
revoke all on function public.place_order(jsonb, text, text, text, text, text) from public;
revoke all on function public.place_order(jsonb, text, text, text, text, text) from anon;
grant execute on function public.place_order(jsonb, text, text, text, text, text) to authenticated;

-- -------------------------------------------------------------
-- 5. Least privilege cleanup
-- Applied to the live database after the policies and table grants
-- above were initially installed.
-- -------------------------------------------------------------
drop policy if exists "Users can create own orders" on orders;
drop policy if exists "Users can create own order items" on order_items;

revoke truncate, trigger, references
  on all tables in schema public from anon, authenticated;

alter default privileges in schema public
  revoke truncate, trigger, references on tables from anon, authenticated;
