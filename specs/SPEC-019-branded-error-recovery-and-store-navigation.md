# Spec: Branded Error Recovery and Store Navigation

**Spec ID:** SPEC-019
**Phase:** Phase 9 — Polish & Production Readiness (closing follow-up)
**Depends on:** SPEC-002, SPEC-012, SPEC-016, SPEC-017

## 1. Goal

Replace generic or dead-end error experiences with branded, safe recovery UI,
and make the store's header/footer navigation honest and useful. Link only to
routes that exist; show unavailable destinations as non-interactive labels
rather than fake links.

## 2. Scope

### In scope
- Add branded not-found and unexpected-error recovery experiences using the
  existing design system.
- Provide recovery actions that lead to existing storefront destinations.
- Add a Contact link to the header that targets the existing WhatsApp contact
  route when the store contact number is configured; otherwise render it as a
  non-interactive label.
- Show requested store-navigation labels such as Contact and Our Story in the
  header where appropriate, linking only to real existing routes or destinations.
- Replace footer `href="#"` placeholders with real existing routes or
  non-interactive labels.
- Preserve the admin/store layout distinction and existing noindex behavior.

### Out of scope
- Creating new Contact, Our Story, Shipping & Returns, Careers, or policy pages.
- Inventing store policies, contact details, brand history, or other customer
  claims.
- Changing checkout/order submission behavior, Supabase operations, RLS, or
  error semantics of business actions.
- Adding analytics, monitoring, logging infrastructure, or automated tests.
- General redesign of the header/footer or adding unrelated navigation items.

## 3. Files to create/modify
- `src/app/not-found.tsx` — branded not-found experience with useful links to
  existing storefront routes.
- `src/app/global-error.tsx` — safe branded fallback for uncaught application
  errors, with recovery/navigation actions and no technical details.
- `src/components/shop/Header.tsx` — include requested Contact / Our Story
  labels, linking only when there is a valid existing destination.
- `src/components/shop/Footer.tsx` — replace placeholder anchors with real
  internal/external destinations or non-interactive labels.
- `src/config/store.ts` — expose a safe WhatsApp contact URL or availability
  helper only if needed; continue reading public contact configuration from
  environment variables.
- `.env.example` — only if an already-supported public contact variable is
  missing; placeholders only.
- `CONTEXT.md` — document only durable navigation/error-recovery conventions
  established by the implementation.

## 4. Requirements

1. `src/app/not-found.tsx` must provide a clear not-found message and links to
   existing routes such as `/` and `/shop`. It must use current design tokens,
   responsive spacing, semantic headings, and accessible link names.
2. `src/app/global-error.tsx` must satisfy Next.js global error-boundary
   requirements, including its own document shell and required reset behavior.
   It must display a generic recovery message, provide a retry action using the
   boundary reset function, and provide a safe link to an existing route such as
   `/`. Never render the caught error message, stack, or sensitive data.
3. Error UI must not imply a failed checkout/order action is safe to repeat when
   transaction completion is uncertain. Keep error-boundary recovery generic;
   do not change the checkout Server Action's result or retry semantics.
4. Admin authorization and route behavior must remain unchanged. Do not expose
   admin-only details through the not-found or global-error UI. Preserve all
   existing admin `robots: { index: false, follow: false }` metadata.
5. Header and footer may link only to existing internal routes or valid,
   configured external destinations. Do not use `href="#"` as a placeholder.
6. Add a Contact header destination that opens the configured store WhatsApp
   contact using the existing normalized digits-only number and a valid `wa.me`
   URL. Open external contact links in a new tab with `rel="noopener noreferrer"`.
7. If the WhatsApp number is absent, do not render a broken or empty anchor.
   Render Contact as non-interactive text or omit it consistently in both
   header and footer. Do not invent a number or other contact method.
8. Show an Our Story label in header/footer navigation only as a non-interactive
   label unless an actual story route exists. The homepage story section is not
   a separate route; do not pretend `#` navigates to a page. If linking to the
   homepage story section is chosen, add a real stable section ID and use
   `/#<id>`; otherwise render the label as plain text.
9. Keep unavailable footer destinations (such as Shipping & Returns, Careers,
   or other not-yet-built pages) as non-interactive text. Use semantic list
   structure; do not style plain text to look like a link or make it keyboard
   focusable.
10. Header additions must remain usable at mobile and desktop widths. Preserve
    the current sticky header, mobile menu behavior, keyboard controls, focus
    indicators, and accessibility semantics from SPEC-017.
11. Contact and navigation labels must not introduce fabricated policy or
    company content. Existing store configuration values remain public
    environment variables; never expose secrets.
12. Use existing TypeScript, App Router, and Tailwind CSS v4 conventions. Do not
    introduce a new UI framework or change the application's route structure.

## 5. Acceptance Criteria (definition of "done")

- [ ] A nonexistent route renders the branded not-found page with working links
      to the homepage and shop.
- [ ] An unexpected application error renders the generic branded error page;
      retry invokes the error boundary reset, and no exception message or stack
      is displayed.
- [ ] Error pages are usable by keyboard and at mobile widths, and use visible
      focus styles and semantic headings.
- [ ] Existing protected admin routes remain protected and admin noindex
      metadata remains intact.
- [ ] Header contains the approved Contact and Our Story navigation labels at
      appropriate breakpoints; each is a real working destination or clearly
      non-interactive text, never a dead `#` link.
- [ ] With a configured WhatsApp number, Contact opens the correct `wa.me` URL
      in a new tab with safe `rel` attributes.
- [ ] Without a configured WhatsApp number, no broken or empty Contact anchor is
      rendered.
- [ ] Footer links point only to valid existing routes/destinations; unavailable
      pages appear as non-interactive labels and no `href="#"` placeholders
      remain.
- [ ] Header and footer remain responsive and preserve existing mobile-menu and
      sticky-header behavior.
- [ ] `npm run lint` and `npm run build` pass.
- [ ] Manually verify valid/invalid routes, error fallback/reset, configured and
      missing WhatsApp contact, and header/footer navigation at desktop/mobile
      widths.

## 6. Notes / Constraints

- Existing storefront routes include `/`, `/shop`, `/shop/[category]`,
  `/products/[slug]`, `/cart`, `/checkout`, `/login`, `/signup`, and
  `/order-confirmation/[orderId]`. Use links appropriate to public navigation;
  do not put private/user-specific routes in the main navigation.
- Current `storeConfig.whatsappNumber` is normalized for `wa.me` URLs. Reuse it
  instead of duplicating number normalization.
- Because no separate Our Story route currently exists, the recommended
  behavior is a real homepage section link `/#our-story` after assigning that
  section a stable ID; otherwise render “Our Story” as non-interactive text.
  Choose one behavior and apply it consistently in header/footer.
- Global error boundaries are recovery UI, not a substitute for handling
  expected business errors inline. Do not expose technical errors to customers.
- This is a focused closing follow-up for Phase 9; do not expand it into Phase
  10 test infrastructure or Phase 11 deployment.
- Commit message after implementation review: `feat: add branded error recovery and store navigation`
