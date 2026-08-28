import { supabase } from "@/lib/supabase/client";

export type StockPerformance = {
  symbol: string;
  performancePercent: number;
};

export type VolumeLeader = {
  symbol: string;
  totalVolume: number;
};

export type PeriodAnalysis = {
  startDate: string | null;
  endDate: string | null;
  compositePerformance: number | null;
  bestStock: StockPerformance | null;
  worstStock: StockPerformance | null;
  volumeLeader: VolumeLeader | null;
};

export async function getPeriodAnalysis(): Promise<PeriodAnalysis> {
  // =========================
  // Sociétés
  // =========================

  const { data: companies, error: companiesError } = await supabase
    .from("companies")
    .select("company_id, symbol");

  if (companiesError) {
    throw new Error(companiesError.message);
  }

  const companyById = new Map(
    (companies ?? []).map((company) => [
      Number(company.company_id),
      company.symbol,
    ])
  );

  // =========================
  // Historique actions
  // =========================

  const { data: prices, error: pricesError } = await supabase
    .from("daily_prices")
    .select(
      "company_id, trade_date, close_price, volume"
    )
    .order("trade_date", { ascending: true });

  if (pricesError) {
    throw new Error(pricesError.message);
  }

  if (!prices || prices.length === 0) {
    return {
      startDate: null,
      endDate: null,
      compositePerformance: null,
      bestStock: null,
      worstStock: null,
      volumeLeader: null,
    };
  }

  const startDate = prices[0].trade_date;
  const endDate = prices[prices.length - 1].trade_date;

  // =========================
  // Groupement par société
  // =========================

  const pricesByCompany = new Map<
    number,
    {
      trade_date: string;
      close_price: number;
      volume: number;
    }[]
  >();

  for (const row of prices) {
    const companyId = Number(row.company_id);

    const current = pricesByCompany.get(companyId) ?? [];

    current.push({
      trade_date: row.trade_date,
      close_price: Number(row.close_price),
      volume: Number(row.volume ?? 0),
    });

    pricesByCompany.set(companyId, current);
  }

  const performances: StockPerformance[] = [];
  const volumes: VolumeLeader[] = [];

  for (const [companyId, rows] of pricesByCompany.entries()) {
    const symbol = companyById.get(companyId);

    if (!symbol || rows.length < 2) {
      continue;
    }

    const first = rows[0];
    const last = rows[rows.length - 1];

    if (first.close_price > 0) {
      const performancePercent =
        ((last.close_price - first.close_price) /
          first.close_price) *
        100;

      performances.push({
        symbol,
        performancePercent,
      });
    }

    const totalVolume = rows.reduce(
      (sum, row) => sum + row.volume,
      0
    );

    volumes.push({
      symbol,
      totalVolume,
    });
  }

  performances.sort(
    (a, b) =>
      b.performancePercent - a.performancePercent
  );

  volumes.sort(
    (a, b) => b.totalVolume - a.totalVolume
  );

  // =========================
  // BRVM Composite
  // =========================

  const { data: compositeRows, error: compositeError } =
    await supabase
      .from("market_indices")
      .select("session_date, close_price")
      .eq("name", "BRVM - COMPOSITE")
      .order("session_date", { ascending: true });

  if (compositeError) {
    throw new Error(compositeError.message);
  }

  let compositePerformance: number | null = null;

  if (compositeRows && compositeRows.length >= 2) {
    const firstComposite = Number(
      compositeRows[0].close_price
    );

    const lastComposite = Number(
      compositeRows[compositeRows.length - 1].close_price
    );

    if (firstComposite > 0) {
      compositePerformance =
        ((lastComposite - firstComposite) /
          firstComposite) *
        100;
    }
  }

  return {
    startDate,
    endDate,
    compositePerformance,
    bestStock: performances[0] ?? null,
    worstStock:
      performances[performances.length - 1] ?? null,
    volumeLeader: volumes[0] ?? null,
  };
}