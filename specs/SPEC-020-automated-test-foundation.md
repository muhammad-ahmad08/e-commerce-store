# Spec: Automated Test Foundation and Critical Logic Coverage

**Spec ID:** SPEC-020
**Phase:** Phase 10 — Testing
**Depends on:** SPEC-001, SPEC-003, SPEC-008, SPEC-009, SPEC-010, SPEC-012, SPEC-013, SPEC-014, SPEC-015

## 1. Goal

Add a maintainable, repeatable automated test foundation and cover the
highest-value business logic that can be tested deterministically without
connecting to production services. Preserve development-time manual verification
as evidence; automate the stable logic checks without re-running or replacing
manual Supabase/RLS verification.

## 2. Scope

### In scope
- Choose and configure a TypeScript-compatible unit/component test runner that
  works with the existing Next.js, React, and TypeScript stack.
- Add a `npm test` script and a documented test command for CI/local use, without
  adding a CI pipeline.
- Extract or expose pure functions where needed so cart, checkout-input, and
  product/variant validation logic can be unit-tested independently from React,
  Supabase, Next.js request state, and browser storage.
- Add deterministic automated tests for cart validation/calculations and key
  checkout and admin-product input validation rules.
- Add tests for store URL normalization or other pure helpers only where they
  provide useful coverage without introducing broad refactors.
- Keep the previously completed manual end-to-end checks documented as manual
  verification evidence rather than repeating those workflows in this spec.
- Document how to run tests and clearly distinguish automated coverage from
  manual Supabase-dependent verification.

### Out of scope
- Live Supabase integration tests, RLS/privilege verification, or database RPC
  tests against any environment.
- Browser end-to-end automation (Playwright/Cypress) or visual regression tests.
- CI/CD workflows, deployment, monitoring, analytics, or coverage-gate policy.
- Re-running or changing checkout/order/admin business behavior solely to make
  tests easier.
- Mocking Supabase in ways that would claim to validate actual database
  authorization, atomicity, stock locking, or transaction behavior.
- Repeating the completed manual cart, checkout, stock, admin, and image-upload
  acceptance tests unless a newly discovered regression requires it.

## 3. Files to create/modify
- `package.json` — add the chosen test command and test-runner dependency.
- `package-lock.json` — lock dependency changes using npm.
- Test-runner configuration file (for example `vitest.config.ts`) — configure
  TypeScript path aliases and an appropriate test environment.
- `src/lib/cart/` — extract pure cart-item validation and cart total/merge/
  quantity logic as needed, preserving current behavior.
- `src/lib/checkout/` or equivalent pure module — extract checkout input
  validation only if required to test it without importing Server Actions.
- `src/lib/admin/` or equivalent pure module — extract product/variant
  validation only if required to test it without importing Server Actions.
- `tests/` or co-located `*.test.ts` files — add deterministic unit tests using
  the repository's chosen convention.
- `README.md` — add concise commands and explain the automated/manual test
  boundary, only if README is the agreed project testing guide.
- `CONTEXT.md` — only if the test command or testing conventions become durable
  project-wide rules; do not add implementation-specific test details.

## 4. Requirements

1. Before adding dependencies, inspect installed package versions and choose a
   maintained test runner compatible with the existing Node, TypeScript, React,
   and Next.js versions. Prefer a lightweight runner for this initial unit-test
   scope; do not add a browser automation framework in this spec.
2. The test runner must support the project's `@/` TypeScript path alias and
   execute tests without requiring a running Next.js server, credentials,
   `.env.local`, or a Supabase connection.
3. Add `npm test` (or another clearly named npm script) that runs the automated
   suite once, exits non-zero on test failures, and is suitable for local use.
   Do not add yarn/pnpm scripts or lockfiles.
4. Cart tests must cover at minimum:
   - Valid and invalid persisted cart-item shapes, including optional
     `imagePath` compatibility for older saved carts.
   - Totals: item count and subtotal from quantities and unit prices.
   - Adding an already-present variant merges into one line and respects the
     stock cap; different variants remain separate.
   - Quantity updates respect the minimum and stock maximum according to the
     existing cart API behavior; removing an item removes only its variant.
5. Checkout validation tests must cover the pure validation rules used by the
   Server Action, including required trimmed text, supported payment methods,
   phone format, valid variant UUID and positive integer quantity, and rejection
   of empty/oversized/malformed item input. Tests must assert the sanitized RPC
   item shape contains only `variant_id` and `quantity`; they must not claim to
   verify the RPC, order creation, prices, stock locking, or rollback.
6. Product/variant validation tests must cover the existing server-side rules:
   required/max-length fields, slug syntax/length, non-negative money with at
   most two decimal places, whole-number non-negative stock, optional SKU size,
   and null normalization for blank SKU where implemented in the extracted pure
   boundary. Preserve current friendly validation semantics.
7. Testable logic extraction must be behavior-preserving and narrowly scoped.
   Keep Supabase calls, Next.js cache invalidation, redirects, `notFound()`, and
   Server Action orchestration outside pure unit modules. Do not duplicate
   validation logic between tested helpers and production call sites.
8. Avoid requiring DOM emulation or rendering the full app unless a specific
   test requires it. If a DOM environment is used, explain why and keep its
   dependency scope minimal.
9. Tests must be deterministic: no live Supabase calls, network calls, current
   timestamps, random data, production credentials, or dependency on execution
   order. Use fixed values and explicit fixtures.
10. Keep test fixtures synthetic and free of real customer details, tokens,
    account numbers, and secrets.
11. Add only high-value coverage for pure business logic. Do not attempt to
    unit-test React/Next internals or simulate database security in memory.
12. Record the manual verification already completed during development for
    cart persistence/merge/caps, checkout order placement and tampering/stock
    rollback, authorization and admin transitions/restocking, product
    visibility, and image upload/fallback. Record it as prior manual evidence,
    not as automated test coverage. Do not claim those behaviors are currently
    reverified by this spec.
13. Document the commands needed to run automated tests, lint, and a production
    build. Keep them compatible with npm. The build may require a temporary
    HTTPS `NEXT_PUBLIC_SITE_URL` override as in the current project setup; tests
    themselves must not require it unless importing application metadata code.
14. This spec must not modify Supabase SQL, environment secrets, or any live
    Supabase project.

## 5. Acceptance Criteria (definition of "done")

- [ ] A documented automated test command runs from a clean install using npm
      and does not require Supabase credentials or a running app.
- [ ] The suite includes tests for cart item shape/backward compatibility,
      calculations, duplicate variant merge, stock-capped updates, and removal.
- [ ] The suite includes pure checkout validation tests, including safe RPC item
      sanitization and invalid-input cases.
- [ ] The suite includes product/variant validation tests for the specified
      validation boundaries and blank-SKU normalization.
- [ ] Test failures produce a non-zero command exit status.
- [ ] Existing implementation behavior is preserved; no database, auth, order,
      stock, or admin behavior is changed by test-only refactoring.
- [ ] The test suite makes no network or Supabase calls and uses no real secrets
      or customer data.
- [ ] README or the agreed project guide describes the test/lint/build commands
      and clearly distinguishes automated checks from manual Supabase checks.
- [ ] Existing manual flow verification is recorded as prior evidence and is
      not represented as an automated regression suite.
- [ ] `npm test`, `npm run lint`, and `NEXT_PUBLIC_SITE_URL=https://example.com npm run build` pass.
- [ ] `git diff --check` passes.

## 6. Notes / Constraints

- The repository currently has no test runner/configuration or automated test
  files. Keep the initial testing foundation small rather than implementing
  browser E2E, integration tests, and coverage gates all at once.
- The accepted manual development checks remain useful evidence, especially for
  transactional behavior. Automated pure tests complement those checks but
  cannot prove Supabase RLS, RPC permissions, concurrency locks, or Storage
  policies.
- If extracting a helper would cause meaningful business-code restructuring,
  prefer testing an existing pure boundary or ask before making a broad refactor.
- Phase 10 may add separate future specs for database integration tests or
  browser E2E only after choosing a safe dedicated environment and deciding the
  maintenance trade-off.
- Commit message after implementation review: `test: add automated critical logic coverage`
