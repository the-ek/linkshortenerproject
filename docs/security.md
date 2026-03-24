# Security — Coding Standards

Load this file when working on auth guards, environment variables, user input handling, API routes, or any code that processes untrusted data.

---

## Authentication & authorisation (Clerk)

### Always verify the session server-side

Client-side auth state (`useUser`, `useAuth`) is for UI only. **Never rely on it to authorise data access.** Every server action, route handler, and page that returns sensitive data must call Clerk's `auth()` helper:

```ts
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  // proceed
}
```

### Protect routes at the middleware layer

Use `clerkMiddleware` in `middleware.ts` to guard entire route groups rather than duplicating checks in every page. (See `docs/nextjs.md` for the full pattern.)

### Scope data queries to the authenticated user

Never return data that belongs to another user. Always add a `WHERE userId = <clerkUserId>` condition or equivalent when reading user-owned rows:

```ts
const links = await db
  .select()
  .from(shortLinks)
  .where(eq(shortLinks.userId, userId)); // ← always filter by owner
```

---

## Environment variables

### Rules

1. **Never hardcode** secrets, API keys, database URLs, or any value that differs between environments.
2. All sensitive variables must be in `.env.local` (git-ignored), never committed to the repository.
3. Server-only variables must **not** have the `NEXT_PUBLIC_` prefix — they will be exposed to the browser bundle otherwise.
4. Client-safe variables that must be exposed to the browser use the `NEXT_PUBLIC_` prefix (e.g., `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`).

### Required variables

| Variable | Exposed to browser | Purpose |
|---|---|---|
| `DATABASE_URL` | No | Neon PostgreSQL connection string |
| `CLERK_SECRET_KEY` | No | Clerk server authentication |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk client authentication |

### Accessing variables

```ts
// ✅ Server-side
const url = process.env.DATABASE_URL; // string | undefined

// ✅ Assert non-null when you know it must be set (e.g., at startup)
const url = process.env.DATABASE_URL!;

// ❌ Never use client-side env vars for secrets
const secret = process.env.NEXT_PUBLIC_SOMETHING_SECRET; // will be in the JS bundle
```

Validate critical env vars at startup (e.g., in `db/index.ts`) so the app fails fast with a clear error rather than a cryptic runtime crash.

---

## Input validation

### Never trust user input

All data arriving from forms, query parameters, route segments, or request bodies is untrusted. Validate on the server before using it.

### Validation approach

Use runtime type-checking to validate and parse untrusted data. A lightweight option is manual checks; for complex shapes, consider `zod` (not yet in dependencies — request maintainer approval before adding).

```ts
// Minimal validation example (manual)
const slug = formData.get("slug");
if (typeof slug !== "string" || slug.length < 1 || slug.length > 50) {
  return { error: "Invalid slug" };
}
// Sanitise: only allow alphanumeric and hyphens
if (!/^[a-z0-9-]+$/.test(slug)) {
  return { error: "Slug may only contain lowercase letters, numbers, and hyphens" };
}
```

### URL validation

Always validate URLs before storing them to prevent SSRF and open redirect vulnerabilities:

```ts
function isValidUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
```

### Slug uniqueness

Enforce uniqueness at the **database level** (unique index on `slug`) in addition to any application-level check. Never rely solely on an application-level lookup before insert — that has a race condition.

---

## API Route Handlers

### Always set an explicit HTTP status code

```ts
// ✅
return Response.json({ error: "Not found" }, { status: 404 });

// ❌ Ambiguous — defaults to 200
return Response.json({ error: "Not found" });
```

### Limit accepted HTTP methods

Return `405 Method Not Allowed` for verbs not handled by a route:

```ts
export async function GET(req: Request) { ... }
// No POST export → Next.js automatically returns 405 for POST
```

### Rate limiting (future consideration)

Short-link redirect endpoints are high-traffic targets. When the app grows, add edge-level rate limiting (e.g., via Vercel's rate limiting or an upstash Redis middleware) to prevent abuse. Add a `// TODO: rate-limit this endpoint` comment now so it is not forgotten.

---

## Output encoding / XSS prevention

- React escapes all string output in JSX by default — do not use `dangerouslySetInnerHTML` with untrusted data.
- If `dangerouslySetInnerHTML` is ever required, sanitise the HTML with a trusted library first (e.g., `dompurify`) and document the decision.

---

## Open redirect protection

The core feature of this app is redirecting users to a stored URL. Never redirect to a URL that has not been validated with `isValidUrl` (see above). Reject any stored URL with a non-`http/https` scheme (e.g., `javascript:`, `data:`, `ftp:`).

```ts
// In the redirect route handler
const link = await getLink(slug);
if (!link || !isValidUrl(link.originalUrl)) {
  return notFound();
}
redirect(link.originalUrl);
```

---

## Logging & error messages

- Do not log `DATABASE_URL`, `CLERK_SECRET_KEY`, or any value from environment variables.
- Do not expose raw database errors or stack traces to the client. Return a generic error message and log the full error server-side only.

```ts
try {
  await db.insert(shortLinks).values(payload);
} catch (err) {
  console.error("[createLink] DB error:", err); // server log only
  return { error: "Something went wrong. Please try again." }; // client response
}
```

---

## Dependency security

- Run `npm audit` periodically and resolve `high` and `critical` findings promptly.
- Do not add new packages without reviewing them — prefer well-maintained, popular libraries with known security track records.
- Lock dependency versions in `package-lock.json`; do not use `*` or open ranges for production dependencies.
