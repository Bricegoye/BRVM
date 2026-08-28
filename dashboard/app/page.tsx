import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardShell from "@/components/dashboard/DashboardShell";
import KpiCard from "@/components/dashboard/KpiCard";
import MarketActivityCard from "@/components/dashboard/MarketActivityCard";
import MarketIndexChart from "@/components/dashboard/MarketIndexChart";
import MarketRankingCard from "@/components/dashboard/MarketRankingCard";
import PeriodAnalysis from "@/components/dashboard/PeriodAnalysis";
import StocksTable from "@/components/dashboard/StocksTable";

import {
  getCompositeHistory,
  getLatestMarketIndices,
} from "@/services/market-index.service";

import {
  getLatestMarketActivity,
} from "@/services/market-activity.service";

import {
  getLatestMarketRankings,
} from "@/services/market-ranking.service";

import {
  getPeriodAnalysis,
} from "@/services/period-analysis.service";

import {
  getLatestStocks,
} from "@/services/stock.service";

export const revalidate = 3600;

export default async function Home() {
  const [
    indices,
    marketActivity,
    compositeHistory,
    rankings,
    periodAnalysis,
    stocks,
  ] = await Promise.all([
    getLatestMarketIndices(),
    getLatestMarketActivity(),
    getCompositeHistory(),
    getLatestMarketRankings(),
    getPeriodAnalysis(),
    getLatestStocks(),
  ]);

  const mainIndices = indices.filter(
    (index) => index.category === "MAIN"
  );

  const composite = mainIndices.find(
    (index) =>
      index.name === "BRVM - COMPOSITE"
  );

  const brvm30 = mainIndices.find(
    (index) => index.name === "BRVM-30"
  );

  const prestige = mainIndices.find(
    (index) =>
      index.name === "BRVM - PRESTIGE"
  );

  const principal = mainIndices.find(
    (index) =>
      index.name === "BRVM - PRINCIPAL"
  );

  const sessionDate =
    composite?.session_date ??
    indices[0]?.session_date ??
    "";

  return (
    <DashboardShell>
      <DashboardHeader
        sessionDate={sessionDate}
      />

      {/* KPI PRINCIPAUX */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="BRVM Composite"
          value={
            composite?.close_price?.toString() ??
            "-"
          }
          variation={
            composite?.variation_percent
          }
        />

        <KpiCard
          title="BRVM 30"
          value={
            brvm30?.close_price?.toString() ??
            "-"
          }
          variation={
            brvm30?.variation_percent
          }
        />

        <KpiCard
          title="BRVM Prestige"
          value={
            prestige?.close_price?.toString() ??
            "-"
          }
          variation={
            prestige?.variation_percent
          }
        />

        <KpiCard
          title="BRVM Principal"
          value={
            principal?.close_price?.toString() ??
            "-"
          }
          variation={
            principal?.variation_percent
          }
        />
      </div>

      {/* GRAPHIQUE + ACTIVITÉ */}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <MarketIndexChart
            data={compositeHistory}
          />
        </div>

        <div className="min-w-0">
          <MarketActivityCard
            metrics={marketActivity.metrics}
          />
        </div>
      </div>

      {/* TOP 5 / FLOP 5 */}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <MarketRankingCard
          title="Top 5 - Hausses de la séance"
          items={rankings.top5}
          type="TOP5"
        />

        <MarketRankingCard
          title="Flop 5 - Baisses de la séance"
          items={rankings.flop5}
          type="FLOP5"
        />
      </div>

      {/* ANALYSE DE LA PÉRIODE */}

      <PeriodAnalysis
        analysis={periodAnalysis}
      />

      {/* TABLEAU DES ACTIONS */}

      <StocksTable
        stocks={stocks}
      />
    </DashboardShell>
  );
}