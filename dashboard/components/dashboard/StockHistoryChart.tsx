"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  AdjustedHistoryPoint,
} from "@/services/stock.service";

type Props = {
  history: AdjustedHistoryPoint[];
  symbol: string;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(`${date}T12:00:00`));
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2,
  }).format(value);
}

export default function StockHistoryChart({
  history,
  symbol,
}: Props) {
  const chartData = history.map((point) => ({
    ...point,
    formattedDate: formatDate(point.tradeDate),
  }));

  if (chartData.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">
          Historique du cours ajusté
        </h2>

        <div className="mt-6 rounded-xl bg-slate-50 px-4 py-10 text-center">
          <p className="text-sm font-medium text-slate-600">
            Aucun historique ajusté disponible
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Le graphique apparaîtra lorsque les cours ajustés
            seront disponibles.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-950">
          Historique du cours ajusté
        </h2>

        <p className="mt-1 text-sm text-slate-600">
          Évolution de {symbol}, ajustée des fractionnements
          connus, hors dividendes.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-8 border-b border-slate-100 pb-5">
        <div>
          <p className="text-xs text-slate-500">
            Premier cours ajusté
          </p>

          <p className="mt-1 font-semibold text-slate-900">
            {formatPrice(chartData[0].closePrice)} FCFA
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Dernier cours ajusté
          </p>

          <p className="mt-1 font-semibold text-slate-900">
            {formatPrice(
              chartData[chartData.length - 1].closePrice
            )}{" "}
            FCFA
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Observations disponibles
          </p>

          <p className="mt-1 font-semibold text-slate-900">
            {chartData.length}
          </p>
        </div>
      </div>

      <div className="h-[320px] w-full sm:h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id="stockHistoryGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#2563eb"
                  stopOpacity={0.22}
                />

                <stop
                  offset="95%"
                  stopColor="#2563eb"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
            />

            <XAxis
              dataKey="formattedDate"
              axisLine={false}
              tickLine={false}
              minTickGap={24}
              tick={{
                fill: "#64748b",
                fontSize: 12,
              }}
            />

            <YAxis
              domain={["auto", "auto"]}
              axisLine={false}
              tickLine={false}
              width={80}
              tickFormatter={(value) =>
                formatPrice(Number(value))
              }
              tick={{
                fill: "#64748b",
                fontSize: 12,
              }}
            />

            <Tooltip
              formatter={(value) => [
                `${formatPrice(Number(value))} FCFA`,
                "Cours ajusté",
              ]}
              labelFormatter={(label) =>
                `Cotation du ${label}`
              }
            />

            <Area
              type="linear"
              dataKey="closePrice"
              stroke="#2563eb"
              strokeWidth={3}
              fill="url(#stockHistoryGradient)"
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {chartData.length < 20 && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-800">
            Historique encore limité : les indicateurs sur
            des périodes plus longues nécessitent davantage
            de cotations.
          </p>
        </div>
      )}
    </div>
  );
}