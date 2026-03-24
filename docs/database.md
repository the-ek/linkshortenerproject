# Database / Drizzle / Neon — Coding Standards

Load this file whenever you are changing the schema, writing queries, or running migrations.

---

## Setup overview

| File | Purpose |
|---|---|
| `db/index.ts` | Creates and exports the Drizzle `db` client |
| `db/schema.ts` | All table definitions — single source of truth |
| `drizzle.config.ts` | Drizzle Kit config used for generating migrations |
| `drizzle/` | Generated migration SQL files (do not hand-edit) |

The database connection uses **Neon's serverless HTTP driver** (`@neondatabase/serverless`) with the `neon-http` Drizzle adapter — no persistent TCP connection, safe to use inside Next.js Edge or serverless environments.

```ts
// db/index.ts — do not change the driver or connection strategy without team agreement
import { drizzle } from "drizzle-orm/neon-http";

const db = drizzle(process.env.DATABASE_URL!);

export { db };
```

---

## Schema conventions

All tables are defined in `db/schema.ts` using Drizzle's `pgTable` helper.

### Naming

- Table names: **snake_case**, plural nouns (e.g., `short_links`, `users`).
- Column names: **snake_case** (e.g., `created_at`, `original_url`).
- TypeScript types derived from tables: **PascalCase** (e.g., `ShortLink`, `NewShortLink`).

### Required columns (every table)

```ts
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const shortLinks = pgTable("short_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

Always include `id` (UUID, primary key), `createdAt`, and `updatedAt`.

### Exporting inferred types

Export select and insert types from every table definition so callers are always type-safe:

```ts
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

export type ShortLink = InferSelectModel<typeof shortLinks>;
export type NewShortLink = InferInsertModel<typeof shortLinks>;
```

### Foreign keys

Declare relationships with `.references()` and explicit `onDelete` behavior:

```ts
userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
```

---

## Writing queries

Always import `db` from `@/db` (never reconstruct the client). Use Drizzle's fluent query API — avoid raw SQL strings.

### Select

```ts
import { db } from "@/db";
import { shortLinks } from "@/db/schema";
import { eq } from "drizzle-orm";

// All rows
const all = await db.select().from(shortLinks);

// Filtered
const link = await db
  .select()
  .from(shortLinks)
  .where(eq(shortLinks.slug, slug))
  .limit(1);
```

### Insert

```ts
const [created] = await db
  .insert(shortLinks)
  .values({ slug, originalUrl, userId })
  .returning();
```

### Update

```ts
await db
  .update(shortLinks)
  .set({ originalUrl: newUrl, updatedAt: new Date() })
  .where(eq(shortLinks.id, id));
```

### Delete

```ts
await db.delete(shortLinks).where(eq(shortLinks.id, id));
```

### Do not use raw SQL

```ts
// ❌ Never do this
await db.execute(sql`SELECT * FROM short_links WHERE id = ${id}`);

// ✅ Use the fluent API instead
await db.select().from(shortLinks).where(eq(shortLinks.id, id));
```

Use `sql` template tag only for expressions Drizzle's API cannot express (e.g., custom functions in `WHERE`), and only after confirming there is no ORM equivalent.

---

## Migrations

Drizzle Kit manages migrations. Never hand-edit files inside `drizzle/`.

### Workflow

```bash
# 1. Update db/schema.ts with your changes
# 2. Generate the migration
npx drizzle-kit generate

# 3. Review the generated SQL in drizzle/ before applying
# 4. Apply to the database
npx drizzle-kit migrate
```

### Rules

- **One concern per migration.** Don't mix schema changes with data backfills in the same migration.
- **Backwards compatibility.** Before dropping a column or renaming, confirm the application code is no longer reading it.
- **Never push migrations directly to production** without review and a deploy plan.
- Set `DATABASE_URL` in `.env.local` — the config reads it via `dotenv/config`.

---

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | Neon connection string |

The connection string format: `postgresql://user:pass@host/dbname?sslmode=require`

Never log or expose `DATABASE_URL`. Access it only as `process.env.DATABASE_URL`.

---

## Performance notes

- The Neon HTTP driver is stateless — each query opens a short-lived HTTPS request. Batch related reads with `Promise.all` to avoid waterfall latency.
- Avoid `SELECT *` in hot paths; select only the columns you need.
- Add indexes for columns used in `WHERE`, `ORDER BY`, or `JOIN` conditions as the schema grows.
