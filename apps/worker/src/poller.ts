import { fetchSports, fetchOdds } from "./oddsApi.js";
import { extractArbs } from "./arbEngine.js";
import { replaceArbs } from "./db.js";

const POLL_INTERVAL = Number(process.env.POLL_INTERVAL_SECONDS ?? 60);
const MAX_SPORTS = Number(process.env.MAX_SPORTS_TO_SCAN ?? 20);
const MAX_ARBS = Number(process.env.MAX_ARBS_TO_SAVE ?? 200);

export async function runCycle() {
  console.log("Scanning odds...");

  const sports = await fetchSports();

  const active = sports
    .filter((s: any) => s.active && !s.has_outrights)
    .slice(0, MAX_SPORTS);

  const allArbs = [];

  for (const sport of active) {
    try {
      const events = await fetchOdds(sport.key);
      const arbs = extractArbs(events);

      console.log(`${sport.key}: ${arbs.length} arbs`);

      allArbs.push(...arbs);
    } catch (err) {
      console.error("Sport failed", sport.key);
    }
  }

  const best = allArbs
    .sort((a, b) => b.margin - a.margin)
    .slice(0, MAX_ARBS);

  await replaceArbs(best);

  console.log(`Saved ${best.length} arbs`);
}

export async function startPoller() {
  await runCycle();

  setInterval(runCycle, POLL_INTERVAL * 1000);
}