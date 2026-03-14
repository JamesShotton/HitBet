/**
 * telegram.ts
 *
 * Posts new high-value arbs to a Telegram channel.
 * Users join the channel (read-only) to receive alerts.
 *
 * Setup:
 * 1. Create a Telegram bot via @BotFather → get TELEGRAM_BOT_TOKEN
 * 2. Create a Telegram channel → add the bot as admin with "Post Messages" permission
 * 3. Get the channel ID: forward a message from the channel to @userinfobot
 *    Channel IDs look like -1001234567890
 * 4. Set env vars in Railway:
 *    TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
 *    TELEGRAM_CHANNEL_ID=-1001234567890
 *    TELEGRAM_MIN_MARGIN=0.02   (only alert on 2%+ arbs, default)
 *    TELEGRAM_ENABLED=true
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
const MIN_MARGIN = Number(process.env.TELEGRAM_MIN_MARGIN ?? 0.02);
const ENABLED = process.env.TELEGRAM_ENABLED === "true";
const TOTAL_STAKE = Number(process.env.TOTAL_STAKE ?? 50);

type ArbAlert = {
  event: string;
  sport_key: string;
  market_group: string;
  commence_time: string;
  legs: number;
  margin: number;
  est_profit: number;
  leg1_name: string;
  leg1_book: string;
  leg1_odds: number;
  leg1_stake: number;
  leg1_point?: string | null;
  leg2_name: string;
  leg2_book: string;
  leg2_odds: number;
  leg2_stake: number;
  leg2_point?: string | null;
  leg3_name?: string | null;
  leg3_book?: string | null;
  leg3_odds?: number | null;
  leg3_stake?: number | null;
};

function fmt(v: number) {
  return `£${v.toFixed(2)}`;
}
function pct(v: number) {
  return `${(v * 100).toFixed(2)}%`;
}

function sportEmoji(sport: string) {
  const s = sport.toLowerCase();
  if (s.includes("soccer")) return "⚽";
  if (s.includes("basket") || s.includes("nba")) return "🏀";
  if (s.includes("tennis")) return "🎾";
  if (s.includes("hockey") || s.includes("nhl")) return "🏒";
  if (s.includes("nfl") || s.includes("american")) return "🏈";
  if (s.includes("baseball") || s.includes("mlb")) return "⚾";
  if (s.includes("mma")) return "🥊";
  return "🎯";
}

function marketLabel(mg: string) {
  const map: Record<string, string> = {
    h2h: "Moneyline",
    h2h_3way: "1X2",
    spreads: "Spread",
    alternate_spreads: "Alt Spread",
    totals: "Total",
    alternate_totals: "Alt Total",
    h2h_h1: "1st Half",
    h2h_h2: "2nd Half",
  };
  return map[mg] ?? mg;
}

function timeUntil(v: string) {
  const diff = new Date(v).getTime() - Date.now();
  if (diff < 0) return "In play";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `in ${mins}m`;
  return `in ${Math.floor(mins / 60)}h`;
}

function formatArb(arb: ArbAlert): string {
  const emoji = sportEmoji(arb.sport_key);
  const margin = pct(arb.margin);
  const profit = fmt(arb.est_profit);
  const starts = timeUntil(arb.commence_time);
  const is3way = arb.legs === 3;

  const lines: string[] = [
    `${emoji} *${arb.event}*`,
    `📈 *${margin} margin* — ${profit} profit @ ${fmt(TOTAL_STAKE)} stake`,
    `🏷 ${marketLabel(arb.market_group)}${is3way ? " · 3-way" : ""} · ${starts}`,
    ``,
    `*Leg 1 — ${arb.leg1_book}*`,
    `Back: ${arb.leg1_name}${
      arb.leg1_point ? ` (${arb.leg1_point})` : ""
    } @ ${Number(arb.leg1_odds).toFixed(2)}`,
    `Stake: ${fmt(arb.leg1_stake)}`,
    ``,
    `*Leg 2 — ${arb.leg2_book}*`,
    `Back: ${arb.leg2_name}${
      arb.leg2_point ? ` (${arb.leg2_point})` : ""
    } @ ${Number(arb.leg2_odds).toFixed(2)}`,
    `Stake: ${fmt(arb.leg2_stake)}`,
  ];

  if (is3way && arb.leg3_book) {
    lines.push(
      ``,
      `*Leg 3 — ${arb.leg3_book}*`,
      `Back: ${arb.leg3_name} @ ${Number(arb.leg3_odds).toFixed(2)}`,
      `Stake: ${fmt(arb.leg3_stake ?? 0)}`
    );
  }

  lines.push(
    ``,
    `_Place leg 1 first, wait 20-30s, then leg 2${
      is3way ? ", then leg 3" : ""
    }_`
  );
  lines.push(`[Open dashboard](https://hitbet.to/dashboard)`);

  return lines.join("\n");
}

async function sendToChannel(text: string): Promise<boolean> {
  if (!BOT_TOKEN || !CHANNEL_ID) {
    console.warn("[telegram] BOT_TOKEN or CHANNEL_ID not set — skipping");
    return false;
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHANNEL_ID,
          text,
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error(`[telegram] send failed: ${err}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[telegram] fetch error:", err);
    return false;
  }
}

// Track which arbs we've already alerted on to avoid spam
const alreadyAlerted = new Set<string>();

function arbKey(arb: ArbAlert) {
  return `${arb.event}|${arb.market_group}|${arb.leg1_book}|${arb.leg2_book}`;
}

export async function sendArbAlerts(arbs: ArbAlert[]): Promise<void> {
  if (!ENABLED) return;
  if (!BOT_TOKEN || !CHANNEL_ID) {
    console.warn(
      "[telegram] disabled — set TELEGRAM_ENABLED=true, TELEGRAM_BOT_TOKEN, TELEGRAM_CHANNEL_ID"
    );
    return;
  }

  // Filter to new arbs above threshold
  const toAlert = arbs.filter((a) => {
    if (Number(a.margin) < MIN_MARGIN) return false;
    const key = arbKey(a);
    if (alreadyAlerted.has(key)) return false;
    return true;
  });

  if (toAlert.length === 0) return;

  // Sort by margin desc, take top 5 per cycle to avoid spam
  const top = toAlert.sort((a, b) => b.margin - a.margin).slice(0, 5);

  console.log(
    `[telegram] sending ${top.length} new arb alert${
      top.length !== 1 ? "s" : ""
    }`
  );

  for (const arb of top) {
    const sent = await sendToChannel(formatArb(arb));
    if (sent) {
      alreadyAlerted.add(arbKey(arb));
      // Small delay between messages to avoid Telegram rate limiting
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  // Clear old alerts after 2 hours to allow re-alerting if arb reappears
  if (alreadyAlerted.size > 1000) {
    alreadyAlerted.clear();
  }
}

export async function sendCycleDigest(
  arbCount: number,
  bestMargin: number
): Promise<void> {
  if (!ENABLED || arbCount === 0) return;
  // Only send digest if there are significant arbs — avoid noise
  if (bestMargin < 0.05) return;

  const text = [
    `🔔 *${arbCount} live arbs* — best margin ${pct(bestMargin)}`,
    `[View all on dashboard](https://hitbet.to/dashboard)`,
  ].join("\n");

  await sendToChannel(text);
}
