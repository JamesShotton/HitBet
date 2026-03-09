import type { Market } from "./types.js";

export function marketGroupId(market: Market): string {
  const key = market.key;
  const pts = market.outcomes
    .map(o => o.point)
    .filter(p => p !== undefined && p !== null) as number[];

  if ((key === "totals" || key === "spreads") && pts.length > 0) {
    return `${key}|${pts[0]}`;
  }
  return key;
}