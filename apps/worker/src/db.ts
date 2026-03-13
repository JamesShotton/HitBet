import { Pool } from "pg";

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
  await pool.query(`delete from arbs`);

  for (const arb of arbs) {
    await pool.query(
      `
      insert into arbs (
        event, sport_key, market_group, commence_time,
        legs, margin, est_profit, total_stake,
        leg1_name, leg1_book, leg1_odds, leg1_stake, leg1_point,
        leg2_name, leg2_book, leg2_odds, leg2_stake, leg2_point,
        leg3_name, leg3_book, leg3_odds, leg3_stake, leg3_point,
        created_at
      )
      values (
        $1,$2,$3,$4,
        $5,$6,$7,$8,
        $9,$10,$11,$12,$13,
        $14,$15,$16,$17,$18,
        $19,$20,$21,$22,$23,
        now()
      )
      `,
      [
        arb.event,
        arb.sport_key,
        arb.market_group,
        arb.commence_time,
        arb.legs ?? 2,
        arb.margin,
        arb.est_profit,
        arb.total_stake,
        arb.leg1_name,
        arb.leg1_book,
        arb.leg1_odds,
        arb.leg1_stake,
        arb.leg1_point,
        arb.leg2_name,
        arb.leg2_book,
        arb.leg2_odds,
        arb.leg2_stake,
        arb.leg2_point,
        arb.leg3_name ?? null,
        arb.leg3_book ?? null,
        arb.leg3_odds ?? null,
        arb.leg3_stake ?? null,
        arb.leg3_point ?? null,
      ]
    );
  }
}
