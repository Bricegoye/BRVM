import { supabase } from "@/lib/supabase/client";

export type IndexHistoryPoint = {
  session_date: string;
  close_price: number;
  variation_percent: number;
};

export type IndexHistorySeries = {
  name: string;
  points: IndexHistoryPoint[];
};

const MAIN_INDICES = [
  "BRVM - COMPOSITE",
  "BRVM-30",
  "BRVM - PRESTIGE",
  "BRVM - PRINCIPAL",
];

export async function getMainIndicesHistory(): Promise<
  IndexHistorySeries[]
> {
  const { data, error } = await supabase
    .from("market_indices")
    .select(
      "session_date, name, close_price, variation_percent"
    )
    .in("name", MAIN_INDICES)
    .order("session_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const grouped = new Map<
    string,
    IndexHistoryPoint[]
  >();

  for (const row of data ?? []) {
    const current =
      grouped.get(row.name) ?? [];

    current.push({
      session_date: row.session_date,
      close_price: Number(row.close_price),
      variation_percent: Number(
        row.variation_percent
      ),
    });

    grouped.set(row.name, current);
  }

  return MAIN_INDICES.map((name) => ({
    name,
    points: grouped.get(name) ?? [],
  }));
}