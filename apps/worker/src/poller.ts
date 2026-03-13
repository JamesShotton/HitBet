import { fetchSports, fetchOdds } from "./oddsApi.js";
import { extractArbs } from "./arbEngine.js";
import { replaceArbs } from "./db.js";
import { startPropsScanner } from "./propsScanner.js";

const POLL_INTERVAL = Number(process.env.POLL_INTERVAL_SECONDS ?? 30);
const MAX_SPORTS = Number(process.env.MAX_SPORTS_TO_SCAN ?? 40);
const MAX_ARBS = Number(process.env.MAX_ARBS_TO_SAVE ?? 500);

// Only these three are guaranteed to work on the bulk /odds endpoint
// alternate_spreads, alternate_totals, h2h_h1 etc cause 422 on most sports
const BULK_MARKETS = ["h2h", "spreads", "totals"];

// High-liquidity sports scanned first — most books = most arb gaps
const PRIORITY_SPORTS = [
  "soccer_epl",
  "soccer_uefa_champs_league",
  "soccer_uefa_europa_league",
  "soccer_spain_la_liga",
  "soccer_germany_bundesliga",
  "soccer_italy_serie_a",
  "soccer_france_ligue_one",
  "soccer_netherlands_eredivisie",
  "soccer_portugal_primeira_liga",
  "soccer_england_league1",
  "soccer_england_league2",
  "soccer_england_efl_champ",
  "soccer_scotland_premiership",
  "basketball_nba",
  "basketball_euroleague",
  "icehockey_nhl",
  "americanfootball_nfl",
  "baseball_mlb",
  "tennis_atp_french_open",
  "tennis_wta_french_open",
  "tennis_atp_wimbledon",
  "tennis_wta_wimbledon",
  "tennis_atp_us_open",
  "tennis_atp_double",
];

export async function runCycle() {
  console.log(`[worker] cycle start ${new Date().toISOString()}`);

  try {
    const sports = await fetchSports();
    const active: any[] = (Array.isArray(sports) ? sports : []).filter(
      (s: any) => s.active && !s.has_outrights
    );

    const activeKeys = new Set(active.map((s: any) => s.key));
    const prioritised = PRIORITY_SPORTS.filter((k) => activeKeys.has(k));
    const rest = active
      .filter((s: any) => !new Set(prioritised).has(s.key))
      .map((s: any) => s.key);
    const toScan = [...prioritised, ...rest].slice(0, MAX_SPORTS);

    console.log(
      `[worker] scanning ${toScan.length} sports (${prioritised.length} priority)`
    );

    const allArbs: any[] = [];

    for (const key of toScan) {
      try {
        // Request all bulk-compatible markets in one API call
        const events = await fetchOdds(key, BULK_MARKETS.join(","));
        const arbs = extractArbs(Array.isArray(events) ? events : []);
        if (arbs.length > 0) {
          console.log(`[worker] ${key}: ${arbs.length} arbs`);
        }
        allArbs.push(...arbs);
      } catch (err) {
        console.error(`[worker] sport failed ${key}`, err);
      }
    }

    const best = allArbs.sort((a, b) => b.margin - a.margin).slice(0, MAX_ARBS);

    await replaceArbs(best);
    console.log(
      `[worker] saved ${best.length} arbs (${allArbs.length} total found)`
    );
  } catch (err) {
    console.error("[worker] cycle failed", err);
  }
}

export async function startPoller() {
  console.log(
    `[worker] poll interval ${POLL_INTERVAL}s, markets: ${BULK_MARKETS.join(
      ", "
    )}`
  );

  // Start main poller
  await runCycle();
  setInterval(runCycle, POLL_INTERVAL * 1000);

  // Start props scanner on its own slower cadence
  startPropsScanner();
}
