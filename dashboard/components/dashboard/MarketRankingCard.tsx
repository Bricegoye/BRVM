import {
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";

import type {
  MarketRanking,
} from "@/services/market-ranking.service";

type Props = {
  title: string;
  items: MarketRanking[];
  type: "TOP5" | "FLOP5";
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(value);
}

export default function MarketRankingCard({
  title,
  items,
  type,
}: Props) {
  const isTop = type === "TOP5";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2
            className={`text-lg font-bold ${
              isTop
                ? "text-emerald-700"
                : "text-red-700"
            }`}
          >
            {title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Dernière séance disponible
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            isTop
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          {isTop ? (
            <ArrowUpRight size={20} />
          ) : (
            <ArrowDownRight size={20} />
          )}
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={`${item.ranking_type}-${item.symbol}`}
            className="grid grid-cols-[32px_1fr_auto_auto] items-center gap-4 rounded-xl px-2 py-2 hover:bg-slate-50"
          >
            <div className="text-sm font-medium text-slate-400">
              {index + 1}
            </div>

            <div>
              <p className="font-semibold text-slate-900">
                {item.symbol}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm font-medium text-slate-700">
                {formatPrice(item.close_price)}
              </p>
              <p className="text-xs text-slate-400">
                FCFA
              </p>
            </div>

            <div
              className={`min-w-[78px] text-right text-sm font-bold ${
                isTop
                  ? "text-emerald-600"
                  : "text-red-600"
              }`}
            >
              {item.variation_percent > 0 ? "+" : ""}
              {item.variation_percent.toFixed(2)} %
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}