const ODDS_API_KEY = process.env.ODDS_API_KEY!;
const REGIONS = process.env.ODDS_REGIONS ?? "uk,eu";

export type OddsOutcome = {
  name: string;
  price: number;
  point?: number;
  description?: string; // player name for props
};

export type OddsMarket = {
  key: string;
  outcomes: OddsOutcome[];
};

export type OddsBookmaker = {
  title: string;
  markets: OddsMarket[];
};

export type OddsEvent = {
  id?: string;
  sport_key: string;
  home_team: string;
  away_team: string;
  commence_time: string;
  bookmakers: OddsBookmaker[];
};

export async function fetchSports() {
  const res = await fetch(
    `https://api.the-odds-api.com/v4/sports?apiKey=${ODDS_API_KEY}`
  );
  return res.json();
}

export async function fetchOdds(
  sportKey: string,
  markets = "h2h,spreads,totals",
  regionsOverride?: string
): Promise<OddsEvent[]> {
  const url =
    `https://api.the-odds-api.com/v4/sports/${sportKey}/odds` +
    `?apiKey=${ODDS_API_KEY}` +
    `&regions=${regionsOverride ?? REGIONS}` +
    `&markets=${markets}` +
    `&oddsFormat=decimal`;

  const res = await fetch(url);
  if (!res.ok) {
    console.error(`[oddsApi] ${sportKey} HTTP ${res.status}`);
    return [];
  }
  return res.json();
}

export async function fetchEventIds(sportKey: string): Promise<string[]> {
  const url = `https://api.the-odds-api.com/v4/sports/${sportKey}/events?apiKey=${ODDS_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const events: any[] = await res.json();
  return Array.isArray(events) ? events.map((e) => e.id) : [];
}

export async function fetchEventOdds(
  sportKey: string,
  eventId: string,
  markets: string
): Promise<OddsEvent | null> {
  const url =
    `https://api.the-odds-api.com/v4/sports/${sportKey}/events/${eventId}/odds` +
    `?apiKey=${ODDS_API_KEY}` +
    `&regions=${REGIONS}` +
    `&markets=${markets}` +
    `&oddsFormat=decimal`;

  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}
