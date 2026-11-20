import { supabase } from "@/lib/supabase/client";

export type StockRow = {
  companyId: number;
  symbol: string;
  companyName: string;
  closePrice: number;
  variationPercent: number;
  volume: number;
  tradeDate: string;
};

export type StockHistoryPoint = {
  tradeDate: string;
  closePrice: number;
  variationPercent: number;
  volume: number;
};

export type StockDetails = {
  companyId: number;
  symbol: string;
  companyName: string;
  latestPrice: StockHistoryPoint | null;
  history: StockHistoryPoint[];
};

export type StockPerformance5Obs =
  | {
      status: "available";
      referenceDate: string;
      adjustedChangePct: number;
    }
  | { status: "insufficient" }
  | { status: "unavailable" };

export type AdjustedHistoryPoint = {
  tradeDate: string;
  closePrice: number;
};

export type StockAdjustedHistory =
  | {
      status: "available";
      basisDate: string;
      history: AdjustedHistoryPoint[];
    }
  | { status: "unavailable" };

export async function getLatestStocks(): Promise<StockRow[]> {
  const { data: latestRow, error: latestError } = await supabase
    .from("daily_prices")
    .select("trade_date")
    .order("trade_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestError) {
    throw new Error(latestError.message);
  }

  if (!latestRow) {
    return [];
  }

  const { data: prices, error: pricesError } = await supabase
    .from("daily_prices")
    .select(
      "company_id, trade_date, close_price, variation_percent, volume"
    )
    .eq("trade_date", latestRow.trade_date);

  if (pricesError) {
    throw new Error(pricesError.message);
  }

  const { data: companies, error: companiesError } = await supabase
    .from("companies")
    .select("company_id, symbol, company_name");

  if (companiesError) {
    throw new Error(companiesError.message);
  }

  const companyMap = new Map(
    (companies ?? []).map((company) => [
      Number(company.company_id),
      {
        symbol: company.symbol,
        companyName: company.company_name,
      },
    ])
  );

  return (prices ?? [])
    .map((price) => {
      const company = companyMap.get(Number(price.company_id));

      return {
        companyId: Number(price.company_id),
        symbol: company?.symbol ?? "-",
        companyName: company?.companyName ?? "-",
        closePrice: Number(price.close_price ?? 0),
        variationPercent: Number(price.variation_percent ?? 0),
        volume: Number(price.volume ?? 0),
        tradeDate: price.trade_date,
      };
    })
    .sort((a, b) => a.symbol.localeCompare(b.symbol));
}

export async function getStockDetails(
  symbol: string
): Promise<StockDetails | null> {
  const normalizedSymbol = decodeURIComponent(symbol)
    .trim()
    .toUpperCase();

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("company_id, symbol, company_name")
    .eq("symbol", normalizedSymbol)
    .maybeSingle();

  if (companyError) {
    throw new Error(companyError.message);
  }

  if (!company) {
    return null;
  }

  const { data: prices, error: pricesError } = await supabase
    .from("daily_prices")
    .select("trade_date, close_price, variation_percent, volume")
    .eq("company_id", company.company_id)
    .order("trade_date", { ascending: true });

  if (pricesError) {
    throw new Error(pricesError.message);
  }

  const history: StockHistoryPoint[] = (prices ?? []).map(
    (price) => ({
      tradeDate: price.trade_date,
      closePrice: Number(price.close_price ?? 0),
      variationPercent: Number(price.variation_percent ?? 0),
      volume: Number(price.volume ?? 0),
    })
  );

  return {
    companyId: Number(company.company_id),
    symbol: company.symbol,
    companyName: company.company_name,
    latestPrice:
      history.length > 0 ? history[history.length - 1] : null,
    history,
  };
}

export async function getStockPerformance5Obs(
  companyId: number,
  tradeDate: string
): Promise<StockPerformance5Obs> {
  const { data, error } = await supabase
    .rpc("get_stock_performance_5_obs", {
      p_company_id: companyId,
      p_trade_date: tradeDate,
    })
    .maybeSingle<{
      reference_date: string | null;
      adjusted_change_pct: number | string | null;
    }>();

  if (error || !data) {
    return { status: "unavailable" };
  }

  if (
    data.reference_date === null &&
    data.adjusted_change_pct === null
  ) {
    return { status: "insufficient" };
  }

  if (
    data.reference_date === null ||
    data.adjusted_change_pct === null
  ) {
    return { status: "unavailable" };
  }

  const adjustedChangePct = Number(data.adjusted_change_pct);

  if (!Number.isFinite(adjustedChangePct)) {
    return { status: "unavailable" };
  }

  return {
    status: "available",
    referenceDate: data.reference_date,
    adjustedChangePct,
  };
}

export async function getStockAdjustedHistory(
  companyId: number,
  basisDate: string
): Promise<StockAdjustedHistory> {
  const { data, error } = await supabase.rpc(
    "get_stock_adjusted_history",
    {
      p_company_id: companyId,
      p_basis_date: basisDate,
    }
  );

  const rows: unknown = data;

  if (error || !Array.isArray(rows) || rows.length === 0) {
    return { status: "unavailable" };
  }

  const history: AdjustedHistoryPoint[] = [];
  const dates = new Set<string>();

  for (const item of rows) {
    if (typeof item !== "object" || item === null) {
      return { status: "unavailable" };
    }

    const row = item as Record<string, unknown>;
    const value = row.adjusted_close_price;

    if (
      row.basis_date !== basisDate ||
      typeof row.trade_date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(row.trade_date) ||
      row.trade_date > basisDate ||
      dates.has(row.trade_date) ||
      (typeof value !== "number" && typeof value !== "string") ||
      (typeof value === "string" && value.trim() === "")
    ) {
      return { status: "unavailable" };
    }

    const closePrice = Number(value);

    if (!Number.isFinite(closePrice) || closePrice <= 0) {
      return { status: "unavailable" };
    }

    dates.add(row.trade_date);

    history.push({
      tradeDate: row.trade_date,
      closePrice,
    });
  }

  history.sort((a, b) =>
    a.tradeDate.localeCompare(b.tradeDate)
  );

  return {
    status: "available",
    basisDate,
    history,
  };
}