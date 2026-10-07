# Spec: Login & Signup Pages

**Spec ID:** SPEC-009
**Phase:** Phase 7 — Cart & Checkout
**Depends on:** SPEC-003

## 1. Goal
Build functional login and signup pages using Supabase Auth, with
redirect-back support so checkout (and any future protected action)
can send an unauthenticated visitor to log in and land back where they
were, rather than losing their place.

## 2. Scope
### In scope
- `/login` page: email + password form, calls Supabase Auth sign-in
- `/signup` page: email + password + full name form, calls Supabase
  Auth sign-up (the existing `handle_new_user` trigger from SPEC-005
  automatically creates the matching `profiles` row — no manual
  profile creation needed here)
- Redirect-back support: both pages accept a `?redirect=` query param;
  on success, navigate to that path instead of always going to the
  homepage
- Basic client-side validation (required fields, valid email format,
  minimum password length) before submitting
- Clear error messages for real failure cases (wrong password, email
  already registered, etc.) — surface Supabase's actual error message
  in plain language, don't swallow it silently
- A simple way to log out (can live in the Header or a basic account
  menu — your choice at implementation time, keep it minimal)

### Out of scope
- Do NOT build a full account/profile management page yet (editing
  name, viewing order history) — that's a future spec
- Do NOT implement social login (Google, etc.) — email/password only
  for MVP
- Do NOT implement "forgot password" flow — note it as a known gap,
  not required for MVP

## 3. Files to create/modify
- `src/app/(shop)/login/page.tsx` — new page
- `src/app/(shop)/signup/page.tsx` — new page
- `src/components/shop/AuthForm.tsx` — new Client Component (shared
  form logic/UI between login and signup, to avoid duplicating markup)
- `src/components/shop/Header.tsx` — add a basic login/account link and
  logout action

## 4. Requirements
1. Both pages are Client Components (`"use client"`), since they call
   the browser Supabase client (`src/lib/supabase/client.ts`) directly
   and manage form state.
2. On successful login or signup, read the `redirect` query param (if
   present) and navigate there; otherwise default to `/`.
3. Signup must collect `full_name` and pass it through Supabase Auth's
   user metadata at sign-up time (the existing trigger reads
   `raw_user_meta_data->>'full_name'` — confirm this still connects
   correctly end-to-end, don't assume it works untested).
4. Passwords must never be logged to the console or displayed back to
   the user in plaintext anywhere, including in error messages.
5. Logout must clear the Supabase session properly (use the Supabase
   client's sign-out method, not just clearing local state) and
   redirect to the homepage.
6. Use existing design tokens — form inputs, buttons, and error states
   should look like they belong to this project, not default browser
   styling.

## 5. Acceptance Criteria (definition of "done")
- [ ] Signing up with a new email creates both an `auth.users` entry
      AND a matching `profiles` row (verify this directly in Supabase
      Table Editor, don't just assume the trigger fired)
- [ ] Logging in with correct credentials succeeds and redirects
      correctly, including when arriving via `?redirect=/some-path`
- [ ] Logging in with wrong credentials shows a clear, real error
      message, not a silent failure or raw technical error dump
- [ ] Attempting to sign up with an already-registered email shows an
      appropriate error
- [ ] Logging out actually ends the session (confirm by trying to
      access something that should require login afterward, once that
      exists in SPEC-010)
- [ ] `npm run lint` and `npm run build` both pass

## 6. Notes / Constraints
- Commit message: `feat: add login and signup pages`
