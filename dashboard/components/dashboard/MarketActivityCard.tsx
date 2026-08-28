import {
  Banknote,
  Building2,
  Landmark,
} from "lucide-react";

import type {
  MarketActivityMetric,
} from "@/services/market-activity.service";

type Props = {
  metrics: MarketActivityMetric[];
};

function formatFcfa(value: number) {
  if (value >= 1_000_000_000_000) {
    return `${new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 0,
    }).format(value / 1_000_000_000)} Mds FCFA`;
  }

  if (value >= 1_000_000_000) {
    return `${new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 2,
    }).format(value / 1_000_000_000)} Mds FCFA`;
  }

  return `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`;
}

function getMetricIcon(label: string) {
  if (label === "Valeur des transactions") {
    return Banknote;
  }

  if (label === "Capitalisation Actions") {
    return Building2;
  }

  return Landmark;
}

export default function MarketActivityCard({
  metrics,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-950">
          Activité du marché
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Données de la dernière séance
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {metrics.map((metric) => {
          const Icon = getMetricIcon(metric.label);

          const positive =
            (metric.variationPercent ?? 0) >= 0;

          return (
            <div
              key={metric.label}
              className="flex items-center justify-between py-5 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon size={20} />
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-600">
                    {metric.label}
                  </p>

                  <p className="mt-1 text-lg font-bold text-slate-950">
                    {formatFcfa(metric.value)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                {metric.variationPercent !== null && (
                  <>
                    <p
                      className={`text-sm font-semibold ${
                        positive
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {positive ? "▲" : "▼"}{" "}
                      {Math.abs(
                        metric.variationPercent
                      ).toFixed(2)}
                      %
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      vs séance précédente
                    </p>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}