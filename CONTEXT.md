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
- **Styling:** Tailwind CSS
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
2. **Secrets never reach the browser.** Supabase `service_role` key is
   server-only. Only the `anon` key may appear in client-side code.
3. **Row Level Security (RLS) must be enabled** on every Supabase table
   holding customer or order data — application code is not the only
   line of defense.
4. **Environment variables** live in `.env.local` (gitignored). `.env.example`
   documents required variables with placeholder values only.
5. **Full product variants**: stock and price are tracked per size+color
   combination, never at the product level alone.

## 8. Git Workflow
- `main` = always deployable
- Feature branches: `feature/<short-description>`
- Commit before every agent session (rollback point) and immediately after
  reviewing/accepting changes
- Commit messages: `feat:`, `fix:`, `chore:` prefixes, describe *what* changed

## 9. Agent Working Mode
- Mode: `plan` (review proposed changes before they're applied) during
  early phases; may switch to `build` + git-diff review in later phases
- Reasoning effort: `low`
- One task per spec — do not combine unrelated changes in a single session
