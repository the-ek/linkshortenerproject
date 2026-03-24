# TypeScript Conventions

Load this file for any TypeScript change regardless of layer.

---

## Compiler settings (do not change)

Key flags in `tsconfig.json`:

| Flag | Value | Implication |
|---|---|---|
| `strict` | `true` | Enables all strict checks (`strictNullChecks`, `noImplicitAny`, etc.) |
| `noEmit` | `true` | TypeScript is type-check only; Next.js handles compilation |
| `moduleResolution` | `"bundler"` | Use bundler-style resolution (supports `exports` maps) |
| `target` | `"ES2017"` | Output targets ES2017 — avoid syntax newer than this in emitted JS |
| `isolatedModules` | `true` | Each file must be independently compilable (no const enums, etc.) |

Do not change any of these settings without explicit justification and team sign-off.

---

## Path aliases

`@/*` maps to the project root. Always prefer the alias over relative paths that go up more than one level.

```ts
// ✅ Alias
import { db } from "@/db";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ❌ Deep relative paths
import { db } from "../../../../db";
```

---

## No `any`

Never use `any`. If the type is genuinely unknown, use `unknown` and narrow it:

```ts
// ❌
function handle(data: any) { return data.id; }

// ✅
function handle(data: unknown) {
  if (typeof data === "object" && data !== null && "id" in data) {
    return (data as { id: string }).id;
  }
}
```

If `any` is inherited from a third-party library type and cannot be avoided, cast to `unknown` first, then to the known type, and add a comment explaining why.

---

## Type definitions

### Prefer `type` over `interface` for object shapes

```ts
// ✅
type ShortLink = {
  id: string;
  slug: string;
  originalUrl: string;
};

// Use interface only when you need declaration merging or implementing a class
interface Repository<T> {
  findById(id: string): Promise<T>;
}
```

### Avoid class-based patterns

Prefer plain functions and objects. Use classes only for patterns that genuinely benefit from inheritance or when integrating a library that requires them.

### Props types for React components

Co-locate prop types with their component file. Use descriptive names that indicate the component:

```ts
type LinkCardProps = {
  link: ShortLink;
  onDelete?: (id: string) => void;
};
```

---

## Strict null handling

With `strictNullChecks` on, every value that might be `null` or `undefined` must be explicitly handled.

```ts
// ✅ Optional chaining + nullish coalescing
const title = link?.title ?? "Untitled";

// ✅ Early return guard
if (!userId) return null;

// ❌ Non-null assertion without certainty
const user = getUser()!;
```

Use the non-null assertion operator (`!`) only when you can prove the value is never null/undefined at that point (e.g., after a guard check or a `.filter(Boolean)`). Add a brief comment when using it.

---

## `satisfies` operator

Use `satisfies` to validate an object against a type while keeping the narrowest inferred type:

```ts
const config = {
  dialect: "postgresql",
  out: "./drizzle",
} satisfies Partial<Config>;
```

---

## Utility types

Prefer built-in utility types over manual duplication:

| Need | Use |
|---|---|
| Optional version of a type | `Partial<T>` |
| Required version | `Required<T>` |
| Pick specific keys | `Pick<T, "key1" \| "key2">` |
| Omit keys | `Omit<T, "key1">` |
| Read-only | `Readonly<T>` |
| Union of keys | `keyof T` |
| Type of a value at a key | `T[keyof T]` |

---

## Enums — avoid

`isolatedModules: true` prohibits `const enum`. Prefer union types or plain `as const` objects:

```ts
// ❌
const enum Status { Active, Inactive }

// ✅ Union type
type Status = "active" | "inactive";

// ✅ Const object (when you need the value at runtime)
const Status = {
  Active: "active",
  Inactive: "inactive",
} as const;
type Status = (typeof Status)[keyof typeof Status];
```

---

## Async / error handling

- Always type the return value of `async` functions: `async function fetchLink(): Promise<ShortLink | null>`.
- Prefer returning `null` or a result union over throwing for expected "not found" cases.
- Use `try/catch` only for genuinely unexpected errors; let them propagate to Next.js error boundaries when the error is unrecoverable.

---

## Type assertions

Use `as Type` sparingly. When you must narrow a type received from an API boundary, prefer a runtime check or a type guard:

```ts
// ✅ Type guard
function isShortLink(value: unknown): value is ShortLink {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as ShortLink).slug === "string"
  );
}
```

---

## Linting

ESLint is configured with `eslint-config-next/typescript` which enforces `@typescript-eslint` rules. Run `npm run lint` before every commit. Do not add `// eslint-disable` comments without a meaningful justification.
