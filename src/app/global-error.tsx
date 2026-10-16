"use client";

import Link from "next/link";
import "./globals.css";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background-primary px-5 py-16 text-foreground-primary">
        <main className="w-full max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-terracotta">Aurelia</p>
          <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">Something went wrong.</h1>
          <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-foreground-muted">
            We couldn’t load this page just now. You can try loading it again or return to the homepage.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <button type="button" onClick={() => reset()} className="min-h-12 bg-brand-terracotta px-6 text-sm font-semibold text-background-primary transition-colors hover:bg-brand-forest focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-terracotta">
              Try again
            </button>
            <Link href="/" className="inline-flex min-h-12 items-center justify-center border border-border-token px-6 text-sm font-semibold transition-colors hover:text-brand-terracotta focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-terracotta">
              Go to homepage
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
