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

  const recentPrices = [...stock.history]
    .reverse()
    .slice(0, 10);

  const availablePrices = stock.history
    .map((point) => point.closePrice)
    .filter((price) => price > 0);

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
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
                  <CalendarDays size={15} />

                  <span>
                    Dernière séance :{" "}
                    {formatDate(latest.tradeDate)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {latest ? (
            <div className="lg:text-right">
              <p className="text-sm text-slate-400">
                Dernier cours
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-950">
                {formatPrice(latest.closePrice)}
                <span className="ml-2 text-sm font-medium text-slate-400">
                  FCFA
                </span>
              </p>

              <p
                className={`mt-2 text-sm font-bold ${variationColor(
                  latest.variationPercent
                )}`}
              >
                {latest.variationPercent > 0 ? "+" : ""}
                {latest.variationPercent.toFixed(2)} %
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
          <div className="flex items-center gap-2 text-slate-400">
            <Database size={17} />

            <p className="text-xs font-semibold uppercase tracking-wide">
              Volume
            </p>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-950">
            {latest ? formatNumber(latest.volume) : "—"}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Dernière séance
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400">
            <ChartNoAxesCombined size={17} />

            <p className="text-xs font-semibold uppercase tracking-wide">
              Cours moyen
            </p>
          </div>

          <p className="mt-3 text-2xl font-bold text-slate-950">
            {averagePrice !== null
              ? formatPrice(averagePrice)
              : "—"}
            <span className="ml-1 text-xs font-normal text-slate-400">
              FCFA
            </span>
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Historique disponible
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Plus bas
          </p>

          <p className="mt-3 text-2xl font-bold text-slate-950">
            {lowestPrice !== null
              ? formatPrice(lowestPrice)
              : "—"}
            <span className="ml-1 text-xs font-normal text-slate-400">
              FCFA
            </span>
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Période collectée
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Plus haut
          </p>

          <p className="mt-3 text-2xl font-bold text-slate-950">
            {highestPrice !== null
              ? formatPrice(highestPrice)
              : "—"}
            <span className="ml-1 text-xs font-normal text-slate-400">
              FCFA
            </span>
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Période collectée
          </p>
        </article>
      </section>

      <StockHistoryChart
        history={stock.history}
        symbol={stock.symbol}
      />

      <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <h2 className="text-lg font-bold text-slate-950">
            Dernières cotations
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Les 10 séances les plus récentes
          </p>
        </div>

        {recentPrices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                  <th className="px-5 py-4 text-xs font-semibold uppercase text-slate-500 sm:px-6">
                    Séance
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-slate-500 sm:px-6">
                    Cours
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-slate-500 sm:px-6">
                    Variation
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
                      <span className="ml-1 text-xs font-normal text-slate-400">
                        FCFA
                      </span>
                    </td>

                    <td
                      className={`px-5 py-4 text-right text-sm font-semibold sm:px-6 ${variationColor(
                        price.variationPercent
                      )}`}
                    >
                      {price.variationPercent > 0
                        ? "+"
                        : ""}
                      {price.variationPercent.toFixed(2)} %
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

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Les performances sur 20 et 60 séances ainsi que la
          comparaison avec le BRVM Composite seront activées
          lorsque l’historique disponible sera suffisant.
        </p>
      </section>
    </DashboardShell>
  );
}