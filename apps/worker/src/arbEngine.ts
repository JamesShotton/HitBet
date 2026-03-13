import { OddsEvent } from "./oddsApi.js";
import { ArbRow } from "./db.js";

const TOTAL_STAKE = Number(process.env.TOTAL_STAKE ?? 50);

function implied(odds: number) {
  return 1 / odds;
}

// ── 2-way stake split ──────────────────────────────────────────
function split2(oddsA: number, oddsB: number) {
  const pA = implied(oddsA);
  const pB = implied(oddsB);
  const total = pA + pB;
  return {
    stakeA: Number(((TOTAL_STAKE * pA) / total).toFixed(2)),
    stakeB: Number(((TOTAL_STAKE * pB) / total).toFixed(2)),
  };
}

// ── 3-way stake split ──────────────────────────────────────────
function split3(oddsA: number, oddsB: number, oddsC: number) {
  const pA = implied(oddsA);
  const pB = implied(oddsB);
  const pC = implied(oddsC);
  const total = pA + pB + pC;
  return {
    stakeA: Number(((TOTAL_STAKE * pA) / total).toFixed(2)),
    stakeB: Number(((TOTAL_STAKE * pB) / total).toFixed(2)),
    stakeC: Number(((TOTAL_STAKE * pC) / total).toFixed(2)),
  };
}

function minReturn2(sA: number, sB: number, oA: number, oB: number) {
  return Number((Math.min(sA * oA, sB * oB) - (sA + sB)).toFixed(2));
}

function minReturn3(
  sA: number,
  sB: number,
  sC: number,
  oA: number,
  oB: number,
  oC: number
) {
  return Number(
    (Math.min(sA * oA, sB * oB, sC * oC) - (sA + sB + sC)).toFixed(2)
  );
}

// ── Extract best price per outcome across all books ────────────
function bestPrices(event: OddsEvent, marketKey: string) {
  const best: Record<string, { odds: number; book: string }> = {};

  for (const book of event.bookmakers) {
    const market = book.markets.find((m) => m.key === marketKey);
    if (!market) continue;

    for (const outcome of market.outcomes) {
      if (!outcome?.name || typeof outcome.price !== "number") continue;
      if (!best[outcome.name] || outcome.price > best[outcome.name].odds) {
        best[outcome.name] = { odds: outcome.price, book: book.title };
      }
    }
  }

  return best;
}

// ── Find 2-way arbs (h2h with exactly 2 outcomes — no draw) ───
function find2WayArbs(events: OddsEvent[]): ArbRow[] {
  const arbs: ArbRow[] = [];

  for (const event of events) {
    const home = event.home_team;
    const away = event.away_team;

    const best = bestPrices(event, "h2h");
    const names = Object.keys(best);

    // Only process if exactly 2 outcomes (no draw — e.g. US sports, tennis)
    if (names.length !== 2) continue;

    const [n1, n2] = names;
    const { odds: o1, book: b1 } = best[n1];
    const { odds: o2, book: b2 } = best[n2];

    if (!b1 || !b2 || b1 === b2) continue;
    if (o1 <= 1 || o2 <= 1) continue;

    const arbSum = implied(o1) + implied(o2);
    if (arbSum >= 1) continue;

    const margin = 1 - arbSum;
    const { stakeA, stakeB } = split2(o1, o2);
    const estProfit = minReturn2(stakeA, stakeB, o1, o2);

    arbs.push({
      event: `${home} vs ${away}`,
      sport_key: event.sport_key,
      market_group: "h2h",
      commence_time: event.commence_time,
      legs: 2,
      margin,
      est_profit: estProfit,
      total_stake: TOTAL_STAKE,
      leg1_name: `${n1} win`,
      leg1_book: b1,
      leg1_odds: o1,
      leg1_stake: stakeA,
      leg1_point: null,
      leg2_name: `${n2} win`,
      leg2_book: b2,
      leg2_odds: o2,
      leg2_stake: stakeB,
      leg2_point: null,
    });
  }

  return arbs;
}

// ── Find 3-way arbs (football 1X2 — home/draw/away) ───────────
function find3WayArbs(events: OddsEvent[]): ArbRow[] {
  const arbs: ArbRow[] = [];

  for (const event of events) {
    const home = event.home_team;
    const away = event.away_team;

    const best = bestPrices(event, "h2h");
    const names = Object.keys(best);

    // Only process if exactly 3 outcomes (home + draw + away)
    if (names.length !== 3) continue;

    // Identify home, draw, away outcomes
    const homeKey = names.find((n) => n === home);
    const awayKey = names.find((n) => n === away);
    const drawKey = names.find((n) => n !== home && n !== away);

    if (!homeKey || !awayKey || !drawKey) continue;

    const { odds: oH, book: bH } = best[homeKey];
    const { odds: oD, book: bD } = best[drawKey];
    const { odds: oA, book: bA } = best[awayKey];

    if (oH <= 1 || oD <= 1 || oA <= 1) continue;

    // All 3 books must be different for cleaner execution
    // (same book on 2 legs is fine but flag it)
    const arbSum = implied(oH) + implied(oD) + implied(oA);
    if (arbSum >= 1) continue;

    const margin = 1 - arbSum;
    const { stakeA: sH, stakeB: sD, stakeC: sA } = split3(oH, oD, oA);
    const estProfit = minReturn3(sH, sD, sA, oH, oD, oA);

    arbs.push({
      event: `${home} vs ${away}`,
      sport_key: event.sport_key,
      market_group: "h2h_3way",
      commence_time: event.commence_time,
      legs: 3,
      margin,
      est_profit: estProfit,
      total_stake: TOTAL_STAKE,
      leg1_name: `${homeKey} win`,
      leg1_book: bH,
      leg1_odds: oH,
      leg1_stake: sH,
      leg1_point: null,
      leg2_name: "Draw",
      leg2_book: bD,
      leg2_odds: oD,
      leg2_stake: sD,
      leg2_point: null,
      leg3_name: `${awayKey} win`,
      leg3_book: bA,
      leg3_odds: oA,
      leg3_stake: sA,
      leg3_point: null,
    });
  }

  return arbs;
}

export function extractArbs(events: OddsEvent[]): ArbRow[] {
  const arbs2 = find2WayArbs(events);
  const arbs3 = find3WayArbs(events);
  const all = [...arbs2, ...arbs3];
  return all.sort((a, b) => b.margin - a.margin);
}
