import type { ArbOpportunity, Event } from "./types.js";
import { marketGroupId } from "./markets.js";

function impliedProb(odds: number) {
  return 1 / odds;
}

function stakeSplit(total: number, o1: number, o2: number) {
  const p1 = impliedProb(o1);
  const p2 = impliedProb(o2);
  const s = p1 + p2;
  return [total * (p1 / s), total * (p2 / s)] as const;
}

/**
 * Finds 2-outcome arbs across h2h/totals/spreads for each event.
 * Skips in-play.
 * Only considers market groups with exactly 2 outcomes (after best-price aggregation).
 */
export function findArbs(
  events: Event[],
  totalStake: number
): ArbOpportunity[] {
  const opps: ArbOpportunity[] = [];

  for (const ev of events) {
    if (ev.in_play) continue;
    const home = ev.home_team;
    const away = ev.away_team;
    if (!home || !away) continue;

    const eventName = `${home} vs ${away}`;
    const bestByGroup: Record<
      string,
      Record<string, { odds: number; book: string; point?: number | null }>
    > = {};

    for (const book of ev.bookmakers ?? []) {
      for (const market of book.markets ?? []) {
        if (!["h2h", "totals", "spreads"].includes(market.key)) continue;

        const group = marketGroupId(market);
        bestByGroup[group] ??= {};

        for (const out of market.outcomes ?? []) {
          if (!out?.name || typeof out.price !== "number") continue;
          const cur = bestByGroup[group][out.name];
          if (!cur || out.price > cur.odds) {
            bestByGroup[group][out.name] = {
              odds: out.price,
              book: book.title,
              point: out.point ?? null,
            };
          }
        }
      }
    }

    for (const [group, outs] of Object.entries(bestByGroup)) {
      const names = Object.keys(outs);
      if (names.length !== 2) continue;

      const n1 = names[0],
        n2 = names[1];
      const o1 = outs[n1]!.odds,
        o2 = outs[n2]!.odds;
      const b1 = outs[n1]!.book,
        b2 = outs[n2]!.book;

      if (!b1 || !b2 || b1 === b2) continue;
      if (o1 <= 1 || o2 <= 1) continue;

      const s = impliedProb(o1) + impliedProb(o2);
      if (s >= 1) continue;

      const margin = 1 - s;
      const [st1, st2] = stakeSplit(totalStake, o1, o2);
      const ret1 = st1 * o1;
      const ret2 = st2 * o2;
      const profit = Math.min(ret1, ret2) - totalStake;

      opps.push({
        event: eventName,
        sport_key: ev.sport_key,
        commence_time: ev.commence_time,
        market_group: group,
        margin,
        total_stake: totalStake,

        leg1_name: n1,
        leg1_point: outs[n1]!.point ?? null,
        leg1_odds: o1,
        leg1_book: b1,
        leg1_stake: st1,

        leg2_name: n2,
        leg2_point: outs[n2]!.point ?? null,
        leg2_odds: o2,
        leg2_book: b2,
        leg2_stake: st2,

        est_profit: profit,
      });
    }
  }

  opps.sort((a, b) => b.margin - a.margin);
  return opps;
}
