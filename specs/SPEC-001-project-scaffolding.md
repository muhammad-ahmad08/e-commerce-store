# Spec: Initial Project Scaffolding

**Spec ID:** SPEC-001
**Phase:** Phase 3 — Project Scaffolding
**Depends on:** none (this is the first task)

## 1. Goal
Create a new Next.js project with TypeScript and Tailwind CSS, set up the
folder structure and Git repository exactly as defined in CONTEXT.md, so
every later phase has a consistent, correctly-configured foundation to
build on.

## 2. Scope
### In scope
- Initialize a new Next.js app (App Router, TypeScript, Tailwind, ESLint)
- Create the folder structure from CONTEXT.md section 3
- Initialize Git with an appropriate `.gitignore`
- Create `.env.local` (empty, gitignored) and `.env.example` (documented
  placeholders for Supabase keys)
- Make the first commit

- Confirm `CONTEXT.md`, `specs/SPEC-TEMPLATE.md`, and
  `specs/SPEC-001-project-scaffolding.md` are present in the repo root /
  `specs/` folder (placed manually before this session) and get committed
  along with the scaffolding

### Out of scope
- Do NOT install Supabase client libraries yet (that's Phase 5)
- Do NOT write any UI components yet (that's Phase 4)
- Do NOT configure design tokens in Tailwind yet (that's Phase 4)

## 3. Files to create/modify
- New Next.js project at project root
- `src/app/(shop)/` — empty folder with `.gitkeep`
- `src/app/(admin)/` — empty folder with `.gitkeep`
- `src/app/api/` — empty folder with `.gitkeep`
- `src/components/ui/` — empty folder with `.gitkeep`
- `src/components/shop/` — empty folder with `.gitkeep`
- `src/lib/` — empty folder with `.gitkeep`
- `src/types/` — empty folder with `.gitkeep`
- `.env.local` — empty file
- `.env.example` — with placeholders:
  ```
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  ```
- `.gitignore` — must include `.env.local`, `node_modules/`, `.next/`

## 4. Requirements
1. Use `npx create-next-app@latest` with flags for TypeScript, Tailwind,
   App Router, and `src/` directory enabled.
2. Package manager must be npm (do not generate a yarn.lock or pnpm-lock).
3. Folder structure must match CONTEXT.md section 3 exactly — including
   the `(shop)` and `(admin)` route groups (parentheses are intentional,
   not a typo).
4. `.env.local` must be confirmed present in `.gitignore` before the
   first commit — verify this explicitly, do not assume.
5. First commit message: `chore: initial project scaffolding`

## 5. Acceptance Criteria (definition of "done")
- [ ] `npm run dev` starts the project successfully with no errors
- [ ] Folder structure matches CONTEXT.md exactly
- [ ] `git log` shows one commit
- [ ] `git status` shows a clean working tree
- [ ] `.env.local` does NOT appear in `git status` or `git show --stat`
      (confirms it's properly gitignored)
- [ ] `.env.example` exists and lists the three Supabase variables with
      no real values
- [ ] `CONTEXT.md` sits in the repo root; `specs/` folder contains
      `SPEC-TEMPLATE.md` and `SPEC-001-project-scaffolding.md`
- [ ] All of the above are included in the first commit (not gitignored)

## 6. Notes / Constraints
- If `create-next-app` prompts for additional options not listed above
  (e.g. Turbopack, import alias), use the tool's recommended defaults
  and note what was chosen.
- Do not touch `package.json` beyond what `create-next-app` generates.
- If anything in this spec conflicts with CONTEXT.md, CONTEXT.md wins —
  flag the conflict instead of silently choosing one.
