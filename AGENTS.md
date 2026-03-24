<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent Instructions — Link Shortener

This file is the entry point for all LLM agents working in this repository.
IMPORTANT — READ BEFORE GENERATING ANY CODE

This repository enforces a strict workflow for LLM agents and contributors:

- ALWAYS read the relevant individual instruction files in the `/docs` directory BEFORE generating or patching any source code. These topic files contain mandatory, project-specific rules (auth, DB, components, security, TypeScript, etc.) that must be followed.
- Loading and reading the applicable `/docs/<topic>.md` file is not optional — treat it as a prerequisite for any code-generation or file-editing action.
- If you cannot find a relevant doc for your change, ask for clarification and do NOT proceed with code generation.

Read this file **and** the linked topic docs before making any code changes.

## Project Stack (quick reference)

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.1 — App Router (RSC-first) |
| Language | TypeScript 5 — `strict` mode |
| Runtime | React 19.2.4 |
| Auth | Clerk (`@clerk/nextjs` v7) |
| Database | Neon serverless PostgreSQL via Drizzle ORM |
| UI primitives | shadcn (radix-nova style) + Radix UI |
| Styling | Tailwind CSS v4 + CSS variables (oklch) |
| Icons | lucide-react |
| Path alias | `@/*` → project root |

## Coding Standards — Topic Docs

Detailed, actionable rules live in `/docs`. Load the relevant file before touching that layer.

| Topic | File | When to load |
|---|---|---|
| Next.js / App Router / Clerk | [docs/nextjs.md](docs/nextjs.md) | Adding routes, pages, API handlers, auth logic |
| Database / Drizzle / Neon | [docs/database.md](docs/database.md) | Changing schema, writing queries, running migrations |
| Components / Tailwind / shadcn | [docs/components.md](docs/components.md) | Building or editing UI components |
| TypeScript conventions | [docs/typescript.md](docs/typescript.md) | Any TypeScript change |
| Security | [docs/security.md](docs/security.md) | Auth guards, env vars, input validation, API routes |
| Auth / Clerk | [docs/auth.md](docs/auth.md) | Clerk-only auth rules, protected routes, redirect and modal behaviors |

## Universal Rules (apply everywhere)

1. **Read before writing.** Understand the surrounding code before generating changes.
2. **Small, focused changes.** One concern per commit. Do not refactor unrelated code.
3. **No `any`.** TypeScript strict mode is on; use precise types or `unknown` with narrowing.
4. **Server-first.** Prefer React Server Components; add `"use client"` only when browser APIs or React hooks are strictly required.
5. **Secrets stay in env.** Never hardcode credentials or tokens. All sensitive values come from `process.env`.
6. **Run lint before finishing.** `npm run lint` must pass with zero new errors.
7. **Do not alter config files** (`next.config.ts`, `tsconfig.json`, `drizzle.config.ts`, `eslint.config.mjs`, `components.json`) without an explicit task requiring it and a written justification.
8. **When unsure, ask.** Leave a `// TODO:` comment and flag for maintainer review rather than assuming intent.
