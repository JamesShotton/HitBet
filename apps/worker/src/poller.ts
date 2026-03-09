import { findArbs } from "@arb/core/src/arb.js";
import type { ArbOpportunity } from "@arb/core/src/types.js";
import { pool } from "./db.js";
import { fetchOdds, fetchSports } from "./oddsApi.js";
import { sendTelegram } from "./telegram.js";

function arbKey(a: ArbOpportunity) {
  return [
    a.event, a.market_group,
    a.leg1_book, a.leg2_book,
    a.leg1_name, a.leg2_name,
    a.leg1_odds.toFixed(4), a.leg2_odds.toFixed(4)
  ].join("|");
}

export async function runOnce() {
  const totalStake = Number(process.env.TOTAL_STAKE ?? 50);
  const maxSports = Number(process.env.MAX_SPORTS_TO_SCAN ?? 30);

  const runRes = await pool.query("insert into runs(scanned_sports,new_arbs,notes) values(0,0,$1) returning id", ["started"]);
  const runId = runRes.rows[0].id as number;

  const sports = (await fetchSports())
    .filter(s => s.active && s.key !== "upcoming")
    .slice(0, maxSports);

  let newCount = 0;

  for (const s of sports) {
    let events: any[] = [];
    try {
      events = await fetchOdds(s.key);
    } catch {
      continue;
    }

    const opps = findArbs(events, totalStake);

    // Only store the newest N per sport to avoid DB spam
    const top = opps.slice(0, 50);

    for (const a of top) {
      const key = arbKey(a);

      // de-dupe by key for last ~24h using a simple DB query (MVP approach)
      const exists = await pool.query(
        "select 1 from arbs where event=$1 and market_group=$2 and leg1_book=$3 and leg2_book=$4 and leg1_name=$5 and leg2_name=$6 and leg1_odds=$7 and leg2_odds=$8 and created_at > now() - interval '24 hours' limit 1",
        [a.event, a.market_group, a.leg1_book, a.leg2_book, a.leg1_name, a.leg2_name, a.leg1_odds, a.leg2_odds]
      );
      if (exists.rowCount) continue;

      await pool.query(
        `insert into arbs(
          event, commence_time, sport_key, market_group, margin, total_stake,
          leg1_name, leg1_point, leg1_odds, leg1_book, leg1_stake,
          leg2_name, leg2_point, leg2_odds, leg2_book, leg2_stake,
          est_profit
        ) values (
          $1, $2::timestamptz, $3, $4, $5, $6,
          $7, $8, $9, $10, $11,
          $12, $13, $14, $15, $16,
          $17
        )`,
        [
          a.event, a.commence_time ?? null, a.sport_key, a.market_group, a.margin, a.total_stake,
          a.leg1_name, a.leg1_point ?? null, a.leg1_odds, a.leg1_book, a.leg1_stake,
          a.leg2_name, a.leg2_point ?? null, a.leg2_odds, a.leg2_book, a.leg2_stake,
          a.est_profit
        ]
      );

      newCount++;

      // Telegram alert (short + useful)
      const warn = a.margin >= 0.05 ? "⚠️ verify market/line" : "";
      await sendTelegram(
        `ARB ${ (a.margin*100).toFixed(2) }% ${warn}\n` +
        `${a.event}\n` +
        `Market: ${a.market_group}\n` +
        `1) Back ${a.leg1_name}${a.leg1_point!=null ? " ("+a.leg1_point+")" : ""} @ ${a.leg1_odds} on ${a.leg1_book} (stake £${a.leg1_stake.toFixed(2)})\n` +
        `2) Back ${a.leg2_name}${a.leg2_point!=null ? " ("+a.leg2_point+")" : ""} @ ${a.leg2_odds} on ${a.leg2_book} (stake £${a.leg2_stake.toFixed(2)})\n` +
        `Est profit £${a.est_profit.toFixed(2)}`
      );
    }
  }

  await pool.query("update runs set finished_at=now(), scanned_sports=$1, new_arbs=$2, notes=$3 where id=$4",
    [sports.length, newCount, "finished", runId]);

  return { scannedSports: sports.length, newArbs: newCount };
}