# Spec: Accessibility and Keyboard Usability

**Spec ID:** SPEC-017
**Phase:** Phase 9 — Polish & Production Readiness
**Depends on:** SPEC-002, SPEC-004, SPEC-005, SPEC-006, SPEC-007, SPEC-008, SPEC-009, SPEC-010, SPEC-011, SPEC-012, SPEC-013, SPEC-014, SPEC-015

## 1. Goal

Improve the store's baseline accessibility and keyboard usability across
customer-facing and admin experiences. Ensure people can identify where they
are, navigate primary flows without a mouse, and use the interface with reduced
motion preferences without changing its visual design direction.

## 2. Scope

### In scope
- Add a keyboard-visible skip link to the main content on storefront and admin
  layouts, with a stable main-content target on every route.
- Audit and address keyboard access, focus visibility, and semantic names/states
  for existing interactive controls across storefront and admin pages.
- Ensure the mobile navigation menu opens, closes, and returns focus predictably
  using keyboard interaction; Escape closes it and restores focus to the menu
  button.
- Ensure dialogs/inline confirmation interactions (including order cancellation,
  image removal, and destructive variant/product actions) expose appropriate
  semantics and keyboard-operable controls without introducing unnecessary
  modal behavior.
- Add global reduced-motion handling for existing CSS transitions/animations,
  and ensure newly implemented interaction patterns respect that preference.
- Preserve the current design tokens, responsive behavior, and storefront/admin
  separation.

### Out of scope
- Adding a new animation system or animation library; motion design is a
  separate follow-up spec.
- A formal WCAG conformance claim, third-party certification, or exhaustive
  audit of every possible assistive technology/browser combination.
- Changing copy, business rules, database behavior, authentication, checkout,
  or order workflows.
- Visual redesign, color palette changes, or a general component refactor.
- Adding automated accessibility testing infrastructure; test automation is
  handled in the testing phase unless a narrowly scoped existing check is
  already available.

## 3. Files to create/modify
- `src/app/globals.css` — add global `prefers-reduced-motion` handling and any
  shared accessibility utility styles required by the skip link/focus treatment.
- `src/app/(shop)/layout.tsx` — add the storefront skip link and main-content
  landmark target without changing Header/Footer behavior.
- `src/app/(admin)/admin/layout.tsx` — add an admin skip link and main-content
  landmark target while preserving the admin shell and noindex metadata.
- `src/components/shop/Header.tsx` — make the mobile navigation keyboard
  behavior, focus state, and expanded state accessible.
- Relevant existing files under `src/app/`, `src/components/shop/`, and
  `src/components/admin/` — fix only concrete keyboard, focus, labeling, or
  semantic gaps found during the accessibility pass.

## 4. Requirements

1. Each storefront and admin route must expose one main landmark with a stable
   target ID (`main-content` or another documented consistent ID). Do not add
   nested or duplicate main landmarks. Existing page-level `<main>` elements
   may need to be adjusted so the layout target does not create a duplicate.
2. Each layout must provide a “Skip to main content” link as the first
   keyboard-focusable control in its region. It may be visually hidden until
   focused, but when focused it must be visible, legible, and usable. Activating
   it moves navigation to the page's main landmark.
3. All interactive controls must be reachable and operable with the keyboard
   using native semantics wherever possible. Use links for navigation and
   buttons for actions; do not add custom keyboard handlers where native
   controls already provide the behavior.
4. Keyboard focus must have a clearly visible indicator with sufficient
   contrast against the component background. Do not remove browser outlines
   unless replacing them with an equally visible design-token-based treatment.
   Apply the treatment consistently to links, buttons, form controls, and custom
   interactive elements in both storefront and admin interfaces.
5. The mobile menu trigger must expose an accessible name, `aria-expanded`, and
   `aria-controls` that references the menu while it exists. It must work with
   Enter and Space through native button behavior. Escape closes an open menu
   and returns focus to the trigger. Activating a menu link closes the menu.
   Focus must not become trapped in this non-modal navigation panel.
6. Every form input must have a programmatically associated label. Any error,
   validation message, pending state, quantity, or status change needed to
   understand an interaction must be programmatically exposed; use suitable
   `aria-live`, `role="alert"`, or described-by associations without causing
   duplicate or excessively chatty announcements.
7. Icon-only controls must have a meaningful accessible name. Decorative icons
   must be hidden from assistive technology. Existing image alternative text
   must remain meaningful; do not use filenames or generic text as alternatives.
8. Any disclosure, expandable panel, or inline confirmation must expose its
   expanded/confirmation state and remain operable by keyboard. Destructive
   actions must retain their explicit confirmation step; this spec must not
   remove safety checks or change the action semantics.
9. Add a global `prefers-reduced-motion: reduce` rule that disables or
   substantially reduces non-essential CSS transitions and animations. It must
   not disable functional state changes or hide information. Respect the
   preference in any existing scripted movement/scroll behavior touched by
   this spec. Do not introduce new decorative animation as part of this task.
10. Motion-specific behavior beyond the reduced-motion baseline (including
    entrance/reveal effects and any animation library choice) is deferred to a
    separate motion-system spec.
11. Preserve existing routes, responsive layouts, cart/checkout/admin business
    behavior, RLS assumptions, and all admin `robots: { index: false, follow:
    false }` declarations.
12. Use existing TypeScript, App Router, and Tailwind v4 CSS-first conventions.
    Do not introduce a `tailwind.config.ts`, add an animation dependency, or
    alter any Supabase privilege/key usage.

## 5. Acceptance Criteria (definition of "done")

- [ ] On storefront and admin routes, pressing Tab first reveals a usable “Skip
      to main content” link; activating it moves to the page's single main
      landmark.
- [ ] Every route has one main landmark and no duplicate main-content target.
- [ ] A keyboard-only user can operate the main navigation, mobile menu, cart,
      product variant controls, cart quantity/remove controls, auth and checkout
      forms, admin navigation, order actions, product/variant forms, and image
      uploader controls without a pointer.
- [ ] Focus remains visibly apparent while tabbing through links, buttons,
      inputs, selects, and custom controls on both light and dark/forest
      backgrounds.
- [ ] On a mobile viewport, the menu opens with Enter/Space, Escape closes it
      and returns focus to its trigger, and activating a link closes the menu.
- [ ] Form controls have associated labels, icon-only controls have accessible
      names, and important validation/action feedback is exposed to assistive
      technology.
- [ ] Existing inline destructive confirmations can be reached and completed
      or dismissed using only the keyboard, while retaining explicit
      confirmation.
- [ ] With the operating system/browser set to reduced motion, non-essential
      CSS transitions/animations are disabled or substantially reduced, while
      state changes and content remain understandable and usable.
- [ ] No animation library or new decorative animation is introduced by this
      spec.
- [ ] Existing customer and admin flows, responsive layouts, admin noindex
      metadata, `npm run lint`, and `npm run build` continue to work.

## 6. Notes / Constraints

- SPEC-007 explicitly deferred image accessibility/SEO to Phase 9; this spec
  includes checking existing alternative text while keeping image sourcing and
  layout unchanged.
- The project already has several labels, alerts, and live regions. Review and
  refine actual gaps instead of mechanically adding ARIA attributes everywhere.
- The mobile menu is a non-modal disclosure, not a dialog. Do not trap focus or
  add dialog semantics to it.
- Browser/assistive technology behavior varies. Verify representative flows
  manually with keyboard navigation and, where available, browser accessibility
  inspection; do not claim formal WCAG certification.
- After SPEC-017, a separate SPEC-018 may define the store's motion language and
  decide whether any complex motion justifies adding Framer Motion (`motion`).
- Commit message after implementation review: `feat: improve accessibility and keyboard usability`
