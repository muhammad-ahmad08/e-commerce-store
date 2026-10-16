This is a Next.js App Router e-commerce store using TypeScript, React, and Supabase.

## Development checks

Use npm from the repository root:

```bash
npm test
npm run lint
NEXT_PUBLIC_SITE_URL=https://example.com npm run build
```

Automated tests use Vitest in the Node environment and cover deterministic pure
cart calculations, checkout input validation, and admin product/variant input
validation. They do not connect to Supabase, test database authorization or
transactions, or exercise the browser UI.

### Prior manual verification evidence

The following development flows were manually checked previously; this test
foundation does not rerun or independently verify them: cart persistence,
variant merging, and stock caps; checkout order placement, input tampering, and
stock rollback; admin authorization, order transitions, and restocking; product
visibility; and product image upload and fallback. Supabase/RLS, RPC, Storage,
and transactional behavior remain manual/environment-dependent verification.

## Getting Started

To run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Production deployment on Vercel

### Project and environment setup

1. Import this repository into the owner's Vercel account and connect the intended project. Set `main` as the Production branch.
2. Keep Vercel's Next.js framework detection and default build behavior (`next build`). Do not add custom build commands, output modes, runtimes, rewrites, or caching rules without a demonstrated incompatibility and approval.
3. In **Project Settings → Environment Variables**, configure these names for **Production**. The owner enters values directly in Vercel's secure UI; never send credentials through chat or commit them to this repository.
   - `NEXT_PUBLIC_SITE_URL` — actual HTTPS production origin only, with no path, credentials, query, or fragment. Use the actual Vercel production domain unless an owner-configured custom domain is verified.
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — values for the owner's already-confirmed production-suitable Supabase project.
   - `NEXT_PUBLIC_STORE_WHATSAPP_NUMBER`
   - `NEXT_PUBLIC_JAZZCASH_ACCOUNT_NUMBER`
   - `NEXT_PUBLIC_JAZZCASH_ACCOUNT_NAME`

   Store contact and JazzCash values may be intentionally blank; preserve the app's optional-value behavior and do not invent values. `SUPABASE_SECRET_KEY` is not required by current app flows. Do not configure it unless separately approved for a server-only feature, and never expose it through a `NEXT_PUBLIC_` variable.

4. Confirm the Supabase URL/key refer to that existing production-suitable project. Do not switch projects or change its schema, RLS, grants, functions, Storage policies, or customer data. Product images rely on the existing `product-images` bucket configuration.
5. `.env.example` contains placeholders for local setup only. It is not a source of production values. Never put credentials or private account values in tracked files, documentation, or visible build arguments.

### Pre-deployment checks

Run from the repository root on the reviewed `main` commit:

```bash
npm test
npm run lint
npx tsc --noEmit
NEXT_PUBLIC_SITE_URL=https://example.com npm run build
```

The `example.com` origin is only for local build validation. It is not the production URL. Do not deploy uncommitted or unreviewed changes. Confirm the Vercel Production deployment uses the reviewed `main` commit and record its commit hash.

### Production smoke checks

Use the actual production HTTPS origin and verify:

- Homepage and `/shop` load.
- A known active product detail route loads and displays its product image.
- `/robots.txt` and `/sitemap.xml` use the actual origin and contain only expected public routes.
- Invalid product and category routes show the branded not-found experience.
- Existing server-side protection remains in place for authenticated checkout/admin routes. Use only explicitly authorized test accounts and test orders; do not create a real customer order without the owner's explicit authorization.

Do not claim checkout, admin, or order flows were verified unless they were actually tested with authorization. If a SQL/configuration mismatch is detected, stop and report it; do not attempt database repair as part of deployment.

### Safe updates and redeploys

Review and test changes before merging to `main`; production deploys should come from reviewed commits. To change environment configuration, update the appropriate Vercel environment securely and redeploy so the new values are applied. Keep `NEXT_PUBLIC_SITE_URL` aligned with the verified production domain. Use Vercel deployment history to identify the live URL and commit; a routine redeploy must not switch Supabase projects or alter database behavior.

For local development, copy `.env.example` to `.env.local` and supply suitable local values. `.env.local` is ignored by Git. Example values are placeholders, not working production configuration. See the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for framework details.
