import { OddsEvent, OddsBookmaker } from "./oddsApi.js";
import { ArbRow } from "./db.js";

const TOTAL_STAKE = Number(process.env.TOTAL_STAKE ?? 50);

// ─────────────────────────────────────────────────────────────
// Maths helpers
// ─────────────────────────────────────────────────────────────

function imp(odds: number) {
  return 1 / odds;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function split2(oA: number, oB: number) {
  const pA = imp(oA),
    pB = imp(oB),
    t = pA + pB;
  return {
    sA: round2((TOTAL_STAKE * pA) / t),
    sB: round2((TOTAL_STAKE * pB) / t),
  };
}

function split3(oA: number, oB: number, oC: number) {
  const pA = imp(oA),
    pB = imp(oB),
    pC = imp(oC),
    t = pA + pB + pC;
  return {
    sA: round2((TOTAL_STAKE * pA) / t),
    sB: round2((TOTAL_STAKE * pB) / t),
    sC: round2((TOTAL_STAKE * pC) / t),
  };
}

function minProfit2(sA: number, sB: number, oA: number, oB: number) {
  return round2(Math.min(sA * oA, sB * oB) - (sA + sB));
}

function minProfit3(
  sA: number,
  sB: number,
  sC: number,
  oA: number,
  oB: number,
  oC: number
) {
  return round2(Math.min(sA * oA, sB * oB, sC * oC) - (sA + sB + sC));
}

function margin2(oA: number, oB: number) {
  return 1 - imp(oA) - imp(oB);
}

function margin3(oA: number, oB: number, oC: number) {
  return 1 - imp(oA) - imp(oB) - imp(oC);
}

// ─────────────────────────────────────────────────────────────
// Best-price extraction
// ─────────────────────────────────────────────────────────────

type BestPrice = { odds: number; book: string };

/**
 * Scans all bookmakers for a given market and returns the best
 * (highest) odds per outcome key.
 *
 * usePoint=false → key is outcome name only         (h2h)
 * usePoint=true  → key is "name::point"             (spreads, totals)
 */
function bestByKey(
  bookmakers: OddsBookmaker[],
  marketKey: string,
  usePoint = false
): Record<string, BestPrice> {
  const best: Record<string, BestPrice> = {};

  for (const book of bookmakers) {
    const market = book.markets.find((m) => m.key === marketKey);
    if (!market) continue;

    for (const outcome of market.outcomes) {
      if (!outcome?.name || typeof outcome.price !== "number") continue;
      if (outcome.price <= 1.01) continue;

      const key =
        usePoint && outcome.point != null
          ? `${outcome.name}::${outcome.point}`
          : outcome.name;

      if (!best[key] || outcome.price > best[key].odds) {
        best[key] = { odds: outcome.price, book: book.title };
      }
    }
  }

  return best;
}

// ─────────────────────────────────────────────────────────────
// H2H 2-way  (US sports, tennis — no draw)
// ─────────────────────────────────────────────────────────────

function findH2H2Way(event: OddsEvent): ArbRow | null {
  const best = bestByKey(event.bookmakers, "h2h", false);
  const names = Object.keys(best);
  if (names.length !== 2) return null;

  const [n1, n2] = names;
  const { odds: o1, book: b1 } = best[n1];
  const { odds: o2, book: b2 } = best[n2];
  if (b1 === b2) return null;

  const m = margin2(o1, o2);
  if (m <= 0) return null;

  const { sA, sB } = split2(o1, o2);

  return {
    event: `${event.home_team} vs ${event.away_team}`,
    sport_key: event.sport_key,
    market_group: "h2h",
    commence_time: event.commence_time,
    legs: 2,
    margin: round2(m),
    est_profit: minProfit2(sA, sB, o1, o2),
    total_stake: TOTAL_STAKE,
    leg1_name: n1,
    leg1_book: b1,
    leg1_odds: o1,
    leg1_stake: sA,
    leg1_point: null,
    leg2_name: n2,
    leg2_book: b2,
    leg2_odds: o2,
    leg2_stake: sB,
    leg2_point: null,
  };
}

// ─────────────────────────────────────────────────────────────
// H2H 3-way  (football 1X2 — home / draw / away)
// ─────────────────────────────────────────────────────────────

function findH2H3Way(event: OddsEvent): ArbRow | null {
  const best = bestByKey(event.bookmakers, "h2h", false);
  const names = Object.keys(best);
  if (names.length !== 3) return null;

  const home = event.home_team;
  const away = event.away_team;
  const homeKey = names.find((n) => n === home);
  const awayKey = names.find((n) => n === away);
  const drawKey = names.find((n) => n !== home && n !== away);

  if (!homeKey || !awayKey || !drawKey) return null;

  const { odds: oH, book: bH } = best[homeKey];
  const { odds: oD, book: bD } = best[drawKey];
  const { odds: oA, book: bA } = best[awayKey];

  const m = margin3(oH, oD, oA);
  if (m <= 0) return null;

  const { sA: sH, sB: sD, sC: sAway } = split3(oH, oD, oA);

  return {
    event: `${home} vs ${away}`,
    sport_key: event.sport_key,
    market_group: "h2h_3way",
    commence_time: event.commence_time,
    legs: 3,
    margin: round2(m),
    est_profit: minProfit3(sH, sD, sAway, oH, oD, oA),
    total_stake: TOTAL_STAKE,
    leg1_name: `${home} win`,
    leg1_book: bH,
    leg1_odds: oH,
    leg1_stake: sH,
    leg1_point: null,
    leg2_name: "Draw",
    leg2_book: bD,
    leg2_odds: oD,
    leg2_stake: sD,
    leg2_point: null,
    leg3_name: `${away} win`,
    leg3_book: bA,
    leg3_odds: oA,
    leg3_stake: sAway,
    leg3_point: null,
  };
}

// ─────────────────────────────────────────────────────────────
// Spreads  (handicap — match on exact point line, opposite sides)
//
// e.g. Bet365: Arsenal -1.5 @ 2.10
//      Unibet: Chelsea +1.5 @ 2.05
//      imp(2.10) + imp(2.05) = 0.476 + 0.488 = 0.964 → arb!
// ─────────────────────────────────────────────────────────────

function findSpreads(event: OddsEvent): ArbRow[] {
  const arbs: ArbRow[] = [];
  const best = bestByKey(event.bookmakers, "spreads", true);

  type Side = { name: string; odds: number; book: string; point: number };
  const byAbsPoint: Record<string, Side[]> = {};

  for (const [key, bp] of Object.entries(best)) {
    const [name, pointStr] = key.split("::");
    const point = parseFloat(pointStr);
    if (isNaN(point)) continue;
    const abs = String(Math.abs(point));
    if (!byAbsPoint[abs]) byAbsPoint[abs] = [];
    byAbsPoint[abs].push({ name, odds: bp.odds, book: bp.book, point });
  }

  for (const sides of Object.values(byAbsPoint)) {
    // Need one negative side and one positive side at the same line
    const neg = sides.filter((s) => s.point < 0);
    const pos = sides.filter((s) => s.point > 0);

    // Try all neg/pos combinations — pick the best margin pair
    for (const n of neg) {
      for (const p of pos) {
        if (n.book === p.book) continue;
        const m = margin2(n.odds, p.odds);
        if (m <= 0) continue;

        const { sA, sB } = split2(n.odds, p.odds);

        arbs.push({
          event: `${event.home_team} vs ${event.away_team}`,
          sport_key: event.sport_key,
          market_group: "spreads",
          commence_time: event.commence_time,
          legs: 2,
          margin: round2(m),
          est_profit: minProfit2(sA, sB, n.odds, p.odds),
          total_stake: TOTAL_STAKE,
          leg1_name: `${n.name} ${n.point}`,
          leg1_book: n.book,
          leg1_odds: n.odds,
          leg1_stake: sA,
          leg1_point: String(n.point),
          leg2_name: `${p.name} +${p.point}`,
          leg2_book: p.book,
          leg2_odds: p.odds,
          leg2_stake: sB,
          leg2_point: String(p.point),
        });
      }
    }
  }

  return arbs;
}

// ─────────────────────────────────────────────────────────────
// Totals  (over/under — match on exact point line)
//
// e.g. Bet365:    Over 2.5 goals  @ 2.20
//      William Hill: Under 2.5 goals @ 2.15
//      imp(2.20) + imp(2.15) = 0.455 + 0.465 = 0.920 → arb!
// ─────────────────────────────────────────────────────────────

function findTotals(event: OddsEvent): ArbRow[] {
  const arbs: ArbRow[] = [];
  const best = bestByKey(event.bookmakers, "totals", true);

  type TotalSide = {
    side: "Over" | "Under";
    odds: number;
    book: string;
    point: number;
  };
  const byPoint: Record<string, TotalSide[]> = {};

  for (const [key, bp] of Object.entries(best)) {
    const [side, pointStr] = key.split("::");
    if (side !== "Over" && side !== "Under") continue;
    const point = parseFloat(pointStr);
    if (isNaN(point)) continue;
    if (!byPoint[pointStr]) byPoint[pointStr] = [];
    byPoint[pointStr].push({
      side: side as "Over" | "Under",
      odds: bp.odds,
      book: bp.book,
      point,
    });
  }

  for (const sides of Object.values(byPoint)) {
    const overs = sides.filter((s) => s.side === "Over");
    const unders = sides.filter((s) => s.side === "Under");

    // Try all over/under combinations at the same line
    for (const ov of overs) {
      for (const un of unders) {
        if (ov.book === un.book) continue;
        const m = margin2(ov.odds, un.odds);
        if (m <= 0) continue;

        const { sA, sB } = split2(ov.odds, un.odds);

        arbs.push({
          event: `${event.home_team} vs ${event.away_team}`,
          sport_key: event.sport_key,
          market_group: "totals",
          commence_time: event.commence_time,
          legs: 2,
          margin: round2(m),
          est_profit: minProfit2(sA, sB, ov.odds, un.odds),
          total_stake: TOTAL_STAKE,
          leg1_name: `Over ${ov.point}`,
          leg1_book: ov.book,
          leg1_odds: ov.odds,
          leg1_stake: sA,
          leg1_point: String(ov.point),
          leg2_name: `Under ${un.point}`,
          leg2_book: un.book,
          leg2_odds: un.odds,
          leg2_stake: sB,
          leg2_point: String(un.point),
        });
      }
    }
  }

  return arbs;
}

// ─────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────

export function extractArbs(events: OddsEvent[]): ArbRow[] {
  const arbs: ArbRow[] = [];

  for (const event of events) {
    // Skip events starting in less than 5 minutes — too risky to execute in time
    const startsIn = new Date(event.commence_time).getTime() - Date.now();
    if (startsIn < 5 * 60 * 1000) continue;

    if (!event.bookmakers || event.bookmakers.length < 2) continue;

    const h2h2 = findH2H2Way(event);
    if (h2h2) arbs.push(h2h2);

    const h2h3 = findH2H3Way(event);
    if (h2h3) arbs.push(h2h3);

    arbs.push(...findSpreads(event));
    arbs.push(...findTotals(event));
  }

  // Deduplicate: same event + market + books + line
  const seen = new Set<string>();
  const deduped = arbs.filter((a) => {
    const key = `${a.event}|${a.market_group}|${a.leg1_book}|${a.leg2_book}|${
      a.leg1_point ?? ""
    }|${a.leg2_point ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return deduped.sort((a, b) => b.margin - a.margin);
}
