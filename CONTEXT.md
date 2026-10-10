# Project Context — Fashion & Apparel E-Commerce Store

> This file holds everything that is ALWAYS true for this project.
> Add this file to every OpenCode session (`/add CONTEXT.md`) before giving any task.
> Do not repeat this information in task specs — reference it instead.

## 1. Project Summary
A production-ready e-commerce store template for physical fashion/apparel
businesses in Pakistan. Built as a portfolio/client-demo project, so code
quality, security, and maintainability matter as much as features.

## 2. Tech Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript (strict mode) — no plain `.js` files in `src/`
- **Styling:** Tailwind CSS v4 — CSS-first theming via `@theme` in
  `src/app/globals.css`; there is no `tailwind.config.ts` and future specs
  must not create one
- **Database/Backend:** Supabase (Postgres, Auth, Storage)
- **Payments:** Cash on Delivery + JazzCash
- **Package manager:** npm (never yarn/pnpm — keep lockfile consistent)
- **Deployment target:** Vercel

## 3. Folder Structure (do not deviate)
```
src/
├── app/
│   ├── (shop)/          # customer-facing routes
│   ├── (admin)/         # admin routes (protected)
│   └── api/             # API routes
├── components/
│   ├── ui/              # generic, reusable (Button, Card, Input)
│   └── shop/            # domain-specific (ProductCard, CartItem)
├── lib/                 # utilities, Supabase client setup
├── types/               # shared TypeScript types/interfaces
└── styles/              # global styles, Tailwind config
```

## 4. Naming Conventions
- Components: `PascalCase.tsx` (e.g. `ProductCard.tsx`)
- Utilities/functions: `camelCase.ts` (e.g. `formatPrice.ts`)
- Route folders: `kebab-case` (e.g. `order-confirmation/`)
- Database tables/columns: `snake_case` (Postgres convention)

## 5. Core Data Model (conceptual — see /specs for exact schema when built)
`Category` → has many → `Product` → has many → `ProductVariant`
`Customer` → has many → `Order` → has many → `OrderItem` → references one `ProductVariant`

Key rule: `OrderItem.price_at_purchase` is stored independently of the
product's current price — historical orders must never change retroactively
when prices are updated later.

## 6. Design Tokens (Premium Editorial Heritage system)
### Colors
```
--color-bg-primary: #FBF9F4        /* Warm Bone Ivory */
--color-bg-secondary: #EFECE3      /* Soft Linen Tint */
--color-text-primary: #2A2A2A      /* Deep Charcoal */
--color-text-muted: #6E6A62        /* Antique Muted Gray */
--color-accent-terracotta: #8C3B23 /* Primary CTA/Brand */
--color-accent-forest: #1A3B32     /* Story/Secondary */
--color-border-subtle: rgba(42,42,42,0.08)
```
### Typography
- Headings: Serif — Cormorant Garamond / Playfair Display
- Body/UI: Sans-serif — Plus Jakarta Sans / Inter
- Nav/CTAs: uppercase, 0.875rem, weight 600, letter-spacing 0.15em

### Spacing & Shape
- 8px base grid
- Mobile margin: 20px (p-5) | Desktop margin: 64px (p-16), max-w-7xl centered
- Category elements: `border-radius: 9999px` (pill)
- Product/story media: `border-radius: 0px` (sharp edges)
- Wishlist overlay: `backdrop-filter: blur(8px); background: rgba(255,255,255,0.7)`

### Interaction
- Transitions: `250ms cubic-bezier(0.4, 0, 0.2, 1)`
- Product card image hover: `scale(1.03)` inside `overflow-hidden`
- Alternating background bands between sections (ivory ↔ deep forest)

## 7. Non-Negotiable Business Rules
1. **Never trust the client.** All prices, stock levels, and totals are
   recalculated server-side — never accepted as-is from client requests.
2. **Secrets never reach the browser.** The Supabase publishable key is
   designed for browser use with low privilege and RLS enforcement. The
   secret key is server-only and has elevated privileges that can bypass RLS.
   These names replace the legacy `anon` and `service_role` terminology;
   their underlying privilege levels are unchanged. Never expose the secret
   key in client-side code or `NEXT_PUBLIC_` environment variables.
3. **Row Level Security (RLS) must be enabled** on every Supabase table
   holding customer or order data — application code is not the only
   line of defense.
4. **Environment variables** live in `.env.local` (gitignored). `.env.example`
   documents required variables with placeholder values only.
5. **Full product variants**: stock and price are tracked per size+color
   combination, never at the product level alone.

## 8. Order Placement
- All customer orders are created exclusively through the `place_order()`
  database function. It atomically validates and locks variant stock, creates
  the order and its items, then decrements stock; a failure rolls back the
  complete transaction.
- Prices and stock are never accepted from the client. The function reads
  current prices and stock from the database and stores purchase-time prices
  on order items.
- Customers have no direct INSERT privilege on `orders` or `order_items`.
  Future specs and order flows must reuse `place_order()` rather than inserting
  order records directly.

## 9. Git Workflow
- `main` = always deployable
- Feature branches: `feature/<short-description>`
- Commit before every agent session (rollback point) and immediately after
  reviewing/accepting changes
- Commit messages: `feat:`, `fix:`, `chore:` prefixes, describe *what* changed

## 10. Agent Working Mode
- Mode: `plan` (review proposed changes before they're applied) during
  early phases; may switch to `build` + git-diff review in later phases
- Reasoning effort: `low`
- One task per spec — do not combine unrelated changes in a single session

## 11. Supabase Client Locations
- `src/lib/supabase/client.ts` — browser client for Client Components, using
  `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- `src/lib/supabase/server.ts` — cookie-aware server client for Server
  Components, Server Actions, and Route Handlers, using the publishable key.
- `proxy.ts` — refreshes Supabase Auth cookies on incoming requests. Next.js
  16 uses the `proxy.ts` convention (renamed from `middleware.ts`).
- `SUPABASE_SECRET_KEY` is reserved for later server-only administrative
  operations; it is not used by these standard SSR clients.

## 12. Store Configuration
- `src/config/store.ts` exports public store contact and payment details from
  environment variables. The WhatsApp number is normalized to digits only for
  `wa.me` links.
- Configure `NEXT_PUBLIC_STORE_WHATSAPP_NUMBER`,
  `NEXT_PUBLIC_JAZZCASH_ACCOUNT_NUMBER`, and
  `NEXT_PUBLIC_JAZZCASH_ACCOUNT_NAME` in `.env.local` for the JazzCash payment
  instructions and WhatsApp click-to-chat link.

## 13. Admin Access
- Admins are identified exclusively by rows in the `admins` table. Never store
  admin status as a role column on `profiles`: customers can edit their own
  profile, so a profile role could let a customer promote themselves.
- Application admin access is checked with the `is_admin()` database function
  through the authenticated, session-based Supabase server client.
- Every admin page and every admin Server Action must call
  `requireAdmin()` itself. An admin layout also checks access, but layouts may
  not re-run during App Router navigation.
- Database RLS policies and privileges are the backstop for admin data access;
  application checks are not a replacement for database authorization.
- Admin dashboard dates use the `STORE_TIME_ZONE` constant (`Asia/Karachi`).
