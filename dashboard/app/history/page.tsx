import DashboardShell from "@/components/dashboard/DashboardShell";
import HistoryChart from "@/components/dashboard/HistoryChart";

import {
  getMainIndicesHistory,
} from "@/services/history.service";

export const revalidate = 3600;

export default async function HistoryPage() {
  const series = await getMainIndicesHistory();

  return (
    <DashboardShell>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">
          Historique du marché
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          Analyse l’évolution des principaux indices BRVM au fil des séances
          collectées.
        </p>
      </div>

      <HistoryChart series={series} />
    </DashboardShell>
  );
}