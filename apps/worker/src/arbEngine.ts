import { OddsEvent, OddsBookmaker } from "./oddsApi.js";
import { ArbRow } from "./db.js";

const TOTAL_STAKE = Number(process.env.TOTAL_STAKE ?? 50);


// US-only and Australian-only books — inaccessible to UK users
// Everything else (UK, EU, Pinnacle, Bwin, Marathon Bet etc.) is kept
const BLOCKED_BOOKS = new Set([
  "FanDuel", "DraftKings", "BetMGM", "Caesars", "SuperBook",
  "WynnBET", "PointsBet", "BetRivers", "Hard Rock Bet", "Fanatics",
  "ESPN Bet", "SugarHouse", "Bet105", "Unibet (US)",
  "TAB", "Neds", "Sportsbet", "Palmerbet", "Bluebet",
]);

// ─────────────────────────────────────────────────────────────
// Maths
// ─────────────────────────────────────────────────────────────

const imp = (o: number) => 1 / o;
const r2 = (n: number) => Math.round(n * 100) / 100;

function split2(oA: number, oB: number) {
  const pA = imp(oA), pB = imp(oB), t = pA + pB;
  return { sA: r2((TOTAL_STAKE * pA) / t), sB: r2((TOTAL_STAKE * pB) / t) };
}

function split3(oA: number, oB: number, oC: number) {
  const pA = imp(oA), pB = imp(oB), pC = imp(oC), t = pA + pB + pC;
  return {
    sA: r2((TOTAL_STAKE * pA) / t),
    sB: r2((TOTAL_STAKE * pB) / t),
    sC: r2((TOTAL_STAKE * pC) / t),
  };
}

const profit2 = (sA: number, sB: number, oA: number, oB: number) =>
  r2(Math.min(sA * oA, sB * oB) - (sA + sB));

const profit3 = (sA: number, sB: number, sC: number, oA: number, oB: number, oC: number) =>
  r2(Math.min(sA * oA, sB * oB, sC * oC) - (sA + sB + sC));

const margin2 = (oA: number, oB: number) => 1 - imp(oA) - imp(oB);
const margin3 = (oA: number, oB: number, oC: number) => 1 - imp(oA) - imp(oB) - imp(oC);

// ─────────────────────────────────────────────────────────────
// Best price extraction
// ─────────────────────────────────────────────────────────────

type BP = { odds: number; book: string };

function bestByKey(
  bookmakers: OddsBookmaker[],
  marketKey: string,
  usePoint = false
): Record<string, BP> {
  const best: Record<string, BP> = {};
  for (const book of bookmakers) {
    if (BLOCKED_BOOKS.has(book.title)) continue;
    const market = book.markets.find(m => m.key === marketKey);
    if (!market) continue;
    for (const o of market.outcomes) {
      if (!o?.name || typeof o.price !== "number" || o.price <= 1.01) continue;
      // For player props the player name is in description, not name
      const label = (o as any).description
        ? `${(o as any).description}::${o.name}::${o.point ?? ""}`
        : usePoint && o.point != null
          ? `${o.name}::${o.point}`
          : o.name;
      if (!best[label] || o.price > best[label].odds) {
        best[label] = { odds: o.price, book: book.title };
      }
    }
  }
  return best;
}

// ─────────────────────────────────────────────────────────────
// H2H 2-way  (no draw — tennis, NBA, NHL, NFL etc)
// ─────────────────────────────────────────────────────────────

function h2h2(event: OddsEvent, marketKey = "h2h"): ArbRow | null {
  const best = bestByKey(event.bookmakers, marketKey, false);
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
    market_group: marketKey,
    commence_time: event.commence_time,
    legs: 2, margin: r2(m),
    est_profit: profit2(sA, sB, o1, o2),
    total_stake: TOTAL_STAKE,
    leg1_name: n1, leg1_book: b1, leg1_odds: o1, leg1_stake: sA, leg1_point: null,
    leg2_name: n2, leg2_book: b2, leg2_odds: o2, leg2_stake: sB, leg2_point: null,
  };
}

// ─────────────────────────────────────────────────────────────
// H2H 3-way  (football 1X2)
// ─────────────────────────────────────────────────────────────

function h2h3(event: OddsEvent, marketKey = "h2h"): ArbRow | null {
  const best = bestByKey(event.bookmakers, marketKey, false);
  const names = Object.keys(best);
  if (names.length !== 3) return null;
  const homeKey = names.find(n => n === event.home_team);
  const awayKey = names.find(n => n === event.away_team);
  const drawKey = names.find(n => n !== event.home_team && n !== event.away_team);
  if (!homeKey || !awayKey || !drawKey) return null;
  const { odds: oH, book: bH } = best[homeKey];
  const { odds: oD, book: bD } = best[drawKey];
  const { odds: oA, book: bA } = best[awayKey];
  const m = margin3(oH, oD, oA);
  if (m <= 0) return null;
  const { sA: sH, sB: sD, sC: sAway } = split3(oH, oD, oA);
  return {
    event: `${event.home_team} vs ${event.away_team}`,
    sport_key: event.sport_key,
    market_group: marketKey === "h2h" ? "h2h_3way" : `${marketKey}_3way`,
    commence_time: event.commence_time,
    legs: 3, margin: r2(m),
    est_profit: profit3(sH, sD, sAway, oH, oD, oA),
    total_stake: TOTAL_STAKE,
    leg1_name: `${event.home_team} win`, leg1_book: bH, leg1_odds: oH, leg1_stake: sH, leg1_point: null,
    leg2_name: "Draw", leg2_book: bD, leg2_odds: oD, leg2_stake: sD, leg2_point: null,
    leg3_name: `${event.away_team} win`, leg3_book: bA, leg3_odds: oA, leg3_stake: sAway, leg3_point: null,
  };
}

// ─────────────────────────────────────────────────────────────
// Spreads  (handicap — match on exact absolute point line)
// Works for standard spreads AND alternate_spreads
// ─────────────────────────────────────────────────────────────

function spreads(event: OddsEvent, marketKey = "spreads"): ArbRow[] {
  const arbs: ArbRow[] = [];
  const best = bestByKey(event.bookmakers, marketKey, true);

  type Side = { name: string; odds: number; book: string; point: number };
  const byAbs: Record<string, Side[]> = {};

  for (const [key, bp] of Object.entries(best)) {
    const [name, pointStr] = key.split("::");
    const point = parseFloat(pointStr);
    if (isNaN(point)) continue;
    const abs = String(Math.abs(point));
    if (!byAbs[abs]) byAbs[abs] = [];
    byAbs[abs].push({ name, odds: bp.odds, book: bp.book, point });
  }

  for (const sides of Object.values(byAbs)) {
    const negs = sides.filter(s => s.point < 0);
    const poss = sides.filter(s => s.point > 0);
    for (const n of negs) {
      for (const p of poss) {
        if (n.book === p.book) continue;
        const m = margin2(n.odds, p.odds);
        if (m <= 0) continue;
        const { sA, sB } = split2(n.odds, p.odds);
        arbs.push({
          event: `${event.home_team} vs ${event.away_team}`,
          sport_key: event.sport_key,
          market_group: marketKey,
          commence_time: event.commence_time,
          legs: 2, margin: r2(m),
          est_profit: profit2(sA, sB, n.odds, p.odds),
          total_stake: TOTAL_STAKE,
          leg1_name: `${n.name} ${n.point}`, leg1_book: n.book, leg1_odds: n.odds, leg1_stake: sA, leg1_point: String(n.point),
          leg2_name: `${p.name} +${p.point}`, leg2_book: p.book, leg2_odds: p.odds, leg2_stake: sB, leg2_point: String(p.point),
        });
      }
    }
  }
  return arbs;
}

// ─────────────────────────────────────────────────────────────
// Totals  (over/under — match on exact point line)
// Works for totals AND alternate_totals (O/U 0.5, 1.5, 2.5...)
// ─────────────────────────────────────────────────────────────

function totals(event: OddsEvent, marketKey = "totals"): ArbRow[] {
  const arbs: ArbRow[] = [];
  const best = bestByKey(event.bookmakers, marketKey, true);

  type TSide = { side: "Over" | "Under"; odds: number; book: string; point: number };
  const byPoint: Record<string, TSide[]> = {};

  for (const [key, bp] of Object.entries(best)) {
    const [side, pointStr] = key.split("::");
    if (side !== "Over" && side !== "Under") continue;
    const point = parseFloat(pointStr);
    if (isNaN(point)) continue;
    if (!byPoint[pointStr]) byPoint[pointStr] = [];
    byPoint[pointStr].push({ side: side as "Over" | "Under", odds: bp.odds, book: bp.book, point });
  }

  for (const sides of Object.values(byPoint)) {
    const overs = sides.filter(s => s.side === "Over");
    const unders = sides.filter(s => s.side === "Under");
    for (const ov of overs) {
      for (const un of unders) {
        if (ov.book === un.book) continue;
        const m = margin2(ov.odds, un.odds);
        if (m <= 0) continue;
        const { sA, sB } = split2(ov.odds, un.odds);
        arbs.push({
          event: `${event.home_team} vs ${event.away_team}`,
          sport_key: event.sport_key,
          market_group: marketKey,
          commence_time: event.commence_time,
          legs: 2, margin: r2(m),
          est_profit: profit2(sA, sB, ov.odds, un.odds),
          total_stake: TOTAL_STAKE,
          leg1_name: `Over ${ov.point}`, leg1_book: ov.book, leg1_odds: ov.odds, leg1_stake: sA, leg1_point: String(ov.point),
          leg2_name: `Under ${un.point}`, leg2_book: un.book, leg2_odds: un.odds, leg2_stake: sB, leg2_point: String(un.point),
        });
      }
    }
  }
  return arbs;
}

// ─────────────────────────────────────────────────────────────
// Player props  (points, rebounds, assists, goals, strikeouts…)
// These come from event-level API calls with description = player name
// key format in bestByKey: "PlayerName::Over/Under::point"
// ─────────────────────────────────────────────────────────────

function playerProps(event: OddsEvent, marketKey: string): ArbRow[] {
  const arbs: ArbRow[] = [];
  const best = bestByKey(event.bookmakers, marketKey, true);

  // Group by "PlayerName::Over/Under" pairing at same point
  type PSide = { player: string; side: "Over" | "Under"; odds: number; book: string; point: number };
  const byPlayerPoint: Record<string, PSide[]> = {};

  for (const [key, bp] of Object.entries(best)) {
    // key format: "PlayerName::Over/Under::point"
    const parts = key.split("::");
    if (parts.length < 3) continue;
    const [player, side, pointStr] = parts;
    if (side !== "Over" && side !== "Under") continue;
    const point = parseFloat(pointStr);
    if (isNaN(point)) continue;
    const groupKey = `${player}::${point}`;
    if (!byPlayerPoint[groupKey]) byPlayerPoint[groupKey] = [];
    byPlayerPoint[groupKey].push({ player, side: side as "Over" | "Under", odds: bp.odds, book: bp.book, point });
  }

  for (const sides of Object.values(byPlayerPoint)) {
    const overs = sides.filter(s => s.side === "Over");
    const unders = sides.filter(s => s.side === "Under");
    for (const ov of overs) {
      for (const un of unders) {
        if (ov.book === un.book) continue;
        const m = margin2(ov.odds, un.odds);
        if (m <= 0) continue;
        const { sA, sB } = split2(ov.odds, un.odds);
        arbs.push({
          event: `${event.home_team} vs ${event.away_team}`,
          sport_key: event.sport_key,
          market_group: marketKey,
          commence_time: event.commence_time,
          legs: 2, margin: r2(m),
          est_profit: profit2(sA, sB, ov.odds, un.odds),
          total_stake: TOTAL_STAKE,
          leg1_name: `${ov.player} Over ${ov.point}`, leg1_book: ov.book, leg1_odds: ov.odds, leg1_stake: sA, leg1_point: String(ov.point),
          leg2_name: `${un.player} Under ${un.point}`, leg2_book: un.book, leg2_odds: un.odds, leg2_stake: sB, leg2_point: String(un.point),
        });
      }
    }
  }
  return arbs;
}

// ─────────────────────────────────────────────────────────────
// Market groups — what to scan per sport
// ─────────────────────────────────────────────────────────────

// Featured markets fetched from the bulk /odds endpoint
const FEATURED_MARKETS = ["h2h", "spreads", "totals"];

// Half-time / period markets — available for most sports
const PERIOD_MARKETS: Record<string, string[]> = {
  soccer: ["h2h_h1", "h2h_h2"],
  basketball: ["h2h_h1", "h2h_h2", "h2h_q1", "h2h_q2", "h2h_q3", "h2h_q4"],
  americanfootball: ["h2h_h1", "h2h_q1"],
  icehockey: ["h2h_p1", "h2h_p2", "h2h_p3"],
  baseball: ["h2h_1st_5_innings"],
};

function getPeriodMarkets(sportKey: string): string[] {
  for (const [prefix, markets] of Object.entries(PERIOD_MARKETS)) {
    if (sportKey.includes(prefix)) return markets;
  }
  return [];
}

// Player prop market keys per sport (used only in props scanner)
export const PROP_MARKETS: Record<string, string[]> = {
  basketball_nba: ["player_points", "player_rebounds", "player_assists", "player_threes", "player_blocks", "player_steals", "player_points_rebounds_assists"],
  basketball_ncaab: ["player_points", "player_rebounds", "player_assists"],
  americanfootball_nfl: ["player_pass_yds", "player_rush_yds", "player_reception_yds", "player_receptions", "player_pass_tds", "player_anytime_td"],
  baseball_mlb: ["batter_home_runs", "batter_hits", "batter_total_bases", "pitcher_strikeouts", "pitcher_outs"],
  icehockey_nhl: ["player_points", "player_goals", "player_assists", "player_shots_on_goal"],
  soccer_epl: ["player_goal_scorer_anytime", "player_shots_on_target", "player_assists"],
  soccer_uefa_champs_league: ["player_goal_scorer_anytime", "player_shots_on_target"],
};

// ─────────────────────────────────────────────────────────────
// Main export — processes featured + period markets
// Props are handled separately in propsScanner.ts (per-event)
// ─────────────────────────────────────────────────────────────

export function extractArbs(events: OddsEvent[]): ArbRow[] {
  const arbs: ArbRow[] = [];

  for (const event of events) {
    const startsIn = new Date(event.commence_time).getTime() - Date.now();
    if (startsIn < 5 * 60 * 1000) continue;
    if (!event.bookmakers || event.bookmakers.length < 2) continue;

    // ── Featured markets ──
    for (const mkt of FEATURED_MARKETS) {
      // h2h: try 2-way first, then 3-way
      if (mkt === "h2h") {
        const a2 = h2h2(event, mkt);
        if (a2) arbs.push(a2);
        else {
          const a3 = h2h3(event, mkt);
          if (a3) arbs.push(a3);
        }
      } else if (mkt === "spreads" || mkt === "alternate_spreads") {
        arbs.push(...spreads(event, mkt));
      } else if (mkt === "totals" || mkt === "alternate_totals") {
        arbs.push(...totals(event, mkt));
      }
    }

    // ── Period / half-time markets ──
    for (const mkt of getPeriodMarkets(event.sport_key)) {
      const a2 = h2h2(event, mkt);
      if (a2) arbs.push(a2);
      else {
        const a3 = h2h3(event, mkt);
        if (a3) arbs.push(a3);
      }
    }
  }

  // Dedup
  const seen = new Set<string>();
  return arbs
    .filter(a => {
      const k = `${a.event}|${a.market_group}|${a.leg1_book}|${a.leg2_book}|${a.leg1_point ?? ""}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((a, b) => b.margin - a.margin);
}

// Also export the individual scanners for use by propsScanner
export { playerProps, totals, spreads };