"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AuthFormProps = {
  mode: "login" | "signup";
};

function getSafeRedirect(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/";
  }

  return value;
}

function getFriendlyAuthError(message: string, mode: AuthFormProps["mode"]) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "The email or password you entered is incorrect. Please try again.";
  }
  if (normalized.includes("user already registered") || normalized.includes("already been registered")) {
    return "An account with this email already exists. Try logging in instead.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Please confirm your email address before logging in.";
  }
  if (normalized.includes("rate limit") || normalized.includes("too many requests")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  if (normalized.includes("password")) {
    return mode === "signup"
      ? "Your password does not meet the requirements. Please choose a longer password."
      : "We couldn't log you in with those details. Please check them and try again.";
  }

  return mode === "signup"
    ? "We couldn't create your account right now. Please try again."
    : "We couldn't log you in right now. Please try again.";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const isSignup = mode === "signup";
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirect(searchParams.get("redirect"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    const normalizedEmail = email.trim();
    if (isSignup && !fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 8) {
      setError("Your password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const result = isSignup
        ? await supabase.auth.signUp({
            email: normalizedEmail,
            password,
            options: { data: { full_name: fullName.trim() } },
          })
        : await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          });

      if (result.error) {
        setError(getFriendlyAuthError(result.error.message, mode));
        return;
      }

      if (isSignup && !result.data.session) {
        setNotice("Your account is ready. Check your email to confirm your address before logging in.");
        return;
      }

      router.replace(redirectTo);
      router.refresh();
    } catch {
      setError("We couldn't connect to the sign-in service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const alternateHref = `${isSignup ? "/login" : "/signup"}${searchParams.get("redirect") ? `?redirect=${encodeURIComponent(searchParams.get("redirect") as string)}` : ""}`;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-5 py-16 md:px-16 md:py-24">
      <section className="w-full max-w-md bg-background-secondary p-6 sm:p-10" aria-labelledby="auth-heading">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-terracotta">
          Aurelia account
        </p>
        <h1 id="auth-heading" className="mt-3 font-serif text-4xl text-foreground-primary">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-foreground-muted">
          {isSignup ? "Join us for a more considered way to shop." : "Log in to continue to your account."}
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
          {isSignup && (
            <div>
              <label htmlFor="full-name" className="mb-2 block text-sm font-medium text-foreground-primary">
                Full name
              </label>
              <input
                id="full-name"
                name="full_name"
                autoComplete="name"
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="min-h-12 w-full border border-border-token bg-background-primary px-4 text-sm outline-none transition-colors duration-250 focus:border-brand-terracotta"
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground-primary">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="min-h-12 w-full border border-border-token bg-background-primary px-4 text-sm outline-none transition-colors duration-250 focus:border-brand-terracotta"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-foreground-primary">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="min-h-12 w-full border border-border-token bg-background-primary px-4 text-sm outline-none transition-colors duration-250 focus:border-brand-terracotta"
            />
          </div>

          {error && (
            <p role="alert" className="border border-red-800/20 bg-red-50 px-4 py-3 text-sm leading-5 text-red-900">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="border border-brand-forest/20 bg-background-primary px-4 py-3 text-sm leading-5 text-brand-forest">
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex min-h-12 w-full items-center justify-center bg-brand-terracotta px-5 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-opacity duration-250 ease-editorial hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? "Please wait…" : isSignup ? "Create account" : "Log in"}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-foreground-muted">
          {isSignup ? "Already have an account?" : "New to Aurelia?"}{" "}
          <Link href={alternateHref} className="font-semibold text-brand-forest underline underline-offset-4 transition-colors hover:text-brand-terracotta">
            {isSignup ? "Log in" : "Create an account"}
          </Link>
        </p>
      </section>
    </main>
  );
}
