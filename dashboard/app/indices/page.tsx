import DashboardShell from "@/components/dashboard/DashboardShell";

import {
  getLatestMarketIndices,
} from "@/services/market-index.service";

export const revalidate = 3600;

function formatValue(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default async function IndicesPage() {
  const indices = await getLatestMarketIndices();

  const mainIndices = indices.filter(
    (index) => index.category === "MAIN"
  );

  const sectorIndices = indices.filter(
    (index) => index.category === "SECTOR"
  );

  const totalReturnIndices = indices.filter(
    (index) => index.category === "TOTAL_RETURN"
  );

  const sessionDate = indices[0]?.session_date ?? "";

  const formattedDate = sessionDate
    ? new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(
        new Date(`${sessionDate}T12:00:00`)
      )
    : "-";

  return (
    <DashboardShell>
      {/* Header */}

      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">
            Indices BRVM
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Suivez les principaux indices du marché et les performances
            sectorielles.
          </p>
        </div>

        <div className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs text-slate-400">
            Dernière séance
          </p>

          <p className="mt-1 font-semibold text-slate-800">
            {formattedDate}
          </p>
        </div>
      </div>

      {/* Indices principaux */}

      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-950">
            Indices principaux
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Vue d&apos;ensemble du marché BRVM
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {mainIndices.map((index) => {
            const positive =
              index.variation_percent >= 0;

            return (
              <div
                key={index.index_id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-sm font-medium text-slate-500">
                  {index.name}
                </p>

                <p className="mt-3 text-2xl font-bold text-slate-950">
                  {formatValue(index.close_price)}
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      positive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {positive ? "+" : ""}
                    {index.variation_percent.toFixed(2)} %
                  </span>

                  <span className="text-xs text-slate-400">
                    Année :{" "}
                    {index.year_variation_percent >= 0
                      ? "+"
                      : ""}
                    {index.year_variation_percent.toFixed(
                      2
                    )}{" "}
                    %
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Indices sectoriels */}

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:mt-8">
        <div className="border-b border-slate-100 p-4 sm:p-6">
          <h2 className="text-lg font-bold text-slate-950">
            Indices sectoriels
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Performance des différents secteurs du marché
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                  Secteur
                </th>

                <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                  Clôture
                </th>

                <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                  Variation
                </th>

                <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                  Variation annuelle
                </th>
              </tr>
            </thead>

            <tbody>
              {sectorIndices.map((index) => {
                const positive =
                  index.variation_percent >= 0;

                return (
                  <tr
                    key={index.index_id}
                    className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                      <span className="font-semibold text-slate-900">
                        {index.name.replace(
                          "BRVM - ",
                          ""
                        )}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-right font-medium text-slate-800 sm:px-6">
                      {formatValue(
                        index.close_price
                      )}
                    </td>

                    <td
                      className={`whitespace-nowrap px-4 py-4 text-right font-semibold sm:px-6 ${
                        positive
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {positive ? "+" : ""}
                      {index.variation_percent.toFixed(
                        2
                      )}{" "}
                      %
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-right text-slate-600 sm:px-6">
                      {index.year_variation_percent >= 0
                        ? "+"
                        : ""}
                      {index.year_variation_percent.toFixed(
                        2
                      )}{" "}
                      %
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total Return */}

      {totalReturnIndices.length > 0 && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mt-8 sm:p-6">
          <h2 className="text-lg font-bold text-slate-950">
            Indice Total Return
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Performance intégrant le réinvestissement des dividendes
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            {totalReturnIndices.map((index) => (
              <div
                key={index.index_id}
                className="rounded-xl bg-slate-50 p-5"
              >
                <p className="text-sm text-slate-500">
                  {index.name}
                </p>

                <p className="mt-2 text-xl font-bold text-slate-950">
                  {formatValue(
                    index.close_price
                  )}
                </p>

                <p
                  className={`mt-2 text-sm font-semibold ${
                    index.variation_percent >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {index.variation_percent >= 0
                    ? "+"
                    : ""}
                  {index.variation_percent.toFixed(
                    2
                  )}{" "}
                  %
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}