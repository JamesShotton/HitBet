import { OddsEvent } from "./oddsApi.js";
import { ArbRow } from "./db.js";

const TOTAL_STAKE = Number(process.env.TOTAL_STAKE ?? 50);

function implied(odds: number) {
  return 1 / odds;
}

function stakeSplit(oddsA: number, oddsB: number) {
  const pA = implied(oddsA);
  const pB = implied(oddsB);

  const total = pA + pB;

  const stakeA = (TOTAL_STAKE * pA) / total;
  const stakeB = (TOTAL_STAKE * pB) / total;

  return {
    stakeA: Number(stakeA.toFixed(2)),
    stakeB: Number(stakeB.toFixed(2)),
  };
}

function profit(stakeA: number, stakeB: number, oddsA: number, oddsB: number) {
  const retA = stakeA * oddsA;
  const retB = stakeB * oddsB;

  return Number((Math.min(retA, retB) - (stakeA + stakeB)).toFixed(2));
}

export function extractArbs(events: OddsEvent[]): ArbRow[] {
  const arbs: ArbRow[] = [];

  for (const event of events) {
    const home = event.home_team;
    const away = event.away_team;

    let bestHome = 0;
    let bestAway = 0;
    let bookHome = "";
    let bookAway = "";

    for (const book of event.bookmakers) {
      const market = book.markets.find((m) => m.key === "h2h");
      if (!market) continue;

      const homeOutcome = market.outcomes.find((o) => o.name === home);
      const awayOutcome = market.outcomes.find((o) => o.name === away);

      if (homeOutcome && homeOutcome.price > bestHome) {
        bestHome = homeOutcome.price;
        bookHome = book.title;
      }

      if (awayOutcome && awayOutcome.price > bestAway) {
        bestAway = awayOutcome.price;
        bookAway = book.title;
      }
    }

    if (!bestHome || !bestAway) continue;
    if (bookHome === bookAway) continue;

    const arbSum = implied(bestHome) + implied(bestAway);

    if (arbSum < 1) {
      const margin = 1 - arbSum;

      const { stakeA, stakeB } = stakeSplit(bestHome, bestAway);

      const estProfit = profit(stakeA, stakeB, bestHome, bestAway);

      arbs.push({
        event: `${home} vs ${away}`,
        sport_key: event.sport_key,
        market_group: "h2h",
        commence_time: event.commence_time,

        margin,
        est_profit: estProfit,
        total_stake: TOTAL_STAKE,

        leg1_name: `${home} win`,
        leg1_book: bookHome,
        leg1_odds: bestHome,
        leg1_stake: stakeA,
        leg1_point: null,

        leg2_name: `${away} win`,
        leg2_book: bookAway,
        leg2_odds: bestAway,
        leg2_stake: stakeB,
        leg2_point: null,
      });
    }
  }

  return arbs.sort((a, b) => b.margin - a.margin);
}