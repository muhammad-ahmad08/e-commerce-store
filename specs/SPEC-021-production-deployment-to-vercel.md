# Spec: Production Deployment to Vercel

**Spec ID:** SPEC-021
**Phase:** Phase 11 — Deployment
**Depends on:** SPEC-001 through SPEC-020

## 1. Goal

Deploy the existing e-commerce store to Vercel using the owner's confirmed
production-suitable Supabase project and production store configuration. Verify
the deployed storefront and core runtime configuration without changing the
application's business or database behavior.

## 2. Scope

### In scope
- Connect the existing Git repository to the owner's Vercel account/project.
- Configure Vercel production environment variables using values supplied by
  the owner through Vercel's secure environment settings.
- Configure `NEXT_PUBLIC_SITE_URL` for the actual HTTPS production origin.
- Deploy the production build and verify public routes, metadata discovery, and
  image delivery.
- Confirm the Vercel deployment is connected to the already-confirmed
  production-suitable Supabase project.
- Document the repeatable deployment and environment setup steps without
  documenting secret values.

### Out of scope
- Creating or migrating to a different Supabase project.
- Applying, changing, or repairing Supabase SQL, schema, RLS, policies, seed
  data, storage bucket configuration, or database functions.
- Real JazzCash gateway integration or payment processing credentials.
- CI pipelines, preview-deployment policy, branch protection, observability,
  analytics, uptime monitoring, or alerting.
- Custom domain purchase, DNS registrar changes, or email/domain setup unless
  explicitly approved as a separate task.
- Application feature work or broad production hardening unrelated to a
  deployment blocker.

## 3. Files to create/modify
- `.env.example` — ensure all variables required by the deployed app are
  documented using placeholders only; do not include any real credentials or
  production account values.
- `README.md` — document Vercel deployment steps, required environment-variable
  names, production build verification, and how to update/redeploy safely.
- `CONTEXT.md` — only if the deployment procedure establishes durable project
  rules that future work needs to follow.
- Vercel project settings — configure the repository, framework/build settings,
  and encrypted environment variables in the Vercel dashboard; do not store
  secrets in tracked files.

## 4. Requirements

1. Confirm the production Vercel deployment uses the owner-confirmed
   production-suitable Supabase project. Do not create or switch Supabase
   projects as part of this spec.
2. Set production `NEXT_PUBLIC_SITE_URL` to the deployment's actual HTTPS origin
   (Vercel production domain or an owner-configured custom domain). It must be
   the origin only, without path, credentials, query, or fragment, and must
   satisfy `src/lib/site-url.ts` validation.
3. Configure required environment variables in Vercel's secure project settings
   for the Production environment:
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_STORE_WHATSAPP_NUMBER`
   - `NEXT_PUBLIC_JAZZCASH_ACCOUNT_NUMBER`
   - `NEXT_PUBLIC_JAZZCASH_ACCOUNT_NAME`
   Preserve the existing application behavior when optional store contact or
   JazzCash values are intentionally blank; do not invent values.
4. `SUPABASE_SECRET_KEY` is not required for the current application flows.
   Do not configure it for Vercel unless a separately approved, server-only
   feature requires it. Never place a secret key in a `NEXT_PUBLIC_` variable,
   source code, build arguments visible to clients, README, or `.env.example` as
   a real value.
5. Use the repository's existing Next.js framework detection and default build
   behavior unless Vercel reports a concrete incompatibility. Do not add custom
   build commands, output modes, server runtimes, rewrites, or caching rules
   without a demonstrated need and approval.
6. Deploy from the current reviewed `main` commit. Do not deploy uncommitted or
   unreviewed changes. Record the commit hash associated with the production
   deployment in the completion report.
7. Before deployment, run and confirm:
   - `npm test`
   - `npm run lint`
   - `npx tsc --noEmit`
   - `NEXT_PUBLIC_SITE_URL=https://example.com npm run build`
   The placeholder origin is for local build validation only; the Vercel
   production setting must be the actual production origin.
8. Never copy credentials into chat, shell history, logs, source, or tracked
   files. The owner enters secret values directly in Vercel's secure UI. The
   implementation agent may verify variable names/configuration status but must
   not print variable values.
9. Do not change live Supabase schema, RLS, grants, functions, storage policies,
   or customer data during deployment. Report any detected SQL/config mismatch
   and stop before attempting repair.
10. After deployment, verify at minimum:
    - The production homepage and `/shop` load successfully.
    - A known active product detail route loads and displays its product image.
    - `/robots.txt` and `/sitemap.xml` use the actual HTTPS production origin
      and contain only the expected public routes.
    - Invalid product/category routes return the branded not-found experience.
    - Authenticated checkout/admin routes remain protected by their existing
      server-side checks. Use only test accounts and test orders explicitly
      authorized for production verification; do not create a real customer
      order without the owner's explicit authorization.
11. If no custom domain is configured, use the actual Vercel production domain
    consistently for `NEXT_PUBLIC_SITE_URL`. Do not imply the site is available
    at a custom domain that has not been configured and verified.
12. Document the deployment flow and required variable names in README using
    placeholder values only. Never document actual URLs if they are private,
    account identifiers, keys, or payment/contact values.
13. Report deployment URL, deployed commit hash, verification results, and any
    checks not performed. Do not claim production checkout/admin/order flows
    were verified unless they were actually tested with explicit authorization.

## 5. Acceptance Criteria (definition of "done")

- [ ] Production Vercel project is connected to the repository and deploys the
      reviewed `main` commit successfully.
- [ ] Vercel Production environment has the required variable names configured
      securely, with `NEXT_PUBLIC_SITE_URL` set to the actual HTTPS origin.
- [ ] The app uses the owner's confirmed production-suitable Supabase project;
      no project switch or database changes were made.
- [ ] `npm test`, `npm run lint`, `npx tsc --noEmit`, and the production build
      pass before deployment.
- [ ] The deployed homepage, catalog, known active product route, product image,
      `robots.txt`, and `sitemap.xml` pass the specified smoke checks.
- [ ] Invalid product/category routes display the branded not-found page.
- [ ] No secrets or private values were committed, logged, or copied into
      documentation or chat.
- [ ] README contains repeatable Vercel setup/deployment instructions and
      placeholder-only environment examples.
- [ ] Completion report includes the verified production URL, deployed commit
      hash, checks performed, and any authorized flows not tested.

## 6. Notes / Constraints

- The owner confirmed that the current Supabase project is suitable for real
  customer orders. Treat it as production data: do not truncate, reseed, alter
  schema/security, or create test orders without explicit authorization.
- This project currently supports COD and JazzCash payment instructions plus
  WhatsApp contact; it does not implement an online JazzCash payment gateway.
- Product Storage images depend on the configured Supabase project URL and the
  `product-images` bucket policies already established in the repository SQL.
  Do not apply or modify those policies during deployment.
- If Vercel access or owner-entered secrets are required, ask the owner to
  complete those secure UI steps; never request credentials in chat.
- Only schedule or configure recurring processes if separately requested.
- Commit message after deployment documentation is reviewed: `docs: document production deployment`
