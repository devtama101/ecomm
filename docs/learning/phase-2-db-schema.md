# Phase 2: Database & ORM Setup — Learning Notes (for Laravel Devs)

Coming from Laravel, you already know Eloquent, migrations, and `php artisan migrate`. Prisma fills the same role in Next.js, but the mental model is slightly different. Here's how they map.

---

## 1. ORM: Eloquent vs. Prisma

**In Laravel:**
You define Models as PHP classes. Each model maps to a database table.
```php
class User extends Model {
    protected $fillable = ['clerk_id', 'email'];
}
```

**In Next.js (Prisma):**
You define models in a single file called `prisma/schema.prisma`. Prisma generates TypeScript types and a client from this file.
```prisma
model User {
  id       String   @id @default(uuid())
  clerkId  String   @unique
  email    String
  createdAt DateTime @default(now())
}
```

After changing the schema, you run `npx prisma generate` — this is like running `composer dump-autoload` but for your database types.

---

## 2. Migrations: `php artisan migrate` vs. `npx prisma migrate dev`

**In Laravel:**
You create migration files with `php artisan make:migration`, write SQL-like PHP, then run `php artisan migrate`.
```php
Schema::create('users', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('clerk_id')->unique();
    $table->string('email');
    $table->timestamps();
});
```

**In Prisma:**
You edit `schema.prisma` directly, and Prisma auto-generates the migration SQL for you:
```bash
npx prisma migrate dev --name add_users
```
This compares your schema file to the database, generates a `.sql` file with the differences, and applies it. You never write raw SQL for migrations (unless you want to).

---

## 3. Querying: Eloquent vs. PrismaClient

**In Laravel (Eloquent):**
```php
// Create
$user = User::create(['clerk_id' => 'abc', 'email' => 'test@test.com']);

// Find with relation
$transaction = Transaction::with('user')->where('order_id', 'ORDER-123')->first();
```

**In Next.js (Prisma):**
```ts
import { prisma } from '@/lib/prisma';

// Create
const user = await prisma.user.create({
  data: { clerkId: 'abc', email: 'test@test.com' }
});

// Find with relation (like Eloquent's `with()`)
const transaction = await prisma.transaction.findUnique({
  where: { orderId: 'ORDER-123' },
  include: { user: true }   // ← this is like ->with('user')
});
```

Key differences:
- Prisma uses **named methods** (`create`, `findUnique`, `findMany`, `update`, `delete`) instead of Eloquent's chainable query builder.
- Prisma's `include` is equivalent to Eloquent's `with()` for eager loading relations.
- All Prisma queries are `await`-ed (async/await) instead of being synchronous.

---

## 4. Relations: `belongsTo` / `hasMany` vs. `@relation`

**In Laravel:**
```php
// User model
public function transactions() {
    return $this->hasMany(Transaction::class);
}

// Transaction model
public function user() {
    return $this->belongsTo(User::class);
}
```

**In Prisma:**
```prisma
model User {
  id           String        @id @default(uuid())
  transactions Transaction[]    // ← hasMany
}

model Transaction {
  userId String
  user   User @relation(fields: [userId], references: [id])  // ← belongsTo
}
```

The `@relation` directive tells Prisma which column (`userId`) maps to which parent column (`id`). The `Transaction[]` array on `User` is the inverse (hasMany) side.

---

## 5. Database Connection: `.env` + `config/database.php` vs. `prisma.config.ts`

**In Laravel:**
Your database credentials go in `.env`:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=ecomm
DB_USERNAME=postgres
DB_PASSWORD=secret
```
And `config/database.php` reads them.

**In Next.js (Prisma 7):**
Your connection string goes in `.env.local`:
```env
DATABASE_URL="postgresql://user:password@host:port/database?pgbouncer=true"
```
And `prisma.config.ts` reads it:
```ts
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: ".env.local" });

export default defineConfig({
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

> **Note:** Prisma 7 moved the URL out of `schema.prisma` and into `prisma.config.ts`. Most online tutorials still show the old way (`url = env("DATABASE_URL")` in schema.prisma) — that will NOT work with Prisma 7.

---

## 6. Singleton Pattern: Why We Need `lib/prisma.ts`

**In Laravel:**
You never think about this. Laravel's service container handles database connections automatically — one connection per request, cleaned up at the end.

**In Next.js:**
Next.js hot-reloads your code on every file save during development. Each reload creates a new `PrismaClient`, which opens new database connections. After a few saves, you'll hit the database connection limit.

The solution is to cache the `PrismaClient` on `globalThis` (a global object that survives hot-reloads):
```ts
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

Think of this as a manual version of what Laravel's service container does automatically.

---

## 7. Supabase: Like Laravel Forge + PostgreSQL

If you've used **Laravel Forge** to manage servers and databases, Supabase is similar but for PostgreSQL specifically:
- **Managed PostgreSQL** — You don't manage the server, backups, or updates.
- **Connection Pooling (Supavisor)** — Like PgBouncer. Routes your connections through a pooler to prevent overloading the database.
- **Dashboard** — SQL Editor, table viewer, logs — similar to phpMyAdmin but for Postgres.
- **Two connection modes:**
  - **Transaction mode (port 6543):** Best for serverless. Each query gets its own connection from the pool. Add `?pgbouncer=true` to the URL.
  - **Session mode (port 5432):** A persistent connection. Better for migrations and long-running queries.

---

## Quick Reference

| Laravel | Next.js + Prisma |
|---|---|
| `php artisan make:model User -m` | Edit `prisma/schema.prisma` |
| `php artisan migrate` | `npx prisma migrate dev` |
| `User::create([...])` | `prisma.user.create({ data: {...} })` |
| `User::find(1)` | `prisma.user.findUnique({ where: { id: '...' } })` |
| `User::all()` | `prisma.user.findMany()` |
| `Transaction::with('user')->first()` | `prisma.transaction.findUnique({ include: { user: true } })` |
| `.env` + `config/database.php` | `.env.local` + `prisma.config.ts` |
| `composer dump-autoload` | `npx prisma generate` |
| Service Container (auto) | `lib/prisma.ts` singleton (manual) |
