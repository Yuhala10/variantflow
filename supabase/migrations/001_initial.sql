create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Untitled catalog',
  catalog jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  tier text not null default 'FREE' check (tier in ('FREE', 'PRO', 'SCALE')),
  status text not null default 'active' check (status in ('active', 'past_due', 'canceled', 'expired')),
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.usage_monthly (
  user_id uuid not null references auth.users(id) on delete cascade,
  month_start date not null,
  row_runs integer not null default 0 check (row_runs >= 0),
  primary key (user_id, month_start)
);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  invoice_id text not null unique,
  tier text not null check (tier in ('PRO', 'SCALE')),
  amount_usdt numeric(18, 6) not null,
  transaction_hash text unique,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'failed', 'expired')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage_monthly enable row level security;
alter table public.payment_events enable row level security;

drop policy if exists "Users can read their profile" on public.profiles;
drop policy if exists "Users can update their profile" on public.profiles;
drop policy if exists "Users can manage their projects" on public.projects;
drop policy if exists "Users can read their subscription" on public.subscriptions;
drop policy if exists "Users can read their usage" on public.usage_monthly;
drop policy if exists "Users can read their payments" on public.payment_events;

create policy "Users can read their profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update their profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can manage their projects" on public.projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can read their subscription" on public.subscriptions for select using (auth.uid() = user_id);
create policy "Users can read their usage" on public.usage_monthly for select using (auth.uid() = user_id);
create policy "Users can read their payments" on public.payment_events for select using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  insert into public.subscriptions (user_id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
