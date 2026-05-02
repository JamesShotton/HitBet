import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const ARBS_CACHE_KEY = "arbs_v1";
export const VALUE_CACHE_KEY = "value_bets_v1";
export const ARBS_TTL = 120;
export const VALUE_TTL = 360;
