# Spec: Admin Access Control + Dashboard

**Spec ID:** SPEC-012
**Phase:** Phase 8 — Orders, Payments & Admin
**Depends on:** SPEC-011 and `supabase/admin.sql` (already applied to the
live database and present in the repo)

## 1. Goal
Create a protected admin area where only users listed in the `admins`
table can enter, with a dashboard showing order counts, recent orders,
and low-stock variants.

## 2. Scope
### In scope
- Server-side admin check helper used by every admin page
- Separate admin layout (no storefront header/footer) with a simple
  sidebar and a "Back to store" link
- `/admin` dashboard: summary counts, recent orders, low-stock variants
- Restructuring layouts so the storefront Header and Footer apply only
  to storefront pages (see requirement 1)
- Updating `CONTEXT.md`

### Out of scope
- Order status changes and order detail pages (next spec)
- Product/variant create and edit (later spec)
- Any admin account management UI — admins are added by hand in SQL
- Charts, revenue analytics, date filters

## 3. Files to create/modify
- `src/app/layout.tsx` — keep fonts, `CartProvider`, and global styles;
  remove Header/Footer from here
- `src/app/(shop)/layout.tsx` — new: wraps storefront pages with Header
  and Footer
- `src/lib/auth/requireAdmin.ts` — new helper
- `src/app/(admin)/admin/layout.tsx` — admin shell
- `src/app/(admin)/admin/page.tsx` — dashboard
- `src/components/admin/AdminSidebar.tsx` — new
- `src/lib/supabase/admin-queries.ts` — new: dashboard data functions
- `CONTEXT.md` — document the admin model

## 4. Requirements
1. **Layout restructure.** Move Header and Footer out of the root layout
   into `src/app/(shop)/layout.tsx`. All existing storefront routes live
   under `(shop)` already, so they must look and behave exactly as
   before. Verify every storefront route still shows the Header and
   Footer, and that `/admin` shows neither.
2. **`requireAdmin()`** (server-only). It must: get the current user from
   the server Supabase client with `auth.getUser()`; if there is no user,
   `redirect('/login?redirect=/admin')`; call `supabase.rpc('is_admin')`;
   if the result is not exactly `true`, call `notFound()` (a 404, so the
   admin area does not advertise its existence). It returns the user on
   success.
3. **Check on every page.** Call `requireAdmin()` in the admin layout AND
   at the top of every admin page and, in later specs, every admin Server
   Action. Layouts do not re-run on every navigation in the App Router,
   so a layout-only check is not sufficient. Add a comment saying so.
4. **No secret key.** Admin features must use the normal session-based
   server client. Do not use `SUPABASE_SECRET_KEY` anywhere. The database
   policies from `admin.sql` are what grant admins their extra read
   access.
5. **Dashboard content**, all fetched on the server:
   - Summary cards: total orders, pending orders, orders placed today
   - Recent orders: the latest 10 (reference = first 8 characters of the
     id uppercased, customer name from `shipping_name`, date, total,
     payment method, status)
   - Low stock: variants with stock of 5 or fewer, lowest first, showing
     product name, size, color, and stock (define the threshold as one
     named constant)
6. **Never cached.** Admin pages must be dynamically rendered on every
   request. Add `robots: { index: false, follow: false }` to the admin
   metadata.
7. **Empty states.** No orders yet, and no low-stock variants, must each
   show a sensible message, not an empty table.
8. Use existing design tokens. The sidebar lists Dashboard, Orders, and
   Products; Orders and Products may link to routes that do not exist yet.
9. **CONTEXT.md.** Document: admins are rows in the `admins` table, never
   a role column on `profiles` (customers can edit their own profile, so
   a role column there would let anyone promote themselves); admin status
   is checked with `is_admin()`; every admin page and action must call
   `requireAdmin()`; the database policies are the backstop.

## 5. Acceptance Criteria (definition of "done")
- [ ] Logged out, `/admin` redirects to `/login?redirect=/admin`
- [ ] Logged in as a normal customer, `/admin` shows a 404
- [ ] Logged in as an admin, `/admin` shows the dashboard and, after
      login, the redirect returns you there
- [ ] The dashboard counts and recent orders include orders from ALL
      customers, not just the admin's own
- [ ] Low-stock list matches the real stock in the database
- [ ] Every storefront page still has its Header and Footer; admin pages
      have neither
- [ ] Re-running the privilege check shows no table grants for `anon` or
      `authenticated` on `admins`
- [ ] `npm run lint` and `npm run build` both pass

## 6. Notes / Constraints
- Commit message: `feat: add admin access control and dashboard`
