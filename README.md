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

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
