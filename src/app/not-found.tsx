import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" tabIndex={-1} className="flex flex-1 items-center bg-background-primary px-5 py-20 md:px-16">
      <div className="mx-auto w-full max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-terracotta">404 · Page not found</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight text-foreground-primary sm:text-5xl">This page isn’t here.</h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-foreground-muted">
          The page may have moved, or the address may be incorrect. You can continue browsing the store.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/" className="inline-flex min-h-12 items-center justify-center bg-brand-terracotta px-6 text-sm font-semibold text-background-primary transition-colors hover:bg-brand-forest focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-terracotta">
            Go to homepage
          </Link>
          <Link href="/shop" className="inline-flex min-h-12 items-center justify-center border border-border-token px-6 text-sm font-semibold text-foreground-primary transition-colors hover:text-brand-terracotta focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-terracotta">
            Browse the shop
          </Link>
        </div>
      </div>
    </main>
  );
}
