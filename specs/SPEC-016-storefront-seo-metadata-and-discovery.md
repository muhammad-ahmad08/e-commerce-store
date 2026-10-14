# Spec: Storefront SEO Metadata and Discovery

**Spec ID:** SPEC-016
**Phase:** Phase 9 — Polish & Production Readiness
**Depends on:** SPEC-004, SPEC-005, SPEC-006, SPEC-007

## 1. Goal

Give public storefront pages meaningful, route-specific metadata and provide
search engines with a sitemap and robots policy. Keep private, transactional,
and admin pages out of search results, and do not expose customer or order data.

## 2. Scope

### In scope
- Set a canonical production origin using a documented environment variable.
- Add route-specific metadata for the homepage, catalog, category catalog, and
  active product detail pages.
- Add a sitemap containing only the homepage, `/shop`, real category routes,
  and active product routes.
- Add a robots policy that allows public storefront routes and disallows
  private, transactional, and admin routes.
- Keep metadata generation server-side and use existing Supabase query helpers
  where possible.

### Out of scope
- Social sharing image generation or new Open Graph image assets.
- Structured data / JSON-LD.
- Search ranking guarantees or keyword research.
- Customer-specific page metadata, analytics, or tracking.
- Visual redesign or changes to product/category content.
- Changes to authentication, order placement, RLS, or database schema.
- Accessibility, performance, automated testing, or deployment work; those
  should be separate tasks/specs.

## 3. Files to create/modify
- `.env.example` — document the public site-origin variable with a placeholder.
- `src/app/layout.tsx` — configure `metadataBase` and reusable default metadata.
- `src/app/(shop)/page.tsx` — add homepage-specific metadata.
- `src/app/(shop)/shop/page.tsx` — add catalog metadata.
- `src/app/(shop)/shop/[category]/page.tsx` — generate category metadata from
  real category data; return a not-found result for unknown category slugs.
- `src/app/(shop)/products/[slug]/page.tsx` — generate product metadata from
  the active product record; return a not-found result for missing/inactive
  products.
- `src/app/sitemap.ts` — add a sitemap using the App Router metadata route.
- `src/app/robots.ts` — add the robots policy using the App Router metadata
  route.
- `src/lib/supabase/queries.ts` — add/reuse narrowly scoped helpers to retrieve
  the category/product data and last-modified values needed by metadata and the
  sitemap, if existing functions do not already provide them.

## 4. Requirements

1. The canonical site origin must come from `NEXT_PUBLIC_SITE_URL`. Add this
   variable to `.env.example` with a safe placeholder URL. Do not read
   `.env.local` into source or commit any real deployment URL or secret.
2. `metadataBase` must be a valid absolute URL derived from that variable. If
   it is missing or invalid, fail clearly during build/startup rather than
   silently generating malformed canonical URLs.
3. Metadata must be produced only on the server. Do not expose private customer,
   order, profile, or admin data in metadata, sitemap URLs, or robots output.
4. The root metadata must define a reusable default title and description.
   Page-specific metadata must override the title and description where
   specified below:
   - Homepage: store name/brand and a concise store description.
   - `/shop`: a catalog title and description.
   - `/shop/[category]`: category name in the title and a concise category
     description derived from available public data; do not fabricate product
     claims.
   - `/products/[slug]`: product name in the title and description. Use the
     product description when present; otherwise use a short neutral fallback.
5. Category metadata must use the real category record. An unknown category slug
   must render a 404 and must not receive metadata pretending it is a valid
   category.
6. Product metadata must use `getProductBySlug()` or an equivalent existing
   public query. Hidden/inactive products and nonexistent slugs must not
   receive public product metadata and must resolve as not found.
7. Canonical URLs must be absolute URLs based on `NEXT_PUBLIC_SITE_URL`.
   Category and product canonical paths must use the actual route slug, with
   no query-string parameters. Catalog page/sort query variants must not be
   advertised as separate canonical pages.
8. The sitemap must contain:
   - `/`
   - `/shop`
   - one `/shop/[category-slug]` URL for each real category
   - one `/products/[product-slug]` URL for each active product
   It must not include cart, login, signup, checkout, order-confirmation, or
   admin URLs.
9. Use `created_at` for `lastModified` when the corresponding public query
   provides it. If it is unavailable, omit `lastModified` instead of inventing
   a timestamp.
10. The robots policy must allow public storefront crawling and disallow:
    `/admin`, `/cart`, `/checkout`, `/login`, `/signup`, and
    `/order-confirmation`. It must include the absolute sitemap URL.
11. Do not rely on robots rules as authorization. Existing server-side auth,
    `requireAdmin()`, and database RLS remain the security controls for private
    data.
12. Do not include user-specific order confirmation URLs in the sitemap or
    expose order identifiers in metadata.
13. Keep existing admin `robots: { index: false, follow: false }` metadata
    intact.
14. Use the established TypeScript, App Router, and Supabase query patterns.
    Do not introduce a `tailwind.config.ts`, new database table, or privileged
    Supabase key usage.

## 5. Acceptance Criteria (definition of "done")

- [ ] `NEXT_PUBLIC_SITE_URL` is documented in `.env.example` without a real
      deployment URL.
- [ ] `npm run build` succeeds with the configured site-origin variable.
- [ ] The homepage and `/shop` expose meaningful title, description, and
      absolute canonical URL metadata.
- [ ] A valid category page uses the real category name and canonical slug;
      an unknown category returns 404.
- [ ] An active product page uses its real product name/description and
      canonical slug; an inactive or unknown product returns 404.
- [ ] Catalog query variants such as `?page=2` and `?sort=new` do not produce
      query-specific canonical URLs.
- [ ] `/sitemap.xml` includes the expected public storefront routes and excludes
      all private/transactional/admin routes.
- [ ] `/robots.txt` includes the sitemap URL and disallows the specified private
      paths.
- [ ] No customer/order data or secret key is exposed through metadata,
      sitemap, or robots output.
- [ ] Existing admin pages remain non-indexable.
- [ ] `npm run lint` and `npm run build` both pass.

## 6. Notes / Constraints

- The project currently uses the brand name “Aurelia”; use it consistently
  unless the store-name configuration is made configurable in a separate spec.
- Existing public product/category queries may need small, targeted additions
  to return slugs and `created_at`; avoid duplicating full query logic.
- This spec establishes technical metadata and crawl discovery only. It does
  not promise search-engine indexing or rankings.
- Commit message after implementation review: `feat: add storefront SEO metadata and sitemap`
