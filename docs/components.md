# Components / Tailwind / shadcn — Coding Standards

Load this file whenever you are building or editing UI components, applying styles, or adding new shadcn primitives.

---

## Directory structure

```
components/
  ui/          ← shadcn-generated primitives — edit with care (see below)
  <feature>/   ← feature-specific components you author
```


Place **reusable, domain-agnostic** components under `components/`. Place **page-specific** components co-located in their `app/` route folder for locality.

---

## Enforcement — shadcn-only UI (MANDATORY)

- All UI elements in this app MUST use shadcn UI primitives. Do NOT create custom components that reimplement UI primitives or visual styles.
- If a required piece of UI is not available as a shadcn primitive, create a thin wrapper around the existing shadcn primitive but do not introduce new visual primitives or styling systems.
- Exceptions require explicit maintainer approval and a short justification in the PR description.

This rule is project policy: agents, contributors, and CI checks should follow it strictly.


## shadcn components

This project uses **shadcn** with the `radix-nova` style. Components are generated into `components/ui/` via the CLI:

```bash
npx shadcn add <component-name>
```

### Rules for `components/ui/`

- **Do not hand-modify** generated files unless there is an explicit, documented reason. Prefer composing or wrapping them instead.
- When a primitive needs customisation, create a wrapper in `components/` that imports the primitive and extends it.
- If you must patch a generated file, add a comment explaining why so future regeneration doesn't silently break it.

---

## Building components

### Server vs client

- Default to Server Components (no directive).
- Add `"use client"` only for interactive components that need state/effects. (See `docs/nextjs.md` for the full rule.)

### Props typing

Always define an explicit `Props` type or inline type for component props. Extend native HTML element props with `React.ComponentProps<"element">` when wrapping HTML.

```tsx
// ✅ Wrapping a native element
type Props = React.ComponentProps<"button"> & {
  isLoading?: boolean;
};

export function SubmitButton({ isLoading, children, ...props }: Props) { ... }
```

### `data-slot` attribute

shadcn primitives expose styling hooks via `data-slot`. When building a new composite component, add `data-slot="<name>"` to its root element to follow the same convention and allow parent-level CSS targeting.

```tsx
<div data-slot="link-card" className={cn("...", className)}>
```

---

## Class name utility — `cn()`

Always use the `cn()` helper from `@/lib/utils` to combine Tailwind classes. It merges conflicting utilities correctly via `tailwind-merge`.

```ts
import { cn } from "@/lib/utils";

// ✅
<div className={cn("px-4 py-2", isActive && "bg-primary", className)} />

// ❌ Never concatenate raw strings
<div className={`px-4 py-2 ${isActive ? "bg-primary" : ""}`} />
```

---

## CVA (class-variance-authority) for variant components

When a component has multiple visual variants (size, intent, state), use `cva` from `class-variance-authority`. Follow the pattern established in `components/ui/button.tsx`:

```ts
import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva("rounded-lg border", {
  variants: {
    variant: {
      default: "bg-card text-card-foreground",
      ghost:   "bg-transparent",
    },
    size: {
      default: "p-4",
      sm:      "p-2",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

type CardProps = React.ComponentProps<"div"> & VariantProps<typeof cardVariants>;
```

Export both the component and `variantsFn` if other components need to compose the classes.

---

## Radix UI

Radix primitives are accessed through the `radix-ui` package (re-exports all `@radix-ui/*` scoped packages):

```ts
import { Slot, Dialog, DropdownMenu } from "radix-ui";
```

Do **not** install individual `@radix-ui/*` packages unless the specific primitive is not available through the umbrella `radix-ui` import.

---

## Tailwind CSS v4

The project uses **Tailwind v4** imported via PostCSS (`@import "tailwindcss"` in `globals.css`). There is no `tailwind.config.js` — configuration is done via CSS `@theme` blocks.

### Design tokens

All color, radius, and font tokens are CSS custom properties (oklch-based) defined in `app/globals.css`. Reference them via Tailwind's semantic token names:

```tsx
// ✅ Use semantic tokens
<div className="bg-background text-foreground border border-border" />

// ❌ Don't use raw color values inline
<div style={{ backgroundColor: "#ffffff" }} />
```

### Dark mode

Dark mode is handled by the `.dark` class on a parent element (configured via `@custom-variant dark (&:is(.dark *))`). Use `dark:` variants for dark-mode overrides:

```tsx
<p className="text-zinc-600 dark:text-zinc-400">...</p>
```

### Spacing and sizing

Use Tailwind's spacing scale. Do not hard-code pixel values in `className` unless absolutely necessary for precise layout requirements.

### Adding new tokens

Add new design tokens to the `@theme inline { ... }` block in `app/globals.css`. Do not add a separate `tailwind.config.js`.

---

## Icons

Use `lucide-react` for all icons (already in dependencies). Import icons by name:

```tsx
import { Link, Copy, Trash2 } from "lucide-react";

<Link className="size-4" />
```

- Size icons with `size-*` utilities (e.g., `size-4`, `size-5`) — consistent with the button primitive's `[&_svg:not([class*='size-'])]:size-4` default.
- Do not import icon sets from other libraries; keep it consistent.

---

## Animations

The project imports `tw-animate-css` for animation utilities. Use its `animate-*` classes for entrance/exit transitions rather than writing custom `@keyframes` animations unless absolutely necessary.

---

## Accessibility

- Use semantic HTML elements (`<button>`, `<nav>`, `<main>`, `<section>`, `<header>`) — do not use `<div>` for everything.
- All interactive elements must be keyboard-accessible and have visible focus styles. The button primitive already includes `focus-visible:ring-3 focus-visible:ring-ring/50`.
- Always provide `alt` text for `<Image>` tags. Use `alt=""` for decorative images.
- Use `aria-label` or `aria-labelledby` for icon-only buttons.
