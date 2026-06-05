-- Synapse — initial schema
-- Backs the Connect → Ingest → Generate → Persist → Capture loop.
-- RLS is ON for every table: a founder can only ever see their own rows.
-- Ingestion/cron jobs use the service-role key, which bypasses RLS.

create extension if not exists pgcrypto;

-- ── founders ──────────────────────────────────────────────────────
-- One row per authenticated user (mirrors auth.users). The mubit agent id is
-- derived from this id: synapse-founder-<id>.
create table if not exists public.founders (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  business_context text,                       -- "DTC skincare brand on Shopify"
  created_at  timestamptz not null default now()
);

-- ── connections ───────────────────────────────────────────────────
-- A founder's link to a data source. Phase 3: Shopify.
-- NOTE: access_token must be encrypted at rest. Use Supabase Vault
-- (vault.create_secret) or pgsodium rather than storing plaintext here.
create table if not exists public.connections (
  id            uuid primary key default gen_random_uuid(),
  founder_id    uuid not null references public.founders (id) on delete cascade,
  provider      text not null check (provider in ('shopify', 'stripe', 'ga4')),
  shop_domain   text,                          -- e.g. "acme.myshopify.com"
  access_token  text,                          -- ENCRYPT THIS (see note above)
  scopes        text,
  status        text not null default 'active' check (status in ('active', 'revoked', 'error')),
  created_at    timestamptz not null default now(),
  unique (founder_id, provider, shop_domain)
);

-- ── metric_snapshots ──────────────────────────────────────────────
-- One row per founder per week. `derived` matches lib/metrics/types.ts:DerivedMetrics.
create table if not exists public.metric_snapshots (
  id            uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.connections (id) on delete cascade,
  week_of       date not null,
  raw           jsonb not null default '{}'::jsonb,    -- untouched provider payloads
  derived       jsonb not null default '{}'::jsonb,    -- normalised DerivedMetrics
  created_at    timestamptz not null default now(),
  unique (connection_id, week_of)
);

-- ── briefs ────────────────────────────────────────────────────────
-- The generated Growth Brief. `raw_json` is the full GrowthBrief object;
-- the broken-out columns make the dashboard query cheap.
create table if not exists public.briefs (
  id               uuid primary key default gen_random_uuid(),
  founder_id       uuid not null references public.founders (id) on delete cascade,
  week_of          date not null,
  headline_numbers jsonb not null default '[]'::jsonb,
  whats_working    text,
  what_to_cut      text,
  one_move         jsonb not null default '{}'::jsonb,  -- { action, rationale }
  raw_json         jsonb not null,
  mubit_memory_ids text[] not null default '{}',        -- ids written for this brief
  created_at       timestamptz not null default now(),
  unique (founder_id, week_of)
);

-- ── actions ───────────────────────────────────────────────────────
-- Did the founder act on the one move? This signal is what we feed back to mubit
-- so next week's advice compounds.
create table if not exists public.actions (
  id            uuid primary key default gen_random_uuid(),
  brief_id      uuid not null references public.briefs (id) on delete cascade,
  one_move_text text not null,
  status        text not null default 'pending' check (status in ('pending', 'done', 'skipped')),
  outcome_note  text,
  updated_at    timestamptz not null default now()
);

-- ── indexes ───────────────────────────────────────────────────────
create index if not exists idx_connections_founder on public.connections (founder_id);
create index if not exists idx_snapshots_connection on public.metric_snapshots (connection_id, week_of desc);
create index if not exists idx_briefs_founder on public.briefs (founder_id, week_of desc);
create index if not exists idx_actions_brief on public.actions (brief_id);

-- ── row level security ────────────────────────────────────────────
alter table public.founders          enable row level security;
alter table public.connections       enable row level security;
alter table public.metric_snapshots  enable row level security;
alter table public.briefs            enable row level security;
alter table public.actions           enable row level security;

-- founders: a user sees only their own row.
create policy "founder self access" on public.founders
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- connections: scoped to the owning founder.
create policy "own connections" on public.connections
  for all using (auth.uid() = founder_id) with check (auth.uid() = founder_id);

-- metric_snapshots: reachable only through a connection the founder owns.
create policy "own snapshots" on public.metric_snapshots
  for all using (
    exists (
      select 1 from public.connections c
      where c.id = metric_snapshots.connection_id and c.founder_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.connections c
      where c.id = metric_snapshots.connection_id and c.founder_id = auth.uid()
    )
  );

-- briefs: scoped to the owning founder.
create policy "own briefs" on public.briefs
  for all using (auth.uid() = founder_id) with check (auth.uid() = founder_id);

-- actions: reachable only through a brief the founder owns.
create policy "own actions" on public.actions
  for all using (
    exists (
      select 1 from public.briefs b
      where b.id = actions.brief_id and b.founder_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.briefs b
      where b.id = actions.brief_id and b.founder_id = auth.uid()
    )
  );
