CREATE TABLE IF NOT EXISTS affiliates (
  id           BIGSERIAL PRIMARY KEY,
  user_email   TEXT NOT NULL UNIQUE,
  ref_code     TEXT NOT NULL UNIQUE,
  payout_email TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referral_clicks (
  id         BIGSERIAL PRIMARY KEY,
  ref_code   TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS referral_clicks_code_idx ON referral_clicks (ref_code, created_at DESC);

CREATE TABLE IF NOT EXISTS referral_conversions (
  id                 BIGSERIAL PRIMARY KEY,
  ref_code           TEXT NOT NULL,
  referred_email     TEXT NOT NULL,
  plan               TEXT NOT NULL,
  sale_amount        NUMERIC(10,2) NOT NULL,
  commission         NUMERIC(10,2) NOT NULL,
  is_trial           BOOLEAN NOT NULL DEFAULT FALSE,
  stripe_session_id  TEXT UNIQUE,
  paid_out           BOOLEAN NOT NULL DEFAULT FALSE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS referral_conversions_code_idx ON referral_conversions (ref_code, created_at DESC);
