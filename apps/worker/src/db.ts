import { Pool } from "pg";
import { redis, ARBS_CACHE_KEY, VALUE_CACHE_KEY, ARBS_TTL, VALUE_TTL } from "./redis.js";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL missing");

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export type ArbRow = {
  event: string;
  sport_key: string;
  market_group: string;
  commence_time: string;
  legs: number; // 2 or 3

  margin: number;
  est_profit: number;
  total_stake: number;

  leg1_name: string;
  leg1_book: string;
  leg1_odds: number;
  leg1_stake: number;
  leg1_point: string | null;

  leg2_name: string;
  leg2_book: string;
  leg2_odds: number;
  leg2_stake: number;
  leg2_point: string | null;

  // 3-way only
  leg3_name?: string | null;
  leg3_book?: string | null;
  leg3_odds?: number | null;
  leg3_stake?: number | null;
  leg3_point?: string | null;
};

export async function replaceArbs(arbs: ArbRow[]) {
  // Upsert each arb — refreshes expires_at and updates odds/stakes on conflict.
  // Requires unique index arbs_dedup_key from migration 002:
  //   (event, sport_key, market_group, leg1_book, leg2_book, leg1_name, leg2_name)
  for (const arb of arbs) {
    await pool.query(
      `
      INSERT INTO arbs (
        event, sport_key, market_group, commence_time,
        legs, margin, est_profit, total_stake,
        leg1_name, leg1_book, leg1_odds, leg1_stake, leg1_point,
        leg2_name, leg2_book, leg2_odds, leg2_stake, leg2_point,
        leg3_name, leg3_book, leg3_odds, leg3_stake, leg3_point,
        expires_at, created_at
      ) VALUES (
        $1,$2,$3,$4,
        $5,$6,$7,$8,
        $9,$10,$11,$12,$13,
        $14,$15,$16,$17,$18,
        $19,$20,$21,$22,$23,
        NOW() + INTERVAL '2 minutes', NOW()
      )
      ON CONFLICT (event, sport_key, market_group, leg1_book, leg2_book, leg1_name, leg2_name)
      DO UPDATE SET
        margin        = EXCLUDED.margin,
        est_profit    = EXCLUDED.est_profit,
        leg1_odds     = EXCLUDED.leg1_odds,
        leg1_stake    = EXCLUDED.leg1_stake,
        leg2_odds     = EXCLUDED.leg2_odds,
        leg2_stake    = EXCLUDED.leg2_stake,
        leg3_odds     = EXCLUDED.leg3_odds,
        leg3_stake    = EXCLUDED.leg3_stake,
        total_stake   = EXCLUDED.total_stake,
        commence_time = EXCLUDED.commence_time,
        expires_at    = EXCLUDED.expires_at
      `,
      [
        arb.event, arb.sport_key, arb.market_group, arb.commence_time,
        arb.legs ?? 2, arb.margin, arb.est_profit, arb.total_stake,
        arb.leg1_name, arb.leg1_book, arb.leg1_odds, arb.leg1_stake, arb.leg1_point,
        arb.leg2_name, arb.leg2_book, arb.leg2_odds, arb.leg2_stake, arb.leg2_point,
        arb.leg3_name ?? null, arb.leg3_book ?? null, arb.leg3_odds ?? null,
        arb.leg3_stake ?? null, arb.leg3_point ?? null,
      ]
    );
  }

  // Remove arbs expired more than 10 minutes ago (buffer keeps data visible
  // during slow worker cycles or brief restarts)
  await pool.query(
    `DELETE FROM arbs WHERE expires_at < NOW() - INTERVAL '10 minutes'`
  );

  // Write to Redis so the API serves from cache without a DB query
  try {
    await redis.set(ARBS_CACHE_KEY, JSON.stringify(arbs), { ex: ARBS_TTL });
  } catch (err) {
    console.error("[worker] Redis write failed (arbs):", err);
  }
}

export type ValueBetRow = {
  event: string;
  sport_key: string;
  market_group: string;
  commence_time: string;
  selection: string;
  soft_book: string;
  soft_odds: number;
  point: string | null;
  sharp_book: string;
  sharp_odds: number;
  ev_pct: number;
  true_prob: number;
  soft_implied_prob: number;
  kelly_stake: number;
  expected_profit: number;
};

export async function replaceValueBets(bets: ValueBetRow[]) {
  // Upsert — requires unique index value_bets_dedup_key from migration 002:
  //   (event, sport_key, market_group, selection, soft_book)
  for (const b of bets) {
    await pool.query(
      `
      INSERT INTO value_bets (
        event, sport_key, market_group, commence_time,
        selection, soft_book, soft_odds, point,
        sharp_book, sharp_odds,
        ev_pct, true_prob, soft_implied_prob, kelly_stake, expected_profit,
        expires_at, created_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,
        NOW() + INTERVAL '6 minutes', NOW())
      ON CONFLICT (event, sport_key, market_group, selection, soft_book)
      DO UPDATE SET
        soft_odds         = EXCLUDED.soft_odds,
        sharp_odds        = EXCLUDED.sharp_odds,
        ev_pct            = EXCLUDED.ev_pct,
        true_prob         = EXCLUDED.true_prob,
        soft_implied_prob = EXCLUDED.soft_implied_prob,
        kelly_stake       = EXCLUDED.kelly_stake,
        expected_profit   = EXCLUDED.expected_profit,
        commence_time     = EXCLUDED.commence_time,
        expires_at        = EXCLUDED.expires_at
      `,
      [
        b.event, b.sport_key, b.market_group, b.commence_time,
        b.selection, b.soft_book, b.soft_odds, b.point,
        b.sharp_book, b.sharp_odds,
        b.ev_pct, b.true_prob, b.soft_implied_prob, b.kelly_stake, b.expected_profit,
      ]
    );
  }

  // Remove value bets expired more than 30 minutes ago
  await pool.query(
    `DELETE FROM value_bets WHERE expires_at < NOW() - INTERVAL '30 minutes'`
  );

  try {
    await redis.set(VALUE_CACHE_KEY, JSON.stringify(bets), { ex: VALUE_TTL });
  } catch (err) {
    console.error("[worker] Redis write failed (value_bets):", err);
  }
}
