# Spec: Supabase Client Setup (Browser, Server, Middleware)

**Spec ID:** SPEC-003
**Phase:** Phase 5 — Data Modeling & Backend Basics
**Depends on:** SPEC-002

## 1. Goal
Install and configure the Supabase client libraries for Next.js App
Router, creating properly separated browser/server clients so the app
can query Supabase from both Server Components and Client Components
correctly, with auth session handling via cookies.

## 2. Scope
### In scope
- Install `@supabase/supabase-js` and `@supabase/ssr`
- Create a browser client utility (for Client Components)
- Create a server client utility (for Server Components, Server Actions,
  Route Handlers)
- Create middleware for automatic auth token refresh — **note: on
  Next.js 16, this file is `proxy.ts` (project root), not
  `middleware.ts`, and the exported function is named `proxy` not
  `middleware`. Follow whatever the installed Next.js version's current
  convention actually is.**
- Update `.env.example` to use the current key naming (see section 4)
- Update `CONTEXT.md`: correct any reference to `anon`/`service_role`
  keys to reflect Supabase's current key system, and add a short section
  documenting the Supabase client file locations for future specs to
  reference

### Out of scope
- Do NOT write any actual data-fetching queries yet (e.g. fetching
  products) — this spec is purely about the client setup, not usage
- Do NOT build login/signup UI yet — that's a separate spec

## 3. Files to create/modify
- `package.json` — new dependencies
- `.env.example` — updated variable names
- `src/lib/supabase/client.ts` — browser client (new file)
- `src/lib/supabase/server.ts` — server client (new file)
- `proxy.ts` — auth token refresh (new file, project root; was
  `middleware.ts` pre-Next.js 16)
- `CONTEXT.md` — corrected key terminology + new section documenting
  Supabase client file locations

## 4. Requirements
1. Use Supabase's **current key naming**, not the legacy `anon`/
   `service_role` terminology:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (client-side, low privilege)
   - `SUPABASE_SECRET_KEY` (server-only, elevated privilege — must never
     be referenced in any file that could run in the browser)
2. Follow Supabase's official current pattern for `@supabase/ssr`:
   separate `createBrowserClient` (in `client.ts`) and
   `createServerClient` (in `server.ts`) utility functions, plus
   middleware that refreshes the auth session on every request using
   cookies (Server Components cannot write cookies themselves, which is
   why middleware handles token refresh).
3. The server client must be usable in Server Components, Server
   Actions, and Route Handlers.
4. Do not hardcode any key or URL — read only from environment
   variables.
5. If package versions or the exact current `@supabase/ssr` API differ
   from what's assumed here, follow Supabase's official up-to-date
   documentation pattern rather than an older cached version of it —
   flag if anything in this spec appears outdated relative to the
   installed package version.

## 5. Acceptance Criteria (definition of "done")
- [ ] `npm install` completes with both packages present in
      `package.json`
- [ ] `src/lib/supabase/client.ts` exports a working browser client
      creator using the publishable key
- [ ] `src/lib/supabase/server.ts` exports a working server client
      creator using the publishable key for standard server-side reads
      (the secret key is NOT used here — it's reserved for admin-only
      operations in a later phase)
- [ ] `proxy.ts` exists at the project root and refreshes the auth
      session on requests
- [ ] `.env.example` lists the three variables with the correct current
      names and placeholder values
- [ ] `CONTEXT.md` no longer refers to `anon key` / `service_role key`
      as the primary terminology — updated to publishable/secret key
      language, with a note that the underlying privilege levels are
      unchanged
- [ ] `npm run lint` and `npm run build` both pass
- [ ] No secret key appears in any client-side-reachable file

## 6. Notes / Constraints
- Ahmad's actual `.env.local` already has real values under the new
  naming — this spec should NOT overwrite `.env.local`, only
  `.env.example` (which holds placeholders, not real secrets)
- Commit message: `feat: add Supabase client setup and update key
  naming convention`
