import { supabase } from "@/lib/supabase/client";

export type MarketRanking = {
  session_date: string;
  ranking_type: "TOP5" | "FLOP5";
  symbol: string;
  close_price: number;
  variation_percent: number;
};

export async function getLatestMarketRankings() {
  const { data: latestDateRow, error: latestDateError } = await supabase
    .from("market_rankings")
    .select("session_date")
    .order("session_date", { ascending: false })
    .limit(1)
    .single();

  if (latestDateError) {
    throw new Error(latestDateError.message);
  }

  if (!latestDateRow) {
    return {
      sessionDate: null,
      top5: [],
      flop5: [],
    };
  }

  const sessionDate = latestDateRow.session_date;

  const { data, error } = await supabase
    .from("market_rankings")
    .select(
      "session_date, ranking_type, symbol, close_price, variation_percent"
    )
    .eq("session_date", sessionDate);

  if (error) {
    throw new Error(error.message);
  }

  const rankings = (data ?? []).map((row) => ({
    session_date: row.session_date,
    ranking_type: row.ranking_type,
    symbol: row.symbol,
    close_price: Number(row.close_price),
    variation_percent: Number(row.variation_percent),
  })) as MarketRanking[];

  const top5 = rankings
    .filter((item) => item.ranking_type === "TOP5")
    .sort((a, b) => b.variation_percent - a.variation_percent);

  const flop5 = rankings
    .filter((item) => item.ranking_type === "FLOP5")
    .sort((a, b) => a.variation_percent - b.variation_percent);

  return {
    sessionDate,
    top5,
    flop5,
  };
}