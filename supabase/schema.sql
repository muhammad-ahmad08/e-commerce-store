-- =============================================================
-- Initial schema: categories, products, variants, profiles,
-- orders, order_items
-- Run this in Supabase Dashboard -> SQL Editor -> New Query
-- =============================================================

-- Enable UUID generation (Supabase usually has this on by default,
-- included here for explicitness/portability)
create extension if not exists "pgcrypto";

-- -------------------------------------------------------------
-- CATEGORY
-- -------------------------------------------------------------
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,        -- URL-friendly version, e.g. "mens-shirts"
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------
-- PRODUCT
-- -------------------------------------------------------------
create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text,
  base_price numeric(10, 2) not null,  -- fallback price if a variant doesn't override it
  is_active boolean not null default true,  -- lets admin "hide" a product without deleting it
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------
-- PRODUCT VARIANT (size + color combination, own stock/price)
-- -------------------------------------------------------------
create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  size text not null,
  color text not null,
  stock integer not null default 0 check (stock >= 0),
  price numeric(10, 2) not null,     -- variant's actual sellable price
  sku text unique,                   -- optional but useful for inventory tracking
  created_at timestamptz not null default now(),
  unique (product_id, size, color)   -- prevents duplicate variant combos
);

-- -------------------------------------------------------------
-- PROFILES (extends Supabase auth.users, does NOT duplicate it)
-- -------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------
-- ORDER
-- -------------------------------------------------------------
create table orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references profiles(id) on delete restrict,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  payment_method text not null
    check (payment_method in ('cod', 'jazzcash')),
  shipping_address text not null,
  total_amount numeric(10, 2) not null,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------
-- ORDER ITEM (line items inside an order)
-- -------------------------------------------------------------
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  variant_id uuid not null references product_variants(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  price_at_purchase numeric(10, 2) not null,  -- frozen at time of purchase, see Phase 2 notes
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------
-- Helpful indexes (speed up common lookups)
-- -------------------------------------------------------------
create index idx_products_category_id on products(category_id);
create index idx_variants_product_id on product_variants(product_id);
create index idx_orders_customer_id on orders(customer_id);
create index idx_order_items_order_id on order_items(order_id);