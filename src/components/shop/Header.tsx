"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
];

const interactiveClasses =
  "transition-colors duration-250 ease-editorial hover:text-brand-terracotta";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="relative z-10 border-b border-border-token bg-background-primary text-foreground-primary">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-16">
        <Link
          href="/"
          className={`font-serif text-2xl tracking-wide ${interactiveClasses}`}
          aria-label="Aurelia home"
        >
          Aurelia
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-semibold uppercase tracking-[0.15em] ${interactiveClasses}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <Link
            href="/cart"
            className={`relative inline-flex items-center justify-center ${interactiveClasses}`}
            aria-label="Cart, 0 items"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="size-6"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M3.5 4.5h2l2.1 10.1a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 1.9-1.4l1.4-6.3H6.2" />
              <circle cx="10" cy="20" r="1" />
              <circle cx="17" cy="20" r="1" />
            </svg>
            <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-brand-terracotta text-[10px] font-semibold text-background-primary">
              0
            </span>
          </Link>

          <button
            type="button"
            className={`inline-flex size-10 items-center justify-center md:hidden ${interactiveClasses}`}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="size-6"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              {isMenuOpen ? (
                <path d="m6 6 12 12M18 6 6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="absolute inset-x-0 top-full border-b border-border-token bg-background-primary px-5 py-5 shadow-sm md:hidden"
        >
          <ul className="flex flex-col gap-5">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block py-1 text-sm font-semibold uppercase tracking-[0.15em] ${interactiveClasses}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
