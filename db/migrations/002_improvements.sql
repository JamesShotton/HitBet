-- ============================================================
-- Migration 002: TTL-based arb storage + unique upsert indexes
-- Run this in the Supabase SQL editor before restarting the worker
-- ============================================================

-- ── 1. Ensure arbs has all columns the worker expects ────────
ALTER TABLE arbs ADD COLUMN IF NOT EXISTS legs         int     NOT NULL DEFAULT 2;
ALTER TABLE arbs ADD COLUMN IF NOT EXISTS leg3_name    text;
ALTER TABLE arbs ADD COLUMN IF NOT EXISTS leg3_book    text;
ALTER TABLE arbs ADD COLUMN IF NOT EXISTS leg3_odds    numeric;
ALTER TABLE arbs ADD COLUMN IF NOT EXISTS leg3_stake   numeric;
ALTER TABLE arbs ADD COLUMN IF NOT EXISTS leg3_point   numeric;

-- ── 2. Add expires_at to arbs ────────────────────────────────
ALTER TABLE arbs ADD COLUMN IF NOT EXISTS expires_at timestamptz;
UPDATE arbs SET expires_at = now() + interval '2 minutes' WHERE expires_at IS NULL;
CREATE INDEX IF NOT EXISTS arbs_expires_at_idx ON arbs (expires_at);

-- ── 3. Deduplicate arbs so the unique index can be created ───
-- Keep the most-recently-created row when duplicates exist
DELETE FROM arbs a
USING arbs b
WHERE a.id < b.id
  AND a.event        = b.event
  AND a.sport_key    = b.sport_key
  AND a.market_group = b.market_group
  AND a.leg1_book    = b.leg1_book
  AND a.leg2_book    = b.leg2_book
  AND a.leg1_name    = b.leg1_name
  AND a.leg2_name    = b.leg2_name;

-- ── 4. Unique index — enables ON CONFLICT upsert in worker ───
CREATE UNIQUE INDEX IF NOT EXISTS arbs_dedup_key ON arbs (
  event, sport_key, market_group, leg1_book, leg2_book, leg1_name, leg2_name
);

-- ── 5. Create value_bets if it does not exist ────────────────
CREATE TABLE IF NOT EXISTS value_bets (
  id                bigserial    PRIMARY KEY,
  created_at        timestamptz  DEFAULT now(),
  event             text         NOT NULL,
  sport_key         text         NOT NULL,
  market_group      text         NOT NULL,
  commence_time     timestamptz,
  selection         text         NOT NULL,
  soft_book         text         NOT NULL,
  soft_odds         numeric      NOT NULL,
  point             text,
  sharp_book        text         NOT NULL,
  sharp_odds        numeric      NOT NULL,
  ev_pct            numeric      NOT NULL,
  true_prob         numeric      NOT NULL,
  soft_implied_prob numeric      NOT NULL,
  kelly_stake       numeric      NOT NULL,
  expected_profit   numeric      NOT NULL
);

-- ── 6. Add expires_at to value_bets ─────────────────────────
ALTER TABLE value_bets ADD COLUMN IF NOT EXISTS expires_at timestamptz;
UPDATE value_bets SET expires_at = now() + interval '6 minutes' WHERE expires_at IS NULL;
CREATE INDEX IF NOT EXISTS value_bets_expires_at_idx ON value_bets (expires_at);

-- ── 7. Deduplicate value_bets ────────────────────────────────
DELETE FROM value_bets a
USING value_bets b
WHERE a.id < b.id
  AND a.event        = b.event
  AND a.sport_key    = b.sport_key
  AND a.market_group = b.market_group
  AND a.selection    = b.selection
  AND a.soft_book    = b.soft_book;

-- ── 8. Unique index for value_bets upsert ───────────────────
CREATE UNIQUE INDEX IF NOT EXISTS value_bets_dedup_key ON value_bets (
  event, sport_key, market_group, selection, soft_book
);

-- ── 9. Ensure subscriptions has all columns code expects ─────
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS user_email         text;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan               text;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS trial_expires_at   timestamptz;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS current_period_end timestamptz;

-- Add unique constraint on user_email (needed for ON CONFLICT upserts in webhook)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'subscriptions_user_email_key'
  ) THEN
    BEGIN
      ALTER TABLE subscriptions
        ADD CONSTRAINT subscriptions_user_email_key UNIQUE (user_email);
    EXCEPTION WHEN others THEN NULL;
    END;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS subscriptions_user_email_idx ON subscriptions (user_email);
