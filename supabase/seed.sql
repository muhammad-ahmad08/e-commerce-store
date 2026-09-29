-- =============================================================
-- Seed data: sample categories, products, and variants for
-- development/testing. Run in Supabase Dashboard -> SQL Editor.
-- Safe to re-run after truncating (see bottom note).
-- =============================================================

-- -------------------------------------------------------------
-- CATEGORIES
-- -------------------------------------------------------------
insert into categories (name, slug) values
  ('Men''s Shirts', 'mens-shirts'),
  ('Women''s Kurtas', 'womens-kurtas'),
  ('Accessories', 'accessories');

-- -------------------------------------------------------------
-- PRODUCTS + VARIANTS
-- Using a CTE-per-product pattern so we can grab each product's
-- generated id immediately to attach its variants.
-- -------------------------------------------------------------

-- Product 1: Blue Denim Shirt (Men's Shirts)
with p as (
  insert into products (category_id, name, slug, description, base_price, is_active)
  select id, 'Blue Denim Shirt', 'blue-denim-shirt',
         'Classic casual denim shirt, breathable cotton blend, everyday wear.',
         3500, true
  from categories where slug = 'mens-shirts'
  returning id
)
insert into product_variants (product_id, size, color, stock, price, sku)
select id, size, color, stock, price, sku from p, (values
  ('S', 'Blue', 12, 3500, 'BDS-S-BLU'),
  ('M', 'Blue', 20, 3500, 'BDS-M-BLU'),
  ('L', 'Blue', 15, 3800, 'BDS-L-BLU'),
  ('XL', 'Blue', 5, 3800, 'BDS-XL-BLU'),
  ('M', 'Black', 10, 3500, 'BDS-M-BLK')
) as v(size, color, stock, price, sku);

-- Product 2: White Formal Shirt (Men's Shirts)
with p as (
  insert into products (category_id, name, slug, description, base_price, is_active)
  select id, 'White Formal Shirt', 'white-formal-shirt',
         'Crisp white formal shirt, slim fit, easy-iron fabric.',
         4200, true
  from categories where slug = 'mens-shirts'
  returning id
)
insert into product_variants (product_id, size, color, stock, price, sku)
select id, size, color, stock, price, sku from p, (values
  ('S', 'White', 8, 4200, 'WFS-S-WHT'),
  ('M', 'White', 18, 4200, 'WFS-M-WHT'),
  ('L', 'White', 0, 4200, 'WFS-L-WHT')  -- intentionally out of stock, for testing
) as v(size, color, stock, price, sku);

-- Product 3: Embroidered Kurta (Women's Kurtas)
with p as (
  insert into products (category_id, name, slug, description, base_price, is_active)
  select id, 'Embroidered Kurta', 'embroidered-kurta',
         'Hand-embroidered detail, lightweight lawn fabric, ideal for daily wear.',
         5500, true
  from categories where slug = 'womens-kurtas'
  returning id
)
insert into product_variants (product_id, size, color, stock, price, sku)
select id, size, color, stock, price, sku from p, (values
  ('S', 'Maroon', 10, 5500, 'EK-S-MAR'),
  ('M', 'Maroon', 14, 5500, 'EK-M-MAR'),
  ('M', 'Mustard', 9, 5800, 'EK-M-MUS'),
  ('L', 'Mustard', 6, 5800, 'EK-L-MUS')
) as v(size, color, stock, price, sku);

-- Product 4: Printed Lawn Kurta (Women's Kurtas)
with p as (
  insert into products (category_id, name, slug, description, base_price, is_active)
  select id, 'Printed Lawn Kurta', 'printed-lawn-kurta',
         'Vibrant printed pattern, relaxed fit, summer-weight fabric.',
         3200, true
  from categories where slug = 'womens-kurtas'
  returning id
)
insert into product_variants (product_id, size, color, stock, price, sku)
select id, size, color, stock, price, sku from p, (values
  ('S', 'Multicolor', 20, 3200, 'PLK-S-MUL'),
  ('M', 'Multicolor', 25, 3200, 'PLK-M-MUL'),
  ('L', 'Multicolor', 11, 3200, 'PLK-L-MUL')
) as v(size, color, stock, price, sku);

-- Product 5: Leather Belt (Accessories — no size variants, one-size)
with p as (
  insert into products (category_id, name, slug, description, base_price, is_active)
  select id, 'Leather Belt', 'leather-belt',
         'Genuine leather belt with brushed metal buckle.',
         2200, true
  from categories where slug = 'accessories'
  returning id
)
insert into product_variants (product_id, size, color, stock, price, sku)
select id, size, color, stock, price, sku from p, (values
  ('One Size', 'Brown', 30, 2200, 'LB-OS-BRN'),
  ('One Size', 'Black', 25, 2200, 'LB-OS-BLK')
) as v(size, color, stock, price, sku);

-- -------------------------------------------------------------
-- To reset and re-seed during development, run this first:
--
-- truncate order_items, orders, product_variants, products, categories
-- restart identity cascade;
--
-- (Not included as an active statement — uncomment manually, and
-- never run this against real customer data.)
-- -------------------------------------------------------------