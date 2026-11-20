import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  ChartNoAxesCombined,
  Database,
} from "lucide-react";

import DashboardShell from "@/components/dashboard/DashboardShell";
import StockHistoryChart from "@/components/dashboard/StockHistoryChart";

import {
  getStockDetails,
  getStockPerformance5Obs,
  getStockAdjustedHistory,
} from "@/services/stock.service";

export const revalidate = 3600;

type Props = {
  params: Promise<{
    symbol: string;
  }>;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatAdjustedPrice(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: "exceptZero",
  }).format(value / 100);
}

function variationColor(value: number) {
  if (value > 0) {
    return "text-emerald-600";
  }

  if (value < 0) {
    return "text-red-600";
  }

  return "text-slate-500";
}

export default async function StockDetailsPage({
  params,
}: Props) {
  const { symbol } = await params;
  const stock = await getStockDetails(symbol);

  if (!stock) {
    notFound();
  }

  const latest = stock.latestPrice;

  const performance = latest
    ? await getStockPerformance5Obs(
        stock.companyId,
        latest.tradeDate
      )
    : null;

  const adjustedHistory = latest
    ? await getStockAdjustedHistory(
        stock.companyId,
        latest.tradeDate
      )
    : null;

  const chartHistory =
    adjustedHistory?.status === "available" &&
    adjustedHistory.history.length === stock.history.length &&
    adjustedHistory.history.every(
      (point, index) =>
        point.tradeDate === stock.history[index].tradeDate
    )
      ? adjustedHistory.history
      : null;

  const recentPrices = [...stock.history]
    .reverse()
    .slice(0, 10);

  const availablePrices = (chartHistory ?? [])
    .map((point) => point.closePrice)
    .filter((price) => Number.isFinite(price) && price > 0);

  const averagePrice =
    availablePrices.length > 0
      ? availablePrices.reduce(
          (total, price) => total + price,
          0
        ) / availablePrices.length
      : null;

  const lowestPrice =
    availablePrices.length > 0
      ? Math.min(...availablePrices)
      : null;

  const highestPrice =
    availablePrices.length > 0
      ? Math.max(...availablePrices)
      : null;

  return (
    <DashboardShell>
      <Link
        href="/actions"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
      >
        <ArrowLeft size={17} />
        Retour aux actions
      </Link>

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Building2 size={24} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-950">
                  {stock.symbol}
                </h1>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  Action BRVM
                </span>
              </div>

              <p className="mt-2 text-base text-slate-600">
                {stock.companyName}
              </p>

              {latest && (
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                  <CalendarDays size={15} />

                  <span>
                    Dernière cotation :{" "}
                    {formatDate(latest.tradeDate)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {latest ? (
            <div className="lg:text-right">
              <p className="text-sm text-slate-500">
                Dernier cours
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-950">
                {formatPrice(latest.closePrice)}
                <span className="ml-2 text-sm font-medium text-slate-500">
                  FCFA
                </span>
              </p>

              <p
                className={`mt-2 text-sm font-bold ${variationColor(
                  latest.variationPercent
                )}`}
              >
                {formatPercent(latest.variationPercent)}
              </p>
            </div>
          ) : (
            <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
              Aucune cotation disponible
            </div>
          )}
        </div>
      </section>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <Database size={17} />

            <p className="text-xs font-semibold uppercase tracking-wide">
              Volume
            </p>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-950">
            {latest ? formatNumber(latest.volume) : "—"}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Dernière cotation
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <ChartNoAxesCombined size={17} />

            <p className="text-xs font-semibold uppercase tracking-wide">
              Cours moyen ajusté
            </p>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-950">
            {averagePrice !== null
              ? formatAdjustedPrice(averagePrice)
              : "—"}
            <span className="ml-1 text-xs font-normal text-slate-500">
              FCFA
            </span>
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Moyenne des clôtures disponibles
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Plus bas ajusté
          </p>

          <p className="mt-3 text-2xl font-bold text-slate-950">
            {lowestPrice !== null
              ? formatAdjustedPrice(lowestPrice)
              : "—"}
            <span className="ml-1 text-xs font-normal text-slate-500">
              FCFA
            </span>
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Minimum des clôtures disponibles
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Plus haut ajusté
          </p>

          <p className="mt-3 text-2xl font-bold text-slate-950">
            {highestPrice !== null
              ? formatAdjustedPrice(highestPrice)
              : "—"}
            <span className="ml-1 text-xs font-normal text-slate-500">
              FCFA
            </span>
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Maximum des clôtures disponibles
          </p>
        </article>
      </section>

      {chartHistory && latest && (
        <p className="mb-8 text-sm leading-6 text-slate-600">
          Statistiques calculées du{" "}
          {formatDate(chartHistory[0].tradeDate)} au{" "}
          {formatDate(latest.tradeDate)}, sur{" "}
          {chartHistory.length} cotations disponibles.
          Les cours sont ajustés des fractionnements connus
          sur la base du {formatDate(latest.tradeDate)}.
          Les dividendes ne sont pas inclus.
        </p>
      )}

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-slate-900">
          Variation du cours sur 5 observations
        </h2>

        {performance?.status === "available" && latest ? (
          <>
            <p
              className={`mt-2 text-2xl font-bold ${variationColor(
                performance.adjustedChangePct
              )}`}
            >
              {formatPercent(performance.adjustedChangePct)}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              Du {formatDate(performance.referenceDate)} au{" "}
              {formatDate(latest.tradeDate)}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Variation du cours ajustée des fractionnements
              connus, hors dividendes.
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-slate-600">
            {performance?.status === "insufficient"
              ? "Historique insuffisant"
              : "Variation indisponible"}
          </p>
        )}
      </section>

      {chartHistory ? (
        <StockHistoryChart
          history={chartHistory}
          symbol={stock.symbol}
        />
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-950">
            Historique du cours ajusté
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            {stock.history.length === 0
              ? "Aucune cotation disponible."
              : "Historique ajusté temporairement indisponible."}
          </p>
        </section>
      )}

      <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <h2 className="text-lg font-bold text-slate-950">
            Dernières cotations
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Les 10 cotations les plus récentes. Les cours
            ci-dessous sont les cours bruts collectés,
            sans ajustement rétrospectif des fractionnements.
          </p>
        </div>

        {recentPrices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                  <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500 sm:px-6">
                    Date
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-slate-500 sm:px-6">
                    Cours brut
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-slate-500 sm:px-6">
                    Variation publiée
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-slate-500 sm:px-6">
                    Volume
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentPrices.map((price) => (
                  <tr
                    key={price.tradeDate}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-5 py-4 text-sm font-medium text-slate-700 sm:px-6">
                      {formatDate(price.tradeDate)}
                    </td>

                    <td className="px-5 py-4 text-right font-semibold text-slate-900 sm:px-6">
                      {formatPrice(price.closePrice)}
                      <span className="ml-1 text-xs font-normal text-slate-500">
                        FCFA
                      </span>
                    </td>

                    <td
                      className={`px-5 py-4 text-right text-sm font-semibold sm:px-6 ${variationColor(
                        price.variationPercent
                      )}`}
                    >
                      {formatPercent(price.variationPercent)}
                    </td>

                    <td className="px-5 py-4 text-right text-sm text-slate-700 sm:px-6">
                      {formatNumber(price.volume)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            Aucune cotation disponible.
          </div>
        )}
      </section>

      <section className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 sm:p-6">
        <h2 className="font-bold text-slate-900">
          Performances longues
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Les indicateurs sur 20 et 60 observations ainsi que
          la comparaison avec le BRVM Composite seront
          ajoutés après validation des calculs et de la
          couverture des données.
        </p>
      </section>
    </DashboardShell>
  );
}