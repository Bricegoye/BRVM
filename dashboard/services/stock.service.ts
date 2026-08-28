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

export async function getLatestStocks(): Promise<StockRow[]> {
  // Dernière date de cotation disponible
  const { data: latestRow, error: latestError } = await supabase
    .from("daily_prices")
    .select("trade_date")
    .order("trade_date", { ascending: false })
    .limit(1)
    .single();

  if (latestError) {
    throw new Error(latestError.message);
  }

  if (!latestRow) {
    return [];
  }

  const latestDate = latestRow.trade_date;

  // Cotations de la dernière séance
  const { data: prices, error: pricesError } = await supabase
    .from("daily_prices")
    .select(
      "company_id, trade_date, close_price, variation_percent, volume"
    )
    .eq("trade_date", latestDate);

  if (pricesError) {
    throw new Error(pricesError.message);
  }

  // Sociétés
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