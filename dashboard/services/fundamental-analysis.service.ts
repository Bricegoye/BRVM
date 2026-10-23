import type { SupabaseClient } from "@supabase/supabase-js";

import {
  calculateFundamentalMetrics,
  type FinancialSourceUnit,
  type FundamentalCalculationResult,
} from "./fundamental-calculation";

import {
  getStockFundamentals,
  type StockFundamentals,
} from "./fundamental.service";

export type FundamentalAnalysis = {
  fundamentals: StockFundamentals;
  calculationPriceDate: string | null;
  calculationReferencePrice: number | null;
  calculatedMetrics: FundamentalCalculationResult | null;
  warnings: string[];
};

function toNumber(value: unknown): number | null {
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
    throw new Error("Format numérique financier invalide.");
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    throw new Error("Valeur numérique financière invalide.");
  }

  return number;
}

function toSourceUnit(value: unknown): FinancialSourceUnit {
  if (
    value === "UNIT" ||
    value === "THOUSAND" ||
    value === "MILLION"
  ) {
    return value;
  }

  throw new Error("Unité financière absente ou invalide.");
}

/**
 * Calcule les ratios avec le dernier cours disponible.
 * Lecture uniquement : aucune insertion ni mise à jour.
 *
 * Le client doit porter la session de l'utilisateur.
 * getStockFundamentals vérifie la connexion.
 */
export async function getFundamentalAnalysis(
  client: SupabaseClient,
  symbol: string
): Promise<FundamentalAnalysis | null> {
  const fundamentals = await getStockFundamentals(
    client,
    symbol
  );

  if (!fundamentals) {
    return null;
  }

  const analysis: FundamentalAnalysis = {
    fundamentals,
    calculationPriceDate: null,
    calculationReferencePrice: null,
    calculatedMetrics: null,
    warnings: [],
  };

  const report = fundamentals.report;

  if (!report) {
    analysis.warnings.push(
      "Aucun rapport annuel vérifié accessible."
    );

    return analysis;
  }

  if (report.currency !== "XOF") {
    throw new Error(
      "Le calcul nécessite des comptes exprimés en XOF."
    );
  }

  const { data: statement, error: statementError } =
    await client
      .from("financial_statements")
      .select(
        "source_unit, revenue, net_income, equity, net_income_attributable_to_owners, equity_attributable_to_owners, shares_outstanding, dividend_per_share"
      )
      .eq("report_id", report.reportId)
      .maybeSingle();

  if (statementError) {
    throw new Error(statementError.message);
  }

  if (!statement) {
    analysis.warnings.push(
      "Les données financières de ce rapport ne sont pas accessibles."
    );

    return analysis;
  }

  const { data: price, error: priceError } = await client
    .from("daily_prices")
    .select("trade_date, close_price")
    .eq("company_id", fundamentals.companyId)
    .order("trade_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (priceError) {
    throw new Error(priceError.message);
  }

  const referencePrice = toNumber(price?.close_price);

  if (
    !price ||
    referencePrice === null ||
    referencePrice <= 0
  ) {
    analysis.warnings.push(
      "Aucun cours de référence valide pour la dernière séance."
    );

    return analysis;
  }

  if (
    report.publicationDate &&
    report.publicationDate > price.trade_date
  ) {
    analysis.warnings.push(
      "Le rapport a été publié après la dernière cotation disponible."
    );

    return analysis;
  }

  const sourceUnit = toSourceUnit(statement.source_unit);
  const revenue = toNumber(statement.revenue);
  const netIncome = toNumber(statement.net_income);

  const { data: previousReport, error: previousReportError } =
    await client
      .from("financial_reports")
      .select("report_id")
      .eq("company_id", fundamentals.companyId)
      .eq("fiscal_year", report.fiscalYear - 1)
      .eq("period_type", "ANNUAL")
      .eq("verification_status", "VERIFIED")
      .eq("currency", report.currency)
      .eq("is_consolidated", report.isConsolidated)
      .order("report_id", { ascending: false })
      .limit(1)
      .maybeSingle();

  if (previousReportError) {
    throw new Error(previousReportError.message);
  }

  let previousEquity: number | null = null;
  let previousRevenue: number | null = null;
  let previousNetIncome: number | null = null;
  let previousSourceUnit: FinancialSourceUnit = sourceUnit;

  if (previousReport) {
    const {
      data: previousStatement,
      error: previousStatementError,
    } = await client
      .from("financial_statements")
      .select(
        "source_unit, revenue, net_income, equity, equity_attributable_to_owners"
      )
      .eq("report_id", previousReport.report_id)
      .maybeSingle();

    if (previousStatementError) {
      throw new Error(previousStatementError.message);
    }

    if (previousStatement) {
      previousSourceUnit = toSourceUnit(
        previousStatement.source_unit
      );

      previousRevenue = toNumber(
        previousStatement.revenue
      );

      previousNetIncome = toNumber(
        previousStatement.net_income
      );

      previousEquity = toNumber(
        report.isConsolidated
          ? previousStatement.equity_attributable_to_owners
          : previousStatement.equity_attributable_to_owners ??
              previousStatement.equity
      );
    }
  }

  // Sur des comptes consolidés, ne pas remplacer
  // la part des actionnaires par le total du groupe.
  const ownersNetIncome = toNumber(
    report.isConsolidated
      ? statement.net_income_attributable_to_owners
      : statement.net_income_attributable_to_owners ??
          statement.net_income
  );

  const ownersEquity = toNumber(
    report.isConsolidated
      ? statement.equity_attributable_to_owners
      : statement.equity_attributable_to_owners ??
          statement.equity
  );

  const calculatedMetrics = calculateFundamentalMetrics({
    sourceUnit,
    revenue,
    netIncome,
    netIncomeAttributableToOwners: ownersNetIncome,
    equityAttributableToOwners: ownersEquity,
    previousEquityAttributableToOwners: previousEquity,
    previousSourceUnit,
    previousRevenue,
    previousNetIncome,
    sharesOutstanding: toNumber(statement.shares_outstanding),

    // Ce champ n'existe pas encore dans la table.
    weightedAverageShares: null,

    dividendPerShare: toNumber(statement.dividend_per_share),
    referencePrice,
  });

  if (
    calculatedMetrics.earningsPerShareBasis ===
    "CLOSING_SHARES_ESTIMATE"
  ) {
    analysis.warnings.push(
      "BPA estimé avec le nombre d'actions en fin d'exercice."
    );
  }

  if (previousEquity === null) {
    analysis.warnings.push(
      "Capitaux propres précédents indisponibles : ROE moyen non calculable."
    );
  }

  if (revenue === null || previousRevenue === null) {
    analysis.warnings.push(
      "Croissance du chiffre d'affaires indisponible : une valeur manque pour les deux exercices comparés."
    );
  } else if (previousRevenue <= 0) {
    analysis.warnings.push(
      "Croissance du chiffre d'affaires indisponible : le chiffre d'affaires précédent est nul ou négatif."
    );
  }

  if (netIncome === null || previousNetIncome === null) {
    analysis.warnings.push(
      "Croissance du résultat net indisponible : une valeur manque pour les deux exercices comparés."
    );
  } else if (previousNetIncome <= 0) {
    analysis.warnings.push(
      "Croissance du résultat net indisponible : le résultat net précédent est nul ou négatif."
    );
  }

  if (report.publicationDate === null) {
    analysis.warnings.push(
      "Date de publication du rapport non renseignée."
    );
  }

  analysis.warnings.push(
    "Le statut du dividende doit être confirmé dans sa source."
  );

  analysis.calculationPriceDate = price.trade_date;
  analysis.calculationReferencePrice = referencePrice;
  analysis.calculatedMetrics = calculatedMetrics;

  return analysis;
}