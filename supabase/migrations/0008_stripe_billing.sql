-- Billing via Stripe: colunas de assinatura em profiles + grandfathering do beta.
alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status text,
  add column if not exists is_legacy_free boolean not null default false;

-- Quem já tem conta na data desta migração fica isento de cobrança para sempre.
update public.profiles set is_legacy_free = true;
