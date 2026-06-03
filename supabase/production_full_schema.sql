create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  plan text not null default 'free' check (plan in ('free','pro','creator','team')),
  subscription_status text default 'free',
  stripe_customer_id text unique,
  stripe_subscription_id text,
  current_period_end timestamptz,
  creator_name text,
  creator_type text,
  niche text,
  tone text,
  audience text,
  goals text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.usage_limits (
  user_id uuid references auth.users(id) on delete cascade,
  month text not null,
  count int not null default 0,
  primary key(user_id, month)
);

create table if not exists public.ai_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  tool text not null,
  input text,
  output text,
  created_at timestamptz default now()
);

create table if not exists public.stream_data (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  platform text,
  minutes int,
  avg_viewers int,
  max_viewers int,
  followers_gained int,
  comments int,
  revenue numeric default 0,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.overlay_urls (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  token text unique not null,
  name text,
  html text not null,
  plan text,
  expires_at timestamptz not null,
  active boolean default true,
  created_at timestamptz default now()
);

create index if not exists profiles_stripe_customer_id_idx on public.profiles(stripe_customer_id);
create index if not exists profiles_stripe_subscription_id_idx on public.profiles(stripe_subscription_id);
create index if not exists overlay_urls_token_idx on public.overlay_urls(token);

alter table public.profiles enable row level security;
alter table public.usage_limits enable row level security;
alter table public.ai_history enable row level security;
alter table public.stream_data enable row level security;
alter table public.overlay_urls enable row level security;

create policy "profiles owner" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "usage owner" on public.usage_limits for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "history owner" on public.ai_history for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "stream owner" on public.stream_data for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "overlay owner" on public.overlay_urls for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Public overlay display is served through /api/overlay/[token] using the service role.
-- Do not expose overlay HTML directly from the client.
