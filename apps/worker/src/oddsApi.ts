const ODDS_API_KEY = process.env.ODDS_API_KEY!;
const REGIONS = process.env.ODDS_REGIONS ?? "uk";
const MARKETS = process.env.ODDS_MARKETS ?? "h2h";

export type OddsOutcome = {
  name: string;
  price: number;
  point?: number;
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

export async function fetchOdds(sportKey: string): Promise<OddsEvent[]> {
  const url =
    `https://api.the-odds-api.com/v4/sports/${sportKey}/odds` +
    `?apiKey=${ODDS_API_KEY}` +
    `&regions=${REGIONS}` +
    `&markets=${MARKETS}` +
    `&oddsFormat=decimal`;

  const res = await fetch(url);
  return res.json();
}