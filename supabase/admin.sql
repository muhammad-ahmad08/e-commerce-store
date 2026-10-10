-- =============================================================
-- Admin access control
-- Run in Supabase Dashboard -> SQL Editor -> New Query
-- (Run schema.sql, rls-policies.sql and checkout.sql first.)
-- =============================================================

-- -------------------------------------------------------------
-- 1. admins table. No customer-facing role may read or write it:
--    RLS on, zero policies, zero grants. Only the database owner
--    (you, in the SQL Editor) can add or remove admins.
-- -------------------------------------------------------------
create table admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table admins enable row level security;
revoke all on table admins from anon, authenticated;

-- -------------------------------------------------------------
-- 2. is_admin(): answers only "is the CURRENT caller an admin?"
--    It cannot be used to look up anyone else.
-- -------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;

-- -------------------------------------------------------------
-- 3. Read access for admins (added alongside the existing
--    "customers see their own rows" policies; Postgres combines
--    permissive policies with OR).
-- -------------------------------------------------------------
create policy "Admins can view all orders"
  on orders for select
  to authenticated
  using (public.is_admin());

create policy "Admins can view all order items"
  on order_items for select
  to authenticated
  using (public.is_admin());

-- -------------------------------------------------------------
-- 4. Make YOURSELF an admin. Run this SEPARATELY, once, after you
--    have signed up through the app. Replace the email first.
--    Do not commit your real email to the repo.
--
-- insert into admins (user_id)
-- select id from auth.users where email = 'your-email@example.com';
-- -------------------------------------------------------------
