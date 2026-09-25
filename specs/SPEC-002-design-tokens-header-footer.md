# Spec: Design Tokens + Header/Footer + Root Layout

**Spec ID:** SPEC-002
**Phase:** Phase 4 — Core Building Blocks
**Depends on:** SPEC-001

## 1. Goal
Wire the Premium Editorial Heritage design tokens (defined in CONTEXT.md
section 6) into Tailwind 4's CSS-first theme and global CSS, then build the
shared Header and Footer components inside the root layout so every page in
the app inherits consistent branding automatically.

## 2. Scope
### In scope
- Configure Google Fonts: **Playfair Display** (headings) and
  **Plus Jakarta Sans** (body/UI) via `next/font/google`
- Define all color tokens from CONTEXT.md as CSS custom properties in
  `globals.css`, then map them into Tailwind utilities with `@theme`
- Build `Footer` component (Server Component — no interactivity)
- Build `Header` component (Client Component — mobile menu toggle +
  cart icon with a static placeholder count)
- Wire both into `src/app/layout.tsx`

### Out of scope
- Do NOT implement real cart logic/state — cart count is a hardcoded
  placeholder (`0`) for now; real state comes in Phase 7
- Do NOT implement search functionality — deferred to a later phase
- Do NOT build any page content yet (homepage, product pages) — that's
  a separate spec

## 3. Files to create/modify
- `src/app/globals.css` — define CSS custom properties and Tailwind 4
  `@theme` mappings for CONTEXT.md section 6 colors, fonts, and editorial
  easing; use Tailwind's existing `rounded-full` and `rounded-none`
  utilities without custom radius tokens
- `src/app/layout.tsx` — import fonts, wrap children with Header + Footer
- `src/components/shop/Header.tsx` — new file, Client Component
- `src/components/shop/Footer.tsx` — new file, Server Component

## 4. Requirements
1. Fonts must be loaded via `next/font/google` (not a `<link>` tag) for
   Next.js's automatic font optimization.
2. Colors must be defined ONCE as CSS variables in `globals.css` (exact
   names/values from CONTEXT.md section 6), then referenced by Tailwind's
   `@theme` mappings — do not hardcode hex values in components.
3. Header must include: logo/store name (text is fine, no image asset
   yet), nav links (Home, Shop), a cart icon with a small badge showing
   the number `0`, and a hamburger menu icon that is only visible on
   mobile widths (use Tailwind's responsive prefixes).
4. Hamburger menu, when clicked, toggles a mobile nav panel open/closed
   using `useState` — this is why Header must be a Client Component.
5. Footer must include: store name, 2–3 placeholder link columns (e.g.
   "Shop", "Help", "Company" with a couple of placeholder links each),
   and a copyright line with the current year computed dynamically
   (`new Date().getFullYear()`), not hardcoded.
6. Header and Footer must use the deep charcoal (`--color-text-primary`)
   and warm bone ivory (`--color-bg-primary`) tokens — not Tailwind's
   default gray/white/black.
7. All interactive elements (nav links, buttons) must use the 250ms
   cubic-bezier transition token from CONTEXT.md section 6 on hover
   states.

## 5. Acceptance Criteria (definition of "done")
- [ ] `npm run dev` shows a header and footer on every page (test on
      the default homepage Next.js generated)
- [ ] Page background is warm bone ivory, not white
- [ ] Headings render in the serif font, body/nav text in the sans-serif
      font (visually distinguishable)
- [ ] Resizing the browser to mobile width hides the desktop nav links
      and shows the hamburger icon instead
- [ ] Clicking the hamburger icon toggles a visible mobile menu open
      and closed
- [ ] Cart icon shows a badge with `0`
- [ ] Footer copyright line shows the current year
- [ ] No hardcoded hex colors appear directly in `Header.tsx` or
      `Footer.tsx` — only Tailwind classes referencing the theme tokens
- [ ] `npm run lint` and `npm run build` both pass

## 6. Notes / Constraints
- If `next/font/google` doesn't have Playfair Display or Plus Jakarta
  Sans available under those exact names, use the closest CONTEXT.md
  alternative (Cormorant Garamond / Inter) and flag which was used.
- Keep Header and Footer visually simple at this stage — this spec is
  about wiring the design system correctly, not final pixel-perfect
  polish (that can be refined in Phase 9).
- Commit message: `feat: add design tokens, header, and footer`
