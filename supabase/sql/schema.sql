create table if not exists public.daily_posts (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  position integer not null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone default now()
);

create table if not exists public.daily_claims (
  id uuid primary key default gen_random_uuid(),
  wallet text not null,
  post_id uuid not null references public.daily_posts(id),
  day_key text not null,
  claimed_at timestamp with time zone default now()
);

create table if not exists public.auth_nonces (
  wallet text primary key,
  nonce text not null,
  created_at timestamp with time zone default now(),
  used_at timestamp with time zone
);

create index if not exists daily_claims_wallet_idx on public.daily_claims(wallet);
create index if not exists daily_claims_day_idx on public.daily_claims(day_key);

alter table public.daily_posts enable row level security;
alter table public.daily_claims enable row level security;
alter table public.auth_nonces enable row level security;

revoke all on table public.daily_posts from anon, authenticated;
revoke all on table public.daily_claims from anon, authenticated;
revoke all on table public.auth_nonces from anon, authenticated;
