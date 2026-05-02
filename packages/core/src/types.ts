// Shared types used by both apps/worker and apps/web

export type Plan = 'arbitrage' | 'longrun' | 'both';
export type SubscriptionStatus = 'inactive' | 'trialing' | 'active';

export type ArbRow = {
  id?: number;
  created_at?: string;
  expires_at?: string;

  event: string;
  sport_key: string;
  market_group: string;
  commence_time: string;
  legs: number;

  margin: number;
  est_profit: number;
  total_stake: number;

  leg1_name: string;
  leg1_book: string;
  leg1_odds: number;
  leg1_stake: number;
  leg1_point: string | null;

  leg2_name: string;
  leg2_book: string;
  leg2_odds: number;
  leg2_stake: number;
  leg2_point: string | null;

  leg3_name?: string | null;
  leg3_book?: string | null;
  leg3_odds?: number | null;
  leg3_stake?: number | null;
  leg3_point?: string | null;
};

export type ValueBetRow = {
  id?: number;
  created_at?: string;
  expires_at?: string;

  event: string;
  sport_key: string;
  market_group: string;
  commence_time: string;

  selection: string;
  soft_book: string;
  soft_odds: number;
  point: string | null;

  sharp_book: string;
  sharp_odds: number;

  ev_pct: number;
  true_prob: number;
  soft_implied_prob: number;
  kelly_stake: number;
  expected_profit: number;
};

export type Subscription = {
  user_email: string;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  status: SubscriptionStatus;
  plan: Plan | null;
  current_period_end?: string | null;
  trial_expires_at?: string | null;
  updated_at?: string;
};

// ── Legacy types kept for backwards compatibility ────────────

export type OddsOutcome = {
  name: string;
  price: number;
  point?: number | null;
};

export type Market = {
  key: 'h2h' | 'totals' | 'spreads';
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
