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

export async function getLatestStocks(): Promise<StockRow[]> {
  const { data: latestRow, error: latestError } =
    await supabase
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

  const latestDate = latestRow.trade_date;

  const { data: prices, error: pricesError } =
    await supabase
      .from("daily_prices")
      .select(
        "company_id, trade_date, close_price, variation_percent, volume"
      )
      .eq("trade_date", latestDate);

  if (pricesError) {
    throw new Error(pricesError.message);
  }

  const { data: companies, error: companiesError } =
    await supabase
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
      const company = companyMap.get(
        Number(price.company_id)
      );

      return {
        companyId: Number(price.company_id),
        symbol: company?.symbol ?? "-",
        companyName: company?.companyName ?? "-",
        closePrice: Number(price.close_price ?? 0),
        variationPercent: Number(
          price.variation_percent ?? 0
        ),
        volume: Number(price.volume ?? 0),
        tradeDate: price.trade_date,
      };
    })
    .sort((a, b) =>
      a.symbol.localeCompare(b.symbol)
    );
}

export async function getStockDetails(
  symbol: string
): Promise<StockDetails | null> {
  const normalizedSymbol = decodeURIComponent(symbol)
    .trim()
    .toUpperCase();

  const { data: company, error: companyError } =
    await supabase
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

  const { data: prices, error: pricesError } =
    await supabase
      .from("daily_prices")
      .select(
        "trade_date, close_price, variation_percent, volume"
      )
      .eq("company_id", company.company_id)
      .order("trade_date", { ascending: true });

  if (pricesError) {
    throw new Error(pricesError.message);
  }

  const history: StockHistoryPoint[] = (
    prices ?? []
  ).map((price) => ({
    tradeDate: price.trade_date,
    closePrice: Number(price.close_price ?? 0),
    variationPercent: Number(
      price.variation_percent ?? 0
    ),
    volume: Number(price.volume ?? 0),
  }));

  return {
    companyId: Number(company.company_id),
    symbol: company.symbol,
    companyName: company.company_name,
    latestPrice:
      history.length > 0
        ? history[history.length - 1]
        : null,
    history,
  };
}