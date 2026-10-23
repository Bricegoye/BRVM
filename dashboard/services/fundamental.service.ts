import type { SupabaseClient } from "@supabase/supabase-js";

export type FundamentalReport = {
  reportId: number;
  fiscalYear: number;
  periodEndDate: string;
  publicationDate: string | null;
  currency: string;
  isAudited: boolean;
  isConsolidated: boolean;
  sourceName: string;
  sourceUrl: string;
  sourcePage: string | null;
};

export type FundamentalMetrics = {
  priceDate: string;
  referencePrice: number;
  earningsPerShare: number | null;
  bookValuePerShare: number | null;
  priceEarningsRatio: number | null;
  priceToBookRatio: number | null;
  dividendYieldPercent: number | null;
  returnOnEquityPercent: number | null;
  netMarginPercent: number | null;
  debtToEquityRatio: number | null;
  revenueGrowthPercent: number | null;
  netIncomeGrowthPercent: number | null;
  calculationVersion: string;
  calculatedAt: string;
};

export type StockFundamentals = {
  companyId: number;
  symbol: string;
  companyName: string;
  report: FundamentalReport | null;
  metrics: FundamentalMetrics | null;
};

export class FundamentalAuthenticationError extends Error {
  constructor() {
    super(
      "Une connexion est nécessaire pour accéder aux fondamentaux."
    );
    this.name = "FundamentalAuthenticationError";
  }
}

function toNullableNumber(value: unknown): number | null {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return null;
  }

  if (
    typeof value !== "number" &&
    typeof value !== "string"
  ) {
    throw new Error(
      "Une donnée financière possède un format invalide."
    );
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    throw new Error(
      "Une donnée financière n'est pas un nombre valide."
    );
  }

  return number;
}

/**
 * Utiliser un client portant la session de l'utilisateur.
 * Les autorisations sont contrôlées par les politiques RLS.
 *
 * Lit le dernier rapport annuel VERIFIED accessible.
 * Les ratios conservent leur cours de référence d'origine.
 */
export async function getStockFundamentals(
  client: SupabaseClient,
  symbol: string
): Promise<StockFundamentals | null> {
  const { data: authData, error: authError } =
    await client.auth.getUser();

  if (authError || !authData.user) {
    throw new FundamentalAuthenticationError();
  }

  const normalizedSymbol = symbol.trim().toUpperCase();

  if (!normalizedSymbol) {
    return null;
  }

  const { data: company, error: companyError } = await client
    .from("companies")
    .select("company_id, symbol, company_name")
    .eq("symbol", normalizedSymbol)
    .maybeSingle();

  if (companyError) {
    throw new Error(
      `Lecture de la société impossible : ${companyError.message}`
    );
  }

  if (!company) {
    return null;
  }

  const result: StockFundamentals = {
    companyId: Number(company.company_id),
    symbol: company.symbol,
    companyName: company.company_name,
    report: null,
    metrics: null,
  };

  const { data: report, error: reportError } = await client
    .from("financial_reports")
    .select(
      "report_id, fiscal_year, period_end_date, publication_date, currency, is_audited, is_consolidated, source_name, source_url, source_page"
    )
    .eq("company_id", company.company_id)
    .eq("verification_status", "VERIFIED")
    .eq("period_type", "ANNUAL")
    .order("fiscal_year", { ascending: false })
    .order("period_end_date", { ascending: false })
    .order("report_id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (reportError) {
    throw new Error(
      `Lecture du rapport impossible : ${reportError.message}`
    );
  }

  // Aucun rapport vérifié accessible avec cette session.
  if (!report) {
    return result;
  }

  result.report = {
    reportId: Number(report.report_id),
    fiscalYear: Number(report.fiscal_year),
    periodEndDate: report.period_end_date,
    publicationDate: report.publication_date,
    currency: String(report.currency).trim(),
    isAudited: report.is_audited,
    isConsolidated: report.is_consolidated,
    sourceName: report.source_name,
    sourceUrl: report.source_url,
    sourcePage: report.source_page,
  };

  const { data: metrics, error: metricsError } = await client
    .from("fundamental_metrics")
    .select(
      "price_date, reference_price, earnings_per_share, book_value_per_share, price_earnings_ratio, price_to_book_ratio, dividend_yield_percent, return_on_equity_percent, net_margin_percent, debt_to_equity_ratio, revenue_growth_percent, net_income_growth_percent, calculation_version, calculated_at"
    )
    .eq("report_id", report.report_id)
    .order("price_date", { ascending: false })
    .order("calculated_at", { ascending: false })
    .order("metric_id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (metricsError) {
    throw new Error(
      `Lecture des ratios impossible : ${metricsError.message}`
    );
  }

  if (!metrics) {
    return result;
  }

  const referencePrice = toNullableNumber(
    metrics.reference_price
  );

  if (referencePrice === null || referencePrice <= 0) {
    throw new Error(
      "Le cours de référence des ratios est invalide."
    );
  }

  result.metrics = {
    priceDate: metrics.price_date,
    referencePrice,
    earningsPerShare: toNullableNumber(
      metrics.earnings_per_share
    ),
    bookValuePerShare: toNullableNumber(
      metrics.book_value_per_share
    ),
    priceEarningsRatio: toNullableNumber(
      metrics.price_earnings_ratio
    ),
    priceToBookRatio: toNullableNumber(
      metrics.price_to_book_ratio
    ),
    dividendYieldPercent: toNullableNumber(
      metrics.dividend_yield_percent
    ),
    returnOnEquityPercent: toNullableNumber(
      metrics.return_on_equity_percent
    ),
    netMarginPercent: toNullableNumber(
      metrics.net_margin_percent
    ),
    debtToEquityRatio: toNullableNumber(
      metrics.debt_to_equity_ratio
    ),
    revenueGrowthPercent: toNullableNumber(
      metrics.revenue_growth_percent
    ),
    netIncomeGrowthPercent: toNullableNumber(
      metrics.net_income_growth_percent
    ),
    calculationVersion: metrics.calculation_version,
    calculatedAt: metrics.calculated_at,
  };

  return result;
}