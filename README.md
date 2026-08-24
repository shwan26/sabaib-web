# SabaiB Web

Next.js guest experience for bills created by the SabaiB Android app. Android and web share the same Supabase Postgres tables and naming contract.

## Shared model mapping

| Android model | Database representation |
| --- | --- |
| `Bill` | `bills` |
| `ReceiptItem` | `bill_items` (`thai_name`, `english_name`, unit `price`) |
| `Participant` | `participants` (`is_host`, `is_ready`) |
| `ItemSelection` | normalized rows in `item_claims` |
| `ChargeConfig` | charge fields on `bills` |
| `ParticipantSplit` / `ParticipantTotal` | calculated from items and claims |

`item total = price × quantity`, matching `BillViewModel` on Android.

## Supabase setup

1. Create a Supabase project.
2. In Supabase **SQL Editor**, create the dedicated Prisma role recommended by Supabase. Replace the password first:

```sql
create user "prisma" with password 'REPLACE_WITH_A_STRONG_PASSWORD' bypassrls createdb;
grant "prisma" to "postgres";
grant usage, create on schema public to prisma;
grant all on all tables in schema public to prisma;
grant all on all routines in schema public to prisma;
grant all on all sequences in schema public to prisma;
alter default privileges for role postgres in schema public grant all on tables to prisma;
alter default privileges for role postgres in schema public grant all on routines to prisma;
alter default privileges for role postgres in schema public grant all on sequences to prisma;
```

3. Copy `.env.example` to `.env` and replace every placeholder. Use the transaction pooler URL (port `6543`) for `DATABASE_URL`; use the session pooler or direct URL for `DIRECT_URL`.
4. Apply the checked-in database migration:

```bash
pnpm db:deploy
pnpm db:generate
```

5. Run `supabase/enable-realtime.sql` once in the Supabase SQL Editor. Publication ownership prevents this administrator-only operation from belonging in the Prisma migration.
6. Start the app:

```bash
pnpm dev
```

The migration creates the four shared tables, constraints, and read-only guest RLS policies. Guest writes go through authenticated Next.js API handlers using an HTTP-only random token; the Prisma database password is never sent to the browser.

If environment values are absent or still placeholders, `/join/B7X2KP` intentionally uses the local demo bill.

## Database commands

```bash
pnpm db:generate       # regenerate the typed Prisma client
pnpm db:migrate --name change_name
pnpm db:deploy         # apply committed migrations in deployment
pnpm db:studio
```

## Verification

```bash
pnpm lint
pnpm build --webpack
```
