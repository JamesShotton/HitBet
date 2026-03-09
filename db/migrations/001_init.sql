create table if not exists users (
  id text primary key,
  email text unique not null,
  created_at timestamptz default now()
);

create table if not exists subscriptions (
  user_id text primary key references users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'inactive',
  current_period_end timestamptz,
  updated_at timestamptz default now()
);

create table if not exists arbs (
  id bigserial primary key,
  created_at timestamptz default now(),
  event text not null,
  commence_time timestamptz,
  sport_key text not null,
  market_group text not null, -- e.g. h2h or totals|2.5
  margin numeric not null,
  total_stake numeric not null,

  leg1_name text not null,
  leg1_point numeric,
  leg1_odds numeric not null,
  leg1_book text not null,
  leg1_stake numeric not null,

  leg2_name text not null,
  leg2_point numeric,
  leg2_odds numeric not null,
  leg2_book text not null,
  leg2_stake numeric not null,

  est_profit numeric not null
);

create index if not exists arbs_created_at_idx on arbs(created_at desc);
create index if not exists arbs_margin_idx on arbs(margin desc);

create table if not exists runs (
  id bigserial primary key,
  started_at timestamptz default now(),
  finished_at timestamptz,
  scanned_sports int not null default 0,
  new_arbs int not null default 0,
  notes text
);