"use client";

import { useMemo, useState } from "react";

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
  IndexHistorySeries,
} from "@/services/history.service";

type Props = {
  series: IndexHistorySeries[];
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  }).format(
    new Date(`${date}T12:00:00`)
  );
}

function shortName(name: string) {
  return name
    .replace("BRVM - ", "")
    .replace("BRVM-", "BRVM ");
}

export default function HistoryChart({
  series,
}: Props) {
  const [selectedName, setSelectedName] =
    useState(
      series[0]?.name ??
        "BRVM - COMPOSITE"
    );

  const selectedSeries = useMemo(
    () =>
      series.find(
        (item) =>
          item.name === selectedName
      ),
    [series, selectedName]
  );

  const chartData =
    selectedSeries?.points.map(
      (point) => ({
        ...point,
        formattedDate: formatDate(
          point.session_date
        ),
      })
    ) ?? [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Choix indice */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            Évolution des indices
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Historique des séances collectées
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {series.map((item) => {
            const active =
              item.name === selectedName;

            return (
              <button
                key={item.name}
                type="button"
                onClick={() =>
                  setSelectedName(
                    item.name
                  )
                }
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {shortName(item.name)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Résumé */}

      {chartData.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-8 border-b border-slate-100 pb-5">
          <div>
            <p className="text-xs text-slate-400">
              Première valeur
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {chartData[
                0
              ].close_price.toFixed(2)}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">
              Dernière valeur
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {chartData[
                chartData.length - 1
              ].close_price.toFixed(2)}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">
              Séances disponibles
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {chartData.length}
            </p>
          </div>
        </div>
      )}

      {/* Graphique */}

      <div className="h-[420px] w-full">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 20,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id="historyGradient"
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
              tick={{
                fill: "#94a3b8",
                fontSize: 12,
              }}
            />

            <YAxis
              domain={[
                "dataMin - 5",
                "dataMax + 5",
              ]}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#94a3b8",
                fontSize: 12,
              }}
              width={55}
            />

            <Tooltip
              formatter={(value) => [
                Number(value).toFixed(2),
                shortName(
                  selectedName
                ),
              ]}
              labelFormatter={(label) =>
                `Séance du ${label}`
              }
            />

            <Area
              type="monotone"
              dataKey="close_price"
              stroke="#2563eb"
              strokeWidth={3}
              fill="url(#historyGradient)"
              activeDot={{
                r: 5,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}