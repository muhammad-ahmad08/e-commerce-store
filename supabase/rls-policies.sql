-- =============================================================
-- Row Level Security policies + auto-profile creation trigger
-- Run this in Supabase Dashboard -> SQL Editor -> New Query
-- (Run schema.sql first if you haven't already)
-- =============================================================

-- -------------------------------------------------------------
-- Auto-create a profile row whenever someone signs up via Auth
-- -------------------------------------------------------------
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -------------------------------------------------------------
-- Enable RLS on every table (blocks all access until policies
-- below explicitly allow it)
-- -------------------------------------------------------------
alter table categories enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table profiles enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- -------------------------------------------------------------
-- Grant table-level read access; RLS policies below still filter
-- which rows the public and authenticated roles can see.
-- -------------------------------------------------------------
grant select on table categories, products, product_variants
  to anon, authenticated;

-- -------------------------------------------------------------
-- CATEGORIES: public read, no public write
-- -------------------------------------------------------------
create policy "Anyone can view categories"
  on categories for select
  using (true);

-- -------------------------------------------------------------
-- PRODUCTS: public read (active products only), no public write
-- -------------------------------------------------------------
create policy "Anyone can view active products"
  on products for select
  using (is_active = true);

-- -------------------------------------------------------------
-- PRODUCT VARIANTS: public read, no public write
-- -------------------------------------------------------------
create policy "Anyone can view product variants"
  on product_variants for select
  using (true);

-- -------------------------------------------------------------
-- PROFILES: users can view/update ONLY their own profile
-- -------------------------------------------------------------
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- -------------------------------------------------------------
-- ORDERS: users can view ONLY their own orders
-- -------------------------------------------------------------
create policy "Users can view own orders"
  on orders for select
  using (auth.uid() = customer_id);

-- -------------------------------------------------------------
-- ORDER ITEMS: users can view items belonging to THEIR OWN orders
-- (checked via a subquery into orders); inserts use place_order().
-- -------------------------------------------------------------
create policy "Users can view own order items"
  on order_items for select
  using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.customer_id = auth.uid()
    )
  );
