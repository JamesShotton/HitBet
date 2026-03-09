export type OddsOutcome = {
    name: string;
    price: number;
    point?: number | null;
  };
  
  export type Market = {
    key: "h2h" | "totals" | "spreads";
    outcomes: OddsOutcome[];
  };
  
  export type Bookmaker = {
    title: string;
    markets: Market[];
  };
  
  export type Event = {
    sport_key: string;
    commence_time?: string;
    in_play?: boolean;
    home_team?: string;
    away_team?: string;
    bookmakers?: Bookmaker[];
  };
  
  export type ArbOpportunity = {
    event: string;
    sport_key: string;
    commence_time?: string;
    market_group: string; // h2h or totals|2.5 etc
    margin: number;
    total_stake: number;
  
    leg1_name: string;
    leg1_point?: number | null;
    leg1_odds: number;
    leg1_book: string;
    leg1_stake: number;
  
    leg2_name: string;
    leg2_point?: number | null;
    leg2_odds: number;
    leg2_book: string;
    leg2_stake: number;
  
    est_profit: number;
  };