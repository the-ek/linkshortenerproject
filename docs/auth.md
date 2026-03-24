# Auth / Clerk — Project Rules

Purpose
- Describe project-wide authentication rules and conventions handled by Clerk.
- This file must be loaded before making changes that touch authentication, protected routes, or sign-in flows.

Summary (must-follow)
- Everything to do with authentication in this app is handled by Clerk. NO OTHER AUTH METHODS SHOULD BE USED.
- The `/dashboard` page is a protected route and must require the user to be logged in to access it.
- If a user is logged in and attempts to visit the homepage (`/`), they should be redirected to `/dashboard`.
- Sign-in and sign-up flows must always open via Clerk's modal dialogs (do not navigate to standalone pages).

Agent guidance
- Load this document before editing auth, middleware, or route protection logic.
- Do not add or configure alternative auth providers (OAuth, JWT, custom session stores) without explicit maintainer approval.
- When in doubt, ask the maintainers and leave a `// TODO` comment linking the PR.

Implementation notes
- Provider placement: Keep `<ClerkProvider>` in `app/layout.tsx` — do not move or duplicate it.
- Server-side checks: All server code that returns user-specific data must call Clerk's server auth helpers (e.g., `auth()` from `@clerk/nextjs/server`) before accessing or returning protected data.

Protecting `/dashboard`
- Preferred approach: guard the route at the middleware level using Clerk middleware or check `auth()` at the top of the server component for the route.

Example — middleware protection (recommended):

```ts
// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware((auth, req) => {
  // Protect dashboard path
  if (req.nextUrl.pathname.startsWith('/dashboard')) auth.protect();
});

export const config = { matcher: ['/((?!_next|.*\\..*).*)'] };
```

Example — server check inside `app/dashboard/page.tsx`:

```tsx
import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in'); // or redirect('/') if you prefer centralized flow
  // fetch and render dashboard
}
```

Homepage -> Dashboard redirect
- If a logged-in user hits `/`, redirect them to `/dashboard` from the server component in `app/page.tsx` or via middleware.

```tsx
// app/page.tsx (server component)
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect('/dashboard');
  return <LandingPage />;
}
```

Sign in / Sign up behavior
- Use Clerk's modal sign-in / sign-up flows (client-side). Do not route to separate sign-in pages.
- Example UI usage (client component wrapper):

```tsx
"use client";
import { SignInButton, SignUpButton } from '@clerk/nextjs';

export function AuthButtons() {
  return (
    <div>
      <SignInButton mode="modal" />
      <SignUpButton mode="modal" />
    </div>
  );
}
```

Notes for agents
- Do not change the auth provider or introduce a second auth mechanism in the codebase.
- When adding new protected endpoints, ensure both middleware and server-side checks are considered.
- Document any change to auth behavior in the PR and link this file.

Changelog
- 2026-03-24 — Created: Clerk-only auth rules, `/dashboard` protection, homepage redirect, modal sign-in/sign-up.
