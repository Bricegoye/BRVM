export type FinancialSourceUnit =
  | "UNIT"
  | "THOUSAND"
  | "MILLION";

export type FundamentalCalculationInput = {
  sourceUnit: FinancialSourceUnit;

  revenue: number | null;
  netIncome: number | null;
  netIncomeAttributableToOwners: number | null;
  equityAttributableToOwners: number | null;

  previousEquityAttributableToOwners: number | null;
  previousSourceUnit: FinancialSourceUnit;

  sharesOutstanding: number | null;
  weightedAverageShares: number | null;

  dividendPerShare: number | null;
  referencePrice: number | null;

  previousRevenue?: number | null;
  previousNetIncome?: number | null;
};

export type FundamentalCalculationResult = {
  calculationVersion: string;

  earningsPerShare: number | null;

  earningsPerShareBasis:
    | "WEIGHTED_AVERAGE"
    | "CLOSING_SHARES_ESTIMATE"
    | "UNAVAILABLE";

  bookValuePerShare: number | null;
  priceEarningsRatio: number | null;
  priceToBookRatio: number | null;
  dividendYieldPercent: number | null;
  returnOnEquityPercent: number | null;
  netMarginPercent: number | null;

  revenueGrowthPercent: number | null;
  netIncomeGrowthPercent: number | null;
};

const UNIT_MULTIPLIERS: Record<FinancialSourceUnit, number> = {
  UNIT: 1,
  THOUSAND: 1_000,
  MILLION: 1_000_000,
};

function finiteOrNull(
  value: number | null | undefined
): number | null {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : null;
}

function positiveOrNull(
  value: number | null | undefined
): number | null {
  const number = finiteOrNull(value);

  return number !== null && number > 0 ? number : null;
}

function toXof(
  value: number | null | undefined,
  unit: FinancialSourceUnit
): number | null {
  const number = finiteOrNull(value);

  if (number === null) {
    return null;
  }

  return finiteOrNull(number * UNIT_MULTIPLIERS[unit]);
}

function divide(
  numerator: number | null,
  denominator: number | null
): number | null {
  if (
    numerator === null ||
    denominator === null ||
    denominator <= 0
  ) {
    return null;
  }

  return finiteOrNull(numerator / denominator);
}

function percentage(
  numerator: number | null,
  denominator: number | null
): number | null {
  const ratio = divide(numerator, denominator);

  return ratio === null ? null : finiteOrNull(ratio * 100);
}

function growthPercent(
  current: number | null,
  previous: number | null
): number | null {
  if (
    current === null ||
    previous === null ||
    previous <= 0
  ) {
    return null;
  }

  return finiteOrNull(((current - previous) / previous) * 100);
}

export function calculateFundamentalMetrics(
  input: FundamentalCalculationInput
): FundamentalCalculationResult {
  const revenue = toXof(input.revenue, input.sourceUnit);
  const netIncome = toXof(input.netIncome, input.sourceUnit);

  const ownersNetIncome = toXof(
    input.netIncomeAttributableToOwners,
    input.sourceUnit
  );

  const ownersEquity = toXof(
    input.equityAttributableToOwners,
    input.sourceUnit
  );

  const previousOwnersEquity = toXof(
    input.previousEquityAttributableToOwners,
    input.previousSourceUnit
  );

  const previousRevenue = toXof(
    input.previousRevenue,
    input.previousSourceUnit
  );

  const previousNetIncome = toXof(
    input.previousNetIncome,
    input.previousSourceUnit
  );

  const closingShares = positiveOrNull(input.sharesOutstanding);
  const weightedShares = positiveOrNull(input.weightedAverageShares);

  const earningsShares = weightedShares ?? closingShares;

  const earningsPerShareBasis:
    FundamentalCalculationResult["earningsPerShareBasis"] =
      weightedShares !== null
        ? "WEIGHTED_AVERAGE"
        : closingShares !== null
          ? "CLOSING_SHARES_ESTIMATE"
          : "UNAVAILABLE";

  const earningsPerShare = divide(
    ownersNetIncome,
    earningsShares
  );

  const bookValuePerShare = divide(
    ownersEquity,
    closingShares
  );

  const price = positiveOrNull(input.referencePrice);
  const dividend = finiteOrNull(input.dividendPerShare);

  const validDividend =
    dividend !== null && dividend >= 0 ? dividend : null;

  const averageOwnersEquity =
    ownersEquity !== null &&
    ownersEquity > 0 &&
    previousOwnersEquity !== null &&
    previousOwnersEquity > 0
      ? finiteOrNull(ownersEquity / 2 + previousOwnersEquity / 2)
      : null;

  return {
    calculationVersion: "v2-owners-average-equity",

    earningsPerShare,
    earningsPerShareBasis,
    bookValuePerShare,

    priceEarningsRatio: divide(price, earningsPerShare),
    priceToBookRatio: divide(price, bookValuePerShare),

    dividendYieldPercent: percentage(validDividend, price),

    returnOnEquityPercent: percentage(
      ownersNetIncome,
      averageOwnersEquity
    ),

    netMarginPercent: percentage(netIncome, revenue),

    revenueGrowthPercent: growthPercent(
      revenue,
      previousRevenue
    ),

    netIncomeGrowthPercent: growthPercent(
      netIncome,
      previousNetIncome
    ),
  };
}