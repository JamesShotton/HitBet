import { fetchSports, fetchOdds } from "./oddsApi.js";
import { extractArbs } from "./arbEngine.js";
import { replaceArbs, replaceValueBets } from "./db.js";
import { startPropsScanner } from "./propsScanner.js";
import { sendArbAlerts } from "./telegram.js";
import { findValueBets } from "./valueEngine.js";

// ─── Config ───────────────────────────────────────────────────
// Target: ~5m credits/month = ~6,944/hour = ~115/minute = ~2/second
// At 1 credit per sport request:
//   Tier 1: 14 sports every 60s  = 14/min
//   Tier 2: 20 sports every 5min = 4/min
//   Total: ~18/min = ~26,000/day = ~800,000/month  ✓ well within 5m

const TIER1_INTERVAL = Number(process.env.TIER1_INTERVAL_SECONDS ?? 60);
const TIER2_INTERVAL = Number(process.env.TIER2_INTERVAL_SECONDS ?? 300);
const MAX_ARBS = Number(process.env.MAX_ARBS_TO_SAVE ?? 500);
const SPORTS_CACHE_TTL = 10 * 60 * 1000;

// Max consecutive failures before the process exits so the host can restart it
const MAX_CONSECUTIVE_FAILURES = 10;

// ─── Tier 1: high-liquidity, scan every 60s ───────────────────
const TIER1_SPORTS = [
  "soccer_epl",
  "soccer_uefa_champs_league",
  "soccer_uefa_europa_league",
  "soccer_spain_la_liga",
  "soccer_germany_bundesliga",
  "soccer_italy_serie_a",
  "soccer_france_ligue_one",
  "soccer_england_efl_champ",
  "basketball_nba",
  "icehockey_nhl",
  "americanfootball_nfl",
  "baseball_mlb",
  "tennis_atp_french_open",
  "tennis_atp_wimbledon",
];

// ─── Tier 2: secondary sports, scan every 5 mins ─────────────
const TIER2_SPORTS = [
  "soccer_netherlands_eredivisie",
  "soccer_portugal_primeira_liga",
  "soccer_england_league1",
  "soccer_england_league2",
  "soccer_scotland_premiership",
  "soccer_turkey_super_league",
  "basketball_euroleague",
  "basketball_ncaab",
  "icehockey_ahl",
  "americanfootball_ncaaf",
  "tennis_wta_french_open",
  "tennis_atp_us_open",
  "tennis_wta_wimbledon",
  "mma_mixed_martial_arts",
  "rugbyunion_six_nations",
  "cricket_international_t20",
  "cricket_ipl",
  // US sports — duplicate intentional: us region adds FanDuel/DK cross-market arbs
  "basketball_nba",
  "baseball_mlb",
  "icehockey_nhl",
  "americanfootball_nfl",
];

const BULK_MARKETS = ["h2h", "spreads", "totals"];

// ─── Sports cache ─────────────────────────────────────────────
let cachedActiveSports: Set<string> = new Set();
let sportsCacheTime = 0;

async function getActiveSports(): Promise<Set<string>> {
  if (Date.now() - sportsCacheTime < SPORTS_CACHE_TTL) {
    return cachedActiveSports;
  }
  try {
    const sports = await fetchSports();
    cachedActiveSports = new Set(
      (Array.isArray(sports) ? sports : [])
        .filter((s: any) => s.active && !s.has_outrights)
        .map((s: any) => s.key)
    );
    sportsCacheTime = Date.now();
    console.log(
      `[worker] sports cache refreshed — ${cachedActiveSports.size} active sports`
    );
  } catch (err) {
    console.error("[worker] failed to refresh sports cache", err);
  }
  return cachedActiveSports;
}

// ─── Scan a list of sports ────────────────────────────────────
async function scanSports(
  keys: string[]
): Promise<{ arbs: any[]; events: any[] }> {
  const activeSports = await getActiveSports();
  const toScan = keys.filter((k) => activeSports.has(k));

  if (toScan.length === 0) return { arbs: [], events: [] };

  const allArbs: any[] = [];
  const allEvents: any[] = [];

  for (const key of toScan) {
    try {
      const events = await fetchOdds(key, BULK_MARKETS.join(","));
      const eventsArr = Array.isArray(events) ? events : [];
      allEvents.push(...eventsArr);
      const arbs = extractArbs(eventsArr);
      if (arbs.length > 0) {
        console.log(`[worker] ${key}: ${arbs.length} arbs`);
      }
      allArbs.push(...arbs);
    } catch (err) {
      console.error(`[worker] sport failed ${key}`, err);
    }
  }

  return { arbs: allArbs, events: allEvents };
}

// ─── Arb store — merge tier results ──────────────────────────
const arbStore: Map<string, any[]> = new Map();

function mergeAndSave(sportKey: string, arbs: any[]) {
  arbStore.set(sportKey, arbs);
}

async function flushToDb() {
  const all: any[] = [];
  for (const arbs of arbStore.values()) {
    all.push(...arbs);
  }
  const best = all.sort((a, b) => b.margin - a.margin).slice(0, MAX_ARBS);
  await replaceArbs(best);
  return best.length;
}

// ─── Failure tracking ─────────────────────────────────────────
let tier1Failures = 0;
let tier2Failures = 0;

// ─── Tier 1 cycle — runs every 60s ───────────────────────────
async function tier1Cycle() {
  const start = Date.now();
  try {
    const { arbs, events: allEvents } = await scanSports(TIER1_SPORTS);

    const bySport: Map<string, any[]> = new Map();
    for (const arb of arbs) {
      if (!bySport.has(arb.sport_key)) bySport.set(arb.sport_key, []);
      bySport.get(arb.sport_key)!.push(arb);
    }
    for (const [sport, sportArbs] of bySport) {
      mergeAndSave(sport, sportArbs);
    }

    const saved = await flushToDb();
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`[tier1] done in ${elapsed}s — ${saved} arbs saved`);

    await sendArbAlerts(arbs);

    const valueBets = findValueBets(allEvents);
    if (valueBets.length > 0) {
      await replaceValueBets(valueBets);
      console.log(`[tier1] saved ${valueBets.length} value bets`);
    }

    tier1Failures = 0;
  } catch (err) {
    tier1Failures++;
    console.error(`[tier1] cycle failed (${tier1Failures}/${MAX_CONSECUTIVE_FAILURES})`, err);
    if (tier1Failures >= MAX_CONSECUTIVE_FAILURES) {
      console.error("[tier1] too many consecutive failures — exiting for restart");
      process.exit(1);
    }
  }
}

// ─── Tier 2 cycle — runs every 5 mins ────────────────────────
async function tier2Cycle() {
  const start = Date.now();
  try {
    const { arbs } = await scanSports(TIER2_SPORTS);

    const bySport: Map<string, any[]> = new Map();
    for (const arb of arbs) {
      if (!bySport.has(arb.sport_key)) bySport.set(arb.sport_key, []);
      bySport.get(arb.sport_key)!.push(arb);
    }
    for (const [sport, sportArbs] of bySport) {
      mergeAndSave(sport, sportArbs);
    }

    const saved = await flushToDb();
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`[tier2] done in ${elapsed}s — ${saved} arbs saved`);

    tier2Failures = 0;
  } catch (err) {
    tier2Failures++;
    console.error(`[tier2] cycle failed (${tier2Failures}/${MAX_CONSECUTIVE_FAILURES})`, err);
    if (tier2Failures >= MAX_CONSECUTIVE_FAILURES) {
      console.error("[tier2] too many consecutive failures — exiting for restart");
      process.exit(1);
    }
  }
}

// ─── Entry point ─────────────────────────────────────────────
export async function startPoller() {
  console.log(
    `[worker] starting — tier1 every ${TIER1_INTERVAL}s, tier2 every ${TIER2_INTERVAL}s`
  );
  console.log(`[worker] markets: ${BULK_MARKETS.join(", ")}`);
  console.log(
    `[worker] estimated credit usage: ~${Math.round(
      (TIER1_SPORTS.length / TIER1_INTERVAL +
        TIER2_SPORTS.length / TIER2_INTERVAL) *
        60
    )}/min`
  );

  // Initial run — both tiers
  await tier1Cycle();
  await tier2Cycle();

  setInterval(tier1Cycle, TIER1_INTERVAL * 1000);
  setInterval(tier2Cycle, TIER2_INTERVAL * 1000);

  startPropsScanner();
}
