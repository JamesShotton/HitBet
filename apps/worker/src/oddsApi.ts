export async function fetchSports(): Promise<Array<{ key: string; active: boolean }>> {
    const url = new URL("https://api.the-odds-api.com/v4/sports");
    url.searchParams.set("apiKey", process.env.ODDS_API_KEY!);
  
    const r = await fetch(url);
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  }
  
  export async function fetchOdds(sportKey: string) {
    const url = new URL(`https://api.the-odds-api.com/v4/sports/${sportKey}/odds`);
    url.searchParams.set("apiKey", process.env.ODDS_API_KEY!);
    url.searchParams.set("regions", process.env.ODDS_REGIONS ?? "uk");
    url.searchParams.set("markets", process.env.ODDS_MARKETS ?? "h2h");
    url.searchParams.set("oddsFormat", "decimal");
  
    const r = await fetch(url);
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  }