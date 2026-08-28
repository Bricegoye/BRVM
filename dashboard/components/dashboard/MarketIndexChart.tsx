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
  MarketIndexHistoryPoint,
} from "@/services/market-index.service";

type Props = {
  data: MarketIndexHistoryPoint[];
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(`${date}T12:00:00`));
}

export default function MarketIndexChart({
  data,
}: Props) {
  const chartData = data.map((point) => ({
    ...point,
    formattedDate: formatDate(point.session_date),
  }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-950">
          Évolution du BRVM Composite
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Historique des dernières séances
        </p>
      </div>

      <div className="h-[270px] w-full">
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
                id="compositeGradient"
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
              domain={["dataMin - 5", "dataMax + 5"]}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#94a3b8",
                fontSize: 12,
              }}
              width={50}
            />

            <Tooltip
              formatter={(value) => [
                Number(value).toFixed(2),
                "BRVM Composite",
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
              fill="url(#compositeGradient)"
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