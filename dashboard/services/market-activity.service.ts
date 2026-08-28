import { supabase } from "@/lib/supabase/client";

export type MarketActivityRow = {
  activity_id: number;
  session_date: string;
  label: string;
  value: number;
  created_at: string;
};

export type MarketActivityMetric = {
  label: string;
  value: number;
  previousValue: number | null;
  variationPercent: number | null;
};

export type MarketActivityHistoryRow = {
  sessionDate: string;
  transactionValue: number | null;
  equityMarketCap: number | null;
  bondMarketCap: number | null;
};

export async function getLatestMarketActivity() {
  const { data: latestRows, error: latestError } = await supabase
    .from("market_activity")
    .select("*")
    .order("session_date", { ascending: false })
    .limit(3);

  if (latestError) {
    throw new Error(latestError.message);
  }

  if (!latestRows || latestRows.length === 0) {
    return {
      sessionDate: null,
      metrics: [],
    };
  }

  const sessionDate = latestRows[0].session_date;

  const { data: previousRows, error: previousError } = await supabase
    .from("market_activity")
    .select("*")
    .lt("session_date", sessionDate)
    .order("session_date", { ascending: false })
    .limit(3);

  if (previousError) {
    throw new Error(previousError.message);
  }

  const metrics: MarketActivityMetric[] = latestRows.map((row) => {
    const currentValue = Number(row.value);

    const previous = previousRows?.find(
      (previousRow) => previousRow.label === row.label
    );

    const previousValue = previous
      ? Number(previous.value)
      : null;

    const variationPercent =
      previousValue && previousValue !== 0
        ? ((currentValue - previousValue) / previousValue) * 100
        : null;

    return {
      label: row.label,
      value: currentValue,
      previousValue,
      variationPercent,
    };
  });

  return {
    sessionDate,
    metrics,
  };
}

export async function getMarketActivityHistory(): Promise<
  MarketActivityHistoryRow[]
> {
  const { data, error } = await supabase
    .from("market_activity")
    .select("session_date, label, value")
    .order("session_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const grouped = new Map<
    string,
    MarketActivityHistoryRow
  >();

  for (const row of data ?? []) {
    const sessionDate = row.session_date;

    if (!grouped.has(sessionDate)) {
      grouped.set(sessionDate, {
        sessionDate,
        transactionValue: null,
        equityMarketCap: null,
        bondMarketCap: null,
      });
    }

    const current = grouped.get(sessionDate)!;
    const value = Number(row.value);

    if (row.label === "Valeur des transactions") {
      current.transactionValue = value;
    }

    if (row.label === "Capitalisation Actions") {
      current.equityMarketCap = value;
    }

    if (row.label === "Capitalisation des obligations") {
      current.bondMarketCap = value;
    }
  }

  return Array.from(grouped.values());
}