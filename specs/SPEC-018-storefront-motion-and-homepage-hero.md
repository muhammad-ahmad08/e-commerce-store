# Spec: Storefront Motion and Homepage Hero

**Spec ID:** SPEC-018
**Phase:** Phase 9 — Polish & Production Readiness
**Depends on:** SPEC-002, SPEC-004, SPEC-007, SPEC-017

## 1. Goal

Add a polished, animated entrance to the homepage hero while establishing
consistent motion guidelines for the rest of this e-commerce store. Keep
shopping interactions fast, predictable, accessible, and consistent with the
existing editorial design system.

## 2. Scope

### In scope
- Add a restrained entrance animation to the homepage hero's text and image.
- Add a subtle, hero-image-only scroll parallax effect.
- Reveal the hero copy with an Intersection Observer, including a restrained
  word-by-word headline entrance.
- Add a subtle magnetic response and text/arrow shift to the hero collection CTA.
- Add a center-out underline hover/focus transition to the Home and Shop
  navigation links. This is the explicitly approved, sole non-hero decorative
  motion exception in this spec.
- Follow established e-commerce interaction patterns everywhere else: use
  subtle, short feedback for direct user actions, and avoid decorative motion
  that delays or distracts from shopping tasks.
- Respect the `prefers-reduced-motion` behavior established in SPEC-017.
- Choose the simplest motion implementation that meets the hero requirements;
  use CSS unless coordinated sequencing or exit behavior makes a motion library
  materially useful.

### Out of scope
- Site-wide page-transition animations, scroll-triggered reveals on other
  sections, parallax outside the homepage hero, autoplay media, carousels, or
  animated backgrounds.
- Animating product cards or product images beyond the existing hover effect
  defined in CONTEXT.md.
- Animating cart, checkout, payment, authentication, or admin workflows.
- Adding sound, video, or new visual assets.
- Redesigning the homepage hero or changing its copy, layout, or image.

## 3. Files to create/modify
- `src/app/(shop)/page.tsx` — apply the hero motion to existing hero copy and
  image without changing its content or layout.
- `src/components/shop/HeroMotion.tsx` — progressive hero reveal, parallax, and
  magnetic CTA behavior.
- `src/components/shop/Header.tsx` — add the Home/Shop underline treatment.
- `src/app/globals.css` — only if small, reusable motion styles are needed;
  preserve SPEC-017 reduced-motion handling.
- `package.json` and `package-lock.json` — only if the implementation requires
  a motion dependency after applying the decision rule below.
- `CONTEXT.md` — document only durable motion conventions established by this
  spec; do not add one-off hero implementation details.

## 4. Requirements

1. The homepage hero must animate its existing text content and hero image into
   view on initial page load. Keep the animation restrained and editorial: a
   short fade with a small vertical movement is preferred. Do not animate the
   hero indefinitely or replay it in a way that interferes with navigation.
2. The hero content must remain visible and usable if JavaScript is delayed,
   disabled where applicable, or animation cannot run. Motion must be
   progressive enhancement, not a prerequisite to reveal the heading, CTA, or
   image.
3. Respect `prefers-reduced-motion: reduce`: skip the entrance movement and
   reveal the hero immediately, with no material motion. Do not override or
   weaken the global reduced-motion rules from SPEC-017.
4. Preserve the hero's semantic order, heading hierarchy, CTA link behavior,
   image alternative text, LCP-friendly priority loading, responsive layout,
   and existing design tokens.
5. Avoid animating layout-affecting properties such as dimensions, margins, or
   grid placement. Prefer opacity and transform for the entrance effect.
6. Keep the hero animation brief and non-blocking. It must not delay access to
   the CTA, block pointer or keyboard input, or cause a noticeable content
   layout shift.
7. For all other interactions, follow modern e-commerce motion conventions:
   motion should be brief, subtle, and directly communicate the user action or
   state change. Existing button/link transitions and product image hover remain
   as currently specified. Do not add decorative motion elsewhere as part of
   this task; the explicitly approved Home/Shop underline is the only
   non-hero decorative motion addition.
8. Use CSS transitions/keyframes for the hero unless the implementation
   demonstrably needs coordinated sequencing or exit animation that CSS cannot
   provide cleanly. Add Framer Motion (the `motion` package) only if that need is
   shown; if added, use its supported React entry point and ensure reduced-motion
   behavior is explicit in the component, not dependent only on global CSS.
9. Do not add an animation framework, shared motion abstraction, or dependency
   solely for a one-off fade-and-rise effect.
10. Keep the existing product hover scale (`1.03`) and 250ms editorial easing
    intact. Do not increase motion intensity or duration globally.
11. If this change establishes permanent project-wide motion rules, update
    `CONTEXT.md` with those concise rules. Leave hero-specific values and
    acceptance details in this spec.
12. The hero image may move a few pixels slower than the page scroll using
    transform only. Disable this effect for reduced-motion users and avoid
    layout changes or scroll work outside the hero.
13. Use Intersection Observer for the hero text reveal. Keep source text
    visible before JavaScript runs and when the observer is unavailable; do not
    split or alter accessible text content.
14. The hero CTA may respond gently to a nearby mouse/pen pointer and shift its
    label/arrow on hover. Keep the link immediately usable, limit displacement,
    and disable magnetic motion for touch and reduced-motion preferences.
15. Home and Shop navigation links must show an underline that grows from the
    center on hover and keyboard focus. This is explicitly approved despite
    being additional to the originally requested hero-only animation. Preserve
    visible focus indicators and show the underline without animation when
    reduced motion is requested.

## 5. Acceptance Criteria (definition of "done")

- [ ] On a normal homepage load, the hero copy and image enter with a subtle,
      short animation consistent with the editorial design.
- [ ] The animation does not prevent immediate keyboard or pointer use of the
      hero CTA and does not visibly shift the page layout.
- [ ] With reduced motion enabled, the hero content is immediately visible and
      does not perform the entrance movement.
- [ ] The page remains usable if motion code does not run; no hero text or CTA
      remains hidden.
- [ ] Hero semantics, image alt text, priority loading, and mobile/desktop layout
      remain intact.
- [ ] No new animations are added to other sections, product cards, cart,
      checkout, authentication, or admin flows.
- [ ] The only non-hero decorative motion is the explicitly approved center-out
      Home/Shop navigation underline.
- [ ] The existing product-card hover scale and transition behavior remain
      unchanged.
- [ ] Hero parallax, text reveal, and magnetic CTA remain subtle, do not alter
      layout, and are disabled or reduced for reduced-motion users.
- [ ] Hero text remains available if JavaScript or Intersection Observer does
      not run; the image retains priority loading and its existing alt text.
- [ ] Home/Shop links show a center-out underline on hover and focus, without
      weakening keyboard focus or reduced-motion behavior.
- [ ] No motion dependency is added unless the requirements justify it; any
      added dependency is documented in the implementation summary.
- [ ] `npm run lint` and `npm run build` pass.
- [ ] Reduced-motion and normal-motion behavior are verified in a browser.

## 6. Notes / Constraints

- The project uses Next.js App Router, TypeScript, Tailwind CSS v4, and the
  Premium Editorial Heritage tokens documented in `CONTEXT.md`.
- SPEC-017 established global reduced-motion handling; this spec must build on
  that behavior, not replace it.
- Modern e-commerce standards favor fast, legible interaction feedback over
  decorative animation. Avoid motion that delays product discovery, adds
  checkout friction, or distracts from important state changes.
- Recommended default is CSS-only for this hero. Reconsider Framer Motion only
  if the approved design calls for coordinated multi-step sequencing or exit
  animation that CSS would make materially harder to maintain.
- Commit message after implementation review: `feat: animate homepage hero`
