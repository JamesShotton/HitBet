import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("supabase")
    ? { rejectUnauthorized: false }
    : undefined,
});

const ODDS_API_KEY = process.env.ODDS_API_KEY!;
const REGIONS = process.env.ODDS_REGIONS || "uk";
const MARKETS = process.env.ODDS_MARKETS || "h2h";
const ODDS_FORMAT = "decimal";
const TOTAL_STAKE = Number(process.env.TOTAL_STAKE || 50);
const POLL_INTERVAL_SECONDS = Number(process.env.POLL_INTERVAL_SECONDS || 60);
const MAX_SPORTS_TO_SCAN = Number(process.env.MAX_SPORTS_TO_SCAN || 20);

if (!ODDS_API_KEY) {
  throw new Error("Missing ODDS_API_KEY in worker env");
}
if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL in worker env");
}

type Outcome = {
  name: string;
  price: number;
};

type Market = {
  key: string;
  outcomes: Outcome[];
};

type Bookmaker = {
  title: string;
  markets: Market[];
};

type EventItem = {
  id: string;
  sport_key: string;
  home_team: string;
  away_team: string;
  commence_time: string;
  bookmakers: Bookmaker[];
};

function implied(odds: number) {
  return 1 / odds;
}

function stakeSplit(totalStake: number, o1: number, o2: number) {
  const p1 = implied(o1);
  const p2 = implied(o2);
  const s = p1 + p2;
  return {
    s1: Number(((totalStake * p1) / s).toFixed(2)),
    s2: Number(((totalStake * p2) / s).toFixed(2)),
  };
}

async function fetchJson(url: string) {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  return res.json();
}

async function getSports() {
  const url = `https://api.the-odds-api.com/v4/sports?apiKey=${ODDS_API_KEY}`;
  const sports = await fetchJson(url);
  return sports
    .filter((s: any) => s.active && s.has_outrights === false)
    .slice(0, MAX_SPORTS_TO_SCAN);
}

async function getOddsForSport(sportKey: string) {
  const url =
    `https://api.the-odds-api.com/v4/sports/${sportKey}/odds` +
    `?apiKey=${ODDS_API_KEY}` +
    `&regions=${encodeURIComponent(REGIONS)}` +
    `&markets=${encodeURIComponent(MARKETS)}` +
    `&oddsFormat=${ODDS_FORMAT}`;
  return fetchJson(url);
}

function extractTwoWayArbs(events: EventItem[]) {
  const arbs: any[] = [];

  for (const event of events) {
    if (!event.home_team || !event.away_team || !Array.isArray(event.bookmakers)) continue;

    const home = event.home_team;
    const away = event.away_team;

    let bestHomeOdds = 0;
    let bestAwayOdds = 0;
    let bestHomeBook = "";
    let bestAwayBook = "";

    for (const book of event.bookmakers) {
      const h2h = book.markets?.find((m) => m.key === "h2h");
      if (!h2h || !Array.isArray(h2h.outcomes) || h2h.outcomes.length !== 2) continue;

      const homeOutcome = h2h.outcomes.find((o) => o.name === home);
      const awayOutcome = h2h.outcomes.find((o) => o.name === away);

      if (homeOutcome && homeOutcome.price > bestHomeOdds) {
        bestHomeOdds = homeOutcome.price;
        bestHomeBook = book.title;
      }

      if (awayOutcome && awayOutcome.price > bestAwayOdds) {
        bestAwayOdds = awayOutcome.price;
        bestAwayBook = book.title;
      }
    }

    if (!bestHomeOdds || !bestAwayOdds) continue;
    if (bestHomeBook === bestAwayBook) continue;

    const arbSum = implied(bestHomeOdds) + implied(bestAwayOdds);

    if (arbSum < 1) {
      const margin = 1 - arbSum;
      const { s1, s2 } = stakeSplit(TOTAL_STAKE, bestHomeOdds, bestAwayOdds);

      const return1 = s1 * bestHomeOdds;
      const return2 = s2 * bestAwayOdds;
      const guaranteedReturn = Number((Math.min(return1, return2) - TOTAL_STAKE).toFixed(2));

      arbs.push({
        event: `${home} vs ${away}`,
        sport_key: event.sport_key,
        market_group: "h2h",
        commence_time: event.commence_time,
        margin,
        est_profit: guaranteedReturn,

        leg1_name: `${home} to WIN`,
        leg1_book: bestHomeBook,
        leg1_odds: bestHomeOdds,
        leg1_stake: s1,
        leg1_point: null,

        leg2_name: `${away} to WIN`,
        leg2_book: bestAwayBook,
        leg2_odds: bestAwayOdds,
        leg2_stake: s2,
        leg2_point: null,
      });
    }
  }

  return arbs.sort((a, b) => b.margin - a.margin);
}

async function saveArbs(arbs: any[]) {
  await pool.query("delete from arbs where created_at < now() - interval '24 hours'");

  for (const arb of arbs) {
    await pool.query(
      `
      insert into arbs (
        event,
        sport_key,
        market_group,
        commence_time,
        margin,
        est_profit,
        leg1_name,
        leg1_book,
        leg1_odds,
        leg1_stake,
        leg1_point,
        leg2_name,
        leg2_book,
        leg2_odds,
        leg2_stake,
        leg2_point,
        created_at
      )
      values (
        $1,$2,$3,$4,$5,$6,
        $7,$8,$9,$10,$11,
        $12,$13,$14,$15,$16,
        now()
      )
      `,
      [
        arb.event,
        arb.sport_key,
        arb.market_group,
        arb.commence_time,
        arb.margin,
        arb.est_profit,
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
}

async function cycle() {
  try {
    console.log("[worker] scanning...");
    const sports = await getSports();

    const allArbs: any[] = [];

    for (const sport of sports) {
      try {
        const events = await getOddsForSport(sport.key);
        const arbs = extractTwoWayArbs(events);
        allArbs.push(...arbs);
      } catch (e) {
        console.error(`[worker] failed sport ${sport.key}`, e);
      }
    }

    allArbs.sort((a, b) => b.margin - a.margin);

    // keep latest top 200
    const top = allArbs.slice(0, 200);

    await pool.query("delete from arbs");
    await saveArbs(top);

    console.log(`[worker] saved ${top.length} arbs`);
  } catch (e) {
    console.error("[worker] cycle failed", e);
  }
}

async function start() {
  await cycle();
  setInterval(cycle, POLL_INTERVAL_SECONDS * 1000);
}

start();