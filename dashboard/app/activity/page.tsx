import DashboardShell from "@/components/dashboard/DashboardShell";
import MarketActivityCard from "@/components/dashboard/MarketActivityCard";

import {
  getLatestMarketActivity,
  getMarketActivityHistory,
} from "@/services/market-activity.service";

export const revalidate = 3600;

function formatFcfa(value: number | null) {
  if (value === null) {
    return "-";
  }

  if (value >= 1_000_000_000_000) {
    return `${new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 2,
    }).format(value / 1_000_000_000_000)} T FCFA`;
  }

  if (value >= 1_000_000_000) {
    return `${new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 2,
    }).format(value / 1_000_000_000)} Mds FCFA`;
  }

  return `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export default async function ActivityPage() {
  const [latestActivity, activityHistory] = await Promise.all([
    getLatestMarketActivity(),
    getMarketActivityHistory(),
  ]);

  const formattedSessionDate = latestActivity.sessionDate
    ? formatDate(latestActivity.sessionDate)
    : "-";

  return (
    <DashboardShell>
      {/* Header */}

      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">
            Activité du marché
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Suivez la valeur des transactions et la capitalisation du marché
            BRVM.
          </p>
        </div>

        <div className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs text-slate-400">
            Dernière séance
          </p>

          <p className="mt-1 font-semibold text-slate-800">
            {formattedSessionDate}
          </p>
        </div>
      </div>

      {/* Dernière séance */}

      <div className="w-full xl:max-w-3xl">
        <MarketActivityCard
          metrics={latestActivity.metrics}
        />
      </div>

      {/* Historique */}

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:mt-8">
        <div className="border-b border-slate-100 p-4 sm:p-6">
          <h2 className="text-lg font-bold text-slate-950">
            Historique de l’activité
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Évolution des principaux indicateurs au fil des séances collectées.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[850px] w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                  Séance
                </th>

                <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                  Transactions
                </th>

                <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                  Capitalisation Actions
                </th>

                <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                  Capitalisation Obligations
                </th>
              </tr>
            </thead>

            <tbody>
              {[...activityHistory]
                .reverse()
                .map((row) => (
                  <tr
                    key={row.sessionDate}
                    className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-900 sm:px-6">
                      {formatDate(row.sessionDate)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium text-slate-700 sm:px-6">
                      {formatFcfa(row.transactionValue)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium text-slate-700 sm:px-6">
                      {formatFcfa(row.equityMarketCap)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium text-slate-700 sm:px-6">
                      {formatFcfa(row.bondMarketCap)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}