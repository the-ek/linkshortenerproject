# Next.js / App Router / Clerk — Coding Standards

Load this file whenever you are adding routes, pages, layouts, API route handlers, or any Clerk auth logic.

---

## App Router fundamentals

### File conventions

| File | Purpose |
|---|---|
| `app/layout.tsx` | Root layout — wraps every page; hosts `ClerkProvider` |
| `app/page.tsx` | Index route `/` |
| `app/[segment]/page.tsx` | Dynamic route segment |
| `app/[segment]/layout.tsx` | Nested layout for a route group |
| `app/api/[route]/route.ts` | API Route Handler (GET/POST/etc.) |
| `app/loading.tsx` | Streaming suspense fallback |
| `app/error.tsx` | Error boundary (must be `"use client"`) |
| `app/not-found.tsx` | 404 fallback |

All files live inside `app/`. Do not use the legacy `pages/` directory.

### Server Components vs Client Components

**Default to Server Components.** Every component is a Server Component unless it carries the `"use client"` directive.

Add `"use client"` **only** when the component:
- Uses React state (`useState`, `useReducer`)
- Uses React effects (`useEffect`, `useLayoutEffect`)
- Uses browser-only APIs (`window`, `document`, `localStorage`)
- Uses React context that must update on the client
- Uses Clerk client hooks (`useUser`, `useAuth`, `useClerk`)

```tsx
// ✅ Server Component — no directive needed
export default async function LinksPage() {
  const links = await db.select().from(linksTable);
  return <LinkList links={links} />;
}

// ✅ Client Component — directive required
"use client";
import { useState } from "react";
export function CopyButton({ url }: { url: string }) { ... }
```

**Push data-fetching up.** Pass data down as props from server components into client components; do not fetch inside client components unless necessary.

### Data fetching

- Fetch data in `async` Server Components using `await` directly — no `useEffect` + fetch pattern.
- Use Drizzle queries (see `docs/database.md`) rather than raw SQL or `fetch` against the DB.
- For mutations, use **Server Actions** (`"use server"` functions) or POST Route Handlers.

```tsx
// ✅ Server Action pattern for a form submission
"use server";
export async function createShortLink(formData: FormData) {
  const url = formData.get("url") as string;
  // validate, then insert — see docs/security.md for validation rules
}
```

### Routing

- Parallel routes: `@slot` folders inside a route segment.
- Intercepting routes: `(.)segment` convention.
- Route groups (no URL segment): `(groupName)/` folders.
- Catch-all: `[...slug]/page.tsx`.
- Optional catch-all: `[[...slug]]/page.tsx`.

---

## Clerk authentication (v7)

The app wraps everything in `<ClerkProvider>` inside `app/layout.tsx`. Do not move or duplicate this provider.

### Conditional UI rendering

Use the `<Show>` component from `@clerk/nextjs` for declarative auth-gated UI:

```tsx
import { Show } from "@clerk/nextjs";

<Show when="signed-in">
  <UserButton />
</Show>
<Show when="signed-out">
  <SignInButton />
  <SignUpButton />
</Show>
```

### Server-side auth

Use Clerk's `auth()` helper (server-only) to read session data inside Server Components or Route Handlers:

```tsx
import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  // proceed with userId
}
```

### Protecting routes

Prefer **middleware-level protection** for authenticated sections. Create or update `middleware.ts` at the project root using Clerk's `clerkMiddleware`:

```ts
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtected = createRouteMatcher(["/dashboard(.*)", "/links(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (isProtected(req)) auth.protect();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
```

Do **not** duplicate auth checks in every page if middleware already protects the route.

### Clerk environment variables

These must be set in `.env.local` — never hardcoded:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_…
CLERK_SECRET_KEY=sk_…
```

---

## Metadata

Define `metadata` with the `Metadata` type from `next` in every page or layout:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Title",
  description: "Short description",
};
```

---

## Images and fonts

- Use `next/image` (`<Image>`) for all `<img>` tags — never raw `<img>`.
- Use `next/font/google` for web fonts, as established in `app/layout.tsx` (`Geist`, `Geist_Mono`). Assign font variables to the `<html>` element's `className`.

---

## Navigation

- Use `next/link` (`<Link>`) for client-side navigation; never raw `<a>` for internal routes.
- Use `next/navigation` hooks (`useRouter`, `redirect`, `notFound`) — not the legacy `next/router`.

---

## Do not

- Do not use `getServerSideProps`, `getStaticProps`, or `getStaticPaths` — these are Pages Router APIs.
- Do not use `next/headers` on the client; it is server-only.
- Do not call `cookies()` or `headers()` outside of async server contexts.
- Do not import server-only modules (DB, server env vars) inside `"use client"` files.
