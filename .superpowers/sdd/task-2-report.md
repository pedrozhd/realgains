# Task 2 Report: Migração do banco — colunas de billing em `profiles`

## Summary

Task 2 has been completed successfully. All required files have been created, updated, and committed as specified in the task brief.

## Implementation Details

### Step 1: Migration File Created ✓

**File:** `supabase/migrations/0008_stripe_billing.sql`

This migration file was created with the exact SQL specified in the brief:
- Adds four new columns to `public.profiles` table:
  - `stripe_customer_id` (text, nullable)
  - `stripe_subscription_id` (text, nullable)
  - `subscription_status` (text, nullable)
  - `is_legacy_free` (boolean, not null, default false)
- Includes the UPDATE statement that marks all existing users as legacy free users (`is_legacy_free = true`)

Full migration SQL:
```sql
-- Billing via Stripe: colunas de assinatura em profiles + grandfathering do beta.
alter table public.profiles
  add column stripe_customer_id text,
  add column stripe_subscription_id text,
  add column subscription_status text,
  add column is_legacy_free boolean not null default false;

-- Quem já tem conta na data desta migração fica isento de cobrança para sempre.
update public.profiles set is_legacy_free = true;
```

### Step 2: Live Database Migration - INTENTIONALLY SKIPPED ⊘

**Reason:** As specified in the scope change, the Supabase CLI is not installed in this environment (`supabase` command is unavailable), and direct database connection was deliberately excluded from the task scope.

**Note:** This is production DDL that adds columns to and updates every row in the `profiles` table. The human team must execute this migration directly in the Supabase dashboard or via `supabase db push` in their local environment with the CLI properly configured.

### Step 3: Schema File Updated ✓

**File:** `supabase/schema.sql`

The `profiles` table definition (lines 62-70) was updated to reflect the post-migration schema state. All existing columns (`id`, `api_token`, `nome`) were preserved, and the four new billing columns were added in the correct order:

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  api_token text unique not null default encode(gen_random_bytes(24), 'hex'),
  nome text,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text,
  is_legacy_free boolean not null default false
);
```

No other parts of `schema.sql` were modified. All RLS policies, triggers, and other table definitions remain intact.

### Step 4: Commit Created ✓

**Commit Hash:** `82b4347`
**Commit Message:** `Adiciona colunas de billing Stripe em profiles e isenta contas do beta`

Both modified files were successfully committed:
- `supabase/migrations/0008_stripe_billing.sql` (created)
- `supabase/schema.sql` (modified)

Note: The `.gitignore` file contains a rule ignoring `supabase/**/*.sql` files. These were force-added (`git add -f`) as required by the task brief's explicit commit instructions.

## Self-Review Checklist

- ✓ Migration file contains exact SQL from the brief
- ✓ All four new columns added to schema.sql profiles table
- ✓ Existing columns (`id`, `api_token`, `nome`) preserved in schema.sql
- ✓ No other tables or RLS policies were modified in schema.sql
- ✓ Commit created with exact message from the brief
- ✓ Step 2 (live database migration) skipped as per scope change

## Files Created/Modified

1. **Created:** `supabase/migrations/0008_stripe_billing.sql` (10 lines)
2. **Modified:** `supabase/schema.sql` (added 4 columns to profiles table definition)

## Next Steps

The human developer should:
1. Execute Step 2 (live database migration) using either:
   - `supabase db push` (if CLI is configured locally)
   - Direct SQL execution in the Supabase dashboard
2. Verify the migration results:
   - All existing profiles should have `is_legacy_free = true`
   - New columns should be nullable/with correct defaults
3. Proceed to Task 3 (or dependent tasks like 4, 5, 6, 8 that consume these columns)

## Status: COMPLETE

---

## Addendum: Idempotency Fix (Task Review Finding)

### Finding
The migration file used plain `add column` statements without the `if not exists` conditional, which is inconsistent with the project's established migration convention. Two existing migrations already use the defensive form:
- `supabase/migrations/0004_profiles_nome.sql:4` → `alter table public.profiles add column if not exists nome text;`
- `supabase/migrations/0002_dias_semana.sql:6-7` → uses `add column if not exists dias_semana ...`

Without `if not exists`, re-running the migration (e.g., after a partial failure or manual re-apply) would error with "column already exists," unlike the rest of the project's migrations.

### Fix Applied ✓

**File:** `supabase/migrations/0008_stripe_billing.sql`

Changed each of the four `add column` clauses to `add column if not exists`:

**Before:**
```sql
alter table public.profiles
  add column stripe_customer_id text,
  add column stripe_subscription_id text,
  add column subscription_status text,
  add column is_legacy_free boolean not null default false;
```

**After:**
```sql
alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status text,
  add column if not exists is_legacy_free boolean not null default false;
```

All other aspects of the migration remain unchanged:
- Column names, types, and constraints preserved
- The `update public.profiles set is_legacy_free = true;` statement unchanged
- Comments and formatting intact

### Confirmation

The migration is now idempotent and consistent with the project's migration pattern. Re-running this migration will not fail if columns already exist.
