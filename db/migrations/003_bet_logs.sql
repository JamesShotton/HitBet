CREATE TABLE IF NOT EXISTS bet_logs (
  id           BIGSERIAL PRIMARY KEY,
  user_email   TEXT NOT NULL,
  event        TEXT,
  market_group TEXT,
  leg1_book    TEXT,
  leg2_book    TEXT,
  leg3_book    TEXT,
  stake        NUMERIC(10,2),
  profit       NUMERIC(10,2) NOT NULL,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bet_logs_user_idx ON bet_logs (user_email, created_at DESC);
