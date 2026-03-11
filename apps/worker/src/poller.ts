import { fetchSports, fetchOdds } from "./oddsApi.js";
import { extractArbs } from "./arbEngine.js";
import { replaceArbs } from "./db.js";

const POLL_INTERVAL = Number(process.env.POLL_INTERVAL_SECONDS ?? 60);
const MAX_SPORTS = Number(process.env.MAX_SPORTS_TO_SCAN ?? 20);
const MAX_ARBS = Number(process.env.MAX_ARBS_TO_SAVE ?? 200);

export async function runCycle() {
  console.log(`[worker] cycle start ${new Date().toISOString()}`);

  try {
    const sports = await fetchSports();
    const active = (Array.isArray(sports) ? sports : [])
      .filter((s: any) => s.active && !s.has_outrights)
      .slice(0, MAX_SPORTS);

    console.log(`[worker] scanning ${active.length} sports`);

    const allArbs = [];

    for (const sport of active) {
      try {
        const events = await fetchOdds(sport.key);
        const arbs = extractArbs(Array.isArray(events) ? events : []);
        console.log(`[worker] ${sport.key}: ${arbs.length} arbs`);
        allArbs.push(...arbs);
      } catch (err) {
        console.error(`[worker] sport failed ${sport.key}`, err);
      }
    }

    const best = allArbs
      .sort((a, b) => b.margin - a.margin)
      .slice(0, MAX_ARBS);

    await replaceArbs(best);

    console.log(`[worker] saved ${best.length} arbs`);
  } catch (err) {
    console.error("[worker] cycle failed", err);
  }
}

export async function startPoller() {
  console.log(`[worker] poll interval ${POLL_INTERVAL}s`);

  await runCycle();

  setInterval(async () => {
    await runCycle();
  }, POLL_INTERVAL * 1000);
}