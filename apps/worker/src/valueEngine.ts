import { OddsEvent } from "./oddsApi.js";

const TOTAL_STAKE = Number(process.env.TOTAL_STAKE ?? 50);
const MIN_EV = Number(process.env.VALUE_MIN_EV ?? 0.05); // 5% minimum edge

// Sharp books used as baseline — these represent true market price
const SHARP_BOOKS = new Set([
  "Betfair Exchange",
  "Betfair",
  "Smarkets",
  "Matchbook",
  "Betdaq",
  "Pinnacle",
]);

// Soft books — these are the ones that lag sharp money
const SOFT_BOOKS = new Set([
  "Bet365",
  "William Hill",
  "Coral",
  "Ladbrokes",
  "Paddy Power",
  "Sky Bet",
  "Betway",
  "Unibet (UK)",
  "888sport",
  "BetVictor",
  "BoyleSports",
  "Betfred",
  "Casumo",
  "LeoVegas",
  "Mr Green",
  "Virgin Bet",
  "Grosvenor",
  "BetUK",
  "QuinnBet",
  "Midnite",
  "Unibet",
]);

export type ValueBet = {
  event: string;
  sport_key: string;
  market_group: string;
  commence_time: string;

  // The value bet
  selection: string;
  soft_book: string;
  soft_odds: number;
  point: string | null;

  // The sharp baseline
  sharp_book: string;
  sharp_odds: number;

  // Edge metrics
  ev_pct: number; // e.g. 0.12 = 12% edge
  true_prob: number; // implied probability from sharp book
  soft_implied_prob: number; // implied probability from soft book
  kelly_stake: number; // Kelly criterion stake suggestion
  expected_profit: number; // EV in £ at recommended stake
};

function kelly(prob: number, odds: number, bankroll: number): number {
  // Full Kelly: f = (bp - q) / b where b = decimal odds - 1, p = true prob, q = 1 - p
  const b = odds - 1;
  const q = 1 - prob;
  const f = (b * prob - q) / b;
  // Use quarter Kelly for safety
  const quarterKelly = Math.max(0, f * 0.25);
  return Math.round(bankroll * quarterKelly * 100) / 100;
}

export function findValueBets(events: OddsEvent[]): ValueBet[] {
  const bets: ValueBet[] = [];

  for (const event of events) {
    const startsIn = new Date(event.commence_time).getTime() - Date.now();
    if (startsIn < 5 * 60 * 1000) continue;
    if (!event.bookmakers || event.bookmakers.length < 2) continue;

    // Process h2h and totals markets
    for (const marketKey of ["h2h", "totals", "spreads"]) {
      // Build best sharp price and best soft price per outcome
      const sharpBest: Record<string, { odds: number; book: string }> = {};
      const softBest: Record<string, { odds: number; book: string }> = {};

      for (const book of event.bookmakers) {
        const market = book.markets.find((m) => m.key === marketKey);
        if (!market) continue;

        const isSharp = SHARP_BOOKS.has(book.title);
        const isSoft = SOFT_BOOKS.has(book.title);
        if (!isSharp && !isSoft) continue;

        for (const outcome of market.outcomes) {
          if (!outcome?.name || typeof outcome.price !== "number") continue;
          if (outcome.price <= 1.01) continue;

          const key =
            outcome.point != null
              ? `${outcome.name}::${outcome.point}`
              : outcome.name;

          if (isSharp) {
            if (!sharpBest[key] || outcome.price > sharpBest[key].odds) {
              sharpBest[key] = { odds: outcome.price, book: book.title };
            }
          }
          if (isSoft) {
            if (!softBest[key] || outcome.price > softBest[key].odds) {
              softBest[key] = { odds: outcome.price, book: book.title };
            }
          }
        }
      }

      // Find outcomes where soft book is significantly above sharp
      for (const [key, soft] of Object.entries(softBest)) {
        const sharp = sharpBest[key];
        if (!sharp) continue;
        if (soft.book === sharp.book) continue;

        // True probability from sharp book (with small vig adjustment)
        const trueProb = 1 / sharp.odds;
        const softImpliedProb = 1 / soft.odds;

        // EV = (true_prob * soft_odds) - 1
        const ev = trueProb * soft.odds - 1;
        if (ev < MIN_EV) continue;

        // Parse selection name and point
        const parts = key.split("::");
        const selectionName = parts[0];
        const point = parts[1] ?? null;

        const bankroll = TOTAL_STAKE * 20; // assume 20x stake as bankroll
        const kellySuggestion = kelly(trueProb, soft.odds, bankroll);
        const expectedProfit = kellySuggestion * ev;

        bets.push({
          event: `${event.home_team} vs ${event.away_team}`,
          sport_key: event.sport_key,
          market_group: marketKey,
          commence_time: event.commence_time,
          selection: selectionName,
          soft_book: soft.book,
          soft_odds: soft.odds,
          point,
          sharp_book: sharp.book,
          sharp_odds: sharp.odds,
          ev_pct: Math.round(ev * 10000) / 100,
          true_prob: Math.round(trueProb * 10000) / 100,
          soft_implied_prob: Math.round(softImpliedProb * 10000) / 100,
          kelly_stake: kellySuggestion,
          expected_profit: Math.round(expectedProfit * 100) / 100,
        });
      }
    }
  }

  return bets.sort((a, b) => b.ev_pct - a.ev_pct);
}
