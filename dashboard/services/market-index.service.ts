import { supabase } from "@/lib/supabase/client";

export type MarketIndex = {
  index_id: number;
  session_date: string;
  name: string;
  previous_close: number;
  close_price: number;
  variation_percent: number;
  year_variation_percent: number;
  category: string;
  created_at: string;
};

export type MarketIndexHistoryPoint = {
  session_date: string;
  close_price: number;
  variation_percent: number;
};

export async function getLatestMarketIndices() {
  const { data, error } = await supabase
    .from("market_indices")
    .select("*")
    .order("session_date", { ascending: false })
    .limit(12);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as MarketIndex[];
}

export async function getCompositeHistory() {
  const { data, error } = await supabase
    .from("market_indices")
    .select("session_date, close_price, variation_percent")
    .eq("name", "BRVM - COMPOSITE")
    .order("session_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    session_date: row.session_date,
    close_price: Number(row.close_price),
    variation_percent: Number(row.variation_percent),
  })) as MarketIndexHistoryPoint[];
}