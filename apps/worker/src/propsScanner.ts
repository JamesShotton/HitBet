/**
 * propsScanner.ts
 *
 * Player props require the /events/{eventId}/odds endpoint — called one event
 * at a time. This scanner runs less frequently than the main poller to conserve
 * API credits. Configure via env vars:
 *
 *   PROPS_SCAN_INTERVAL_SECONDS  — how often to run (default: 300 = 5 mins)
 *   PROPS_MAX_EVENTS_PER_SPORT   — max events to scan per sport (default: 5)
 *   PROPS_ENABLED                — set to "false" to disable (default: true)
 */

import { pool } from "./db.js";
import { PROP_MARKETS } from "./arbEngine.js";
import { playerProps } from "./arbEngine.js";
import { OddsEvent } from "./oddsApi.js";

const ODDS_API_KEY = process.env.ODDS_API_KEY!;
const REGIONS = process.env.ODDS_REGIONS ?? "uk,eu";
const PROPS_INTERVAL = Number(process.env.PROPS_SCAN_INTERVAL_SECONDS ?? 300);
const MAX_EVENTS = Number(process.env.PROPS_MAX_EVENTS_PER_SPORT ?? 5);
const ENABLED = process.env.PROPS_ENABLED !== "false";

async function fetchEventIds(sportKey: string): Promise<string[]> {
  const url = `https://api.the-odds-api.com/v4/sports/${sportKey}/events?apiKey=${ODDS_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const events: any[] = await res.json();
  return (Array.isArray(events) ? events : [])
    .filter((e) => {
      const startsIn = new Date(e.commence_time).getTime() - Date.now();
      return startsIn > 5 * 60 * 1000; // skip events starting in < 5 mins
    })
    .slice(0, MAX_EVENTS)
    .map((e) => e.id);
}

async function fetchEventProps(
  sportKey: string,
  eventId: string,
  markets: string[]
): Promise<OddsEvent | null> {
  const marketStr = markets.join(",");
  const url =
    `https://api.the-odds-api.com/v4/sports/${sportKey}/events/${eventId}/odds` +
    `?apiKey=${ODDS_API_KEY}&regions=${REGIONS}&markets=${marketStr}&oddsFormat=decimal`;

  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

async function savePropArbs(arbs: any[]) {
  if (arbs.length === 0) return;

  // Delete existing prop arbs (identified by market_group containing "player_")
  await pool.query(`delete from arbs where market_group like 'player_%'`);

  for (const arb of arbs) {
    await pool.query(
      `insert into arbs (
        event, sport_key, market_group, commence_time,
        legs, margin, est_profit, total_stake,
        leg1_name, leg1_book, leg1_odds, leg1_stake, leg1_point,
        leg2_name, leg2_book, leg2_odds, leg2_stake, leg2_point,
        created_at
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,now())`,
      [
        arb.event,
        arb.sport_key,
        arb.market_group,
        arb.commence_time,
        arb.legs,
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
      ]
    );
  }

  console.log(`[props] saved ${arbs.length} prop arbs`);
}

export async function runPropsScanner() {
  if (!ENABLED) return;

  console.log(`[props] scan start ${new Date().toISOString()}`);
  const allArbs: any[] = [];

  for (const [sportKey, markets] of Object.entries(PROP_MARKETS)) {
    try {
      const eventIds = await fetchEventIds(sportKey);
      console.log(
        `[props] ${sportKey}: scanning ${eventIds.length} events for ${markets.length} prop markets`
      );

      for (const eventId of eventIds) {
        try {
          const event = await fetchEventProps(sportKey, eventId, markets);
          if (!event || !event.bookmakers) continue;

          for (const market of markets) {
            const arbs = playerProps(event, market);
            if (arbs.length > 0) {
              console.log(
                `[props] ${sportKey}/${eventId}/${market}: ${arbs.length} arbs`
              );
              allArbs.push(...arbs);
            }
          }

          // Small delay between event calls to avoid rate limiting
          await new Promise((r) => setTimeout(r, 200));
        } catch (err) {
          console.error(`[props] event failed ${sportKey}/${eventId}`, err);
        }
      }
    } catch (err) {
      console.error(`[props] sport failed ${sportKey}`, err);
    }
  }

  await savePropArbs(allArbs.sort((a, b) => b.margin - a.margin));
  console.log(`[props] scan complete — ${allArbs.length} prop arbs total`);
}

export function startPropsScanner() {
  if (!ENABLED) {
    console.log("[props] disabled — set PROPS_ENABLED=true to enable");
    return;
  }

  console.log(
    `[props] starting — interval ${PROPS_INTERVAL}s, max ${MAX_EVENTS} events/sport`
  );
  runPropsScanner();
  setInterval(runPropsScanner, PROPS_INTERVAL * 1000);
}
