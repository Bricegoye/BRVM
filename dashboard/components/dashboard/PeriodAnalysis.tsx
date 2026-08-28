import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
} from "lucide-react";

import type {
  PeriodAnalysis as PeriodAnalysisType,
} from "@/services/period-analysis.service";

type Props = {
  analysis: PeriodAnalysisType;
};

function formatDate(date: string | null) {
  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function formatVolume(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}

export default function PeriodAnalysis({
  analysis,
}: Props) {
  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-950">
          Analyse de la période
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {formatDate(analysis.startDate)}
          {" → "}
          {formatDate(analysis.endDate)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Composite */}
        <div className="rounded-xl bg-slate-50 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              BRVM Composite
            </span>

            <BarChart3
              size={20}
              className="text-blue-600"
            />
          </div>

          <p className="mt-4 text-2xl font-bold text-slate-950">
            {analysis.compositePerformance !== null
              ? `${analysis.compositePerformance >= 0 ? "+" : ""}${analysis.compositePerformance.toFixed(2)} %`
              : "-"}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Performance sur la période
          </p>
        </div>

        {/* Best */}
        <div className="rounded-xl bg-emerald-50/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Meilleure action
            </span>

            <ArrowUpRight
              size={20}
              className="text-emerald-600"
            />
          </div>

          <p className="mt-4 text-lg font-bold text-slate-950">
            {analysis.bestStock?.symbol ?? "-"}
          </p>

          <p className="mt-1 text-xl font-bold text-emerald-600">
            {analysis.bestStock
              ? `+${analysis.bestStock.performancePercent.toFixed(2)} %`
              : "-"}
          </p>
        </div>

        {/* Worst */}
        <div className="rounded-xl bg-red-50/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Plus forte baisse
            </span>

            <ArrowDownRight
              size={20}
              className="text-red-600"
            />
          </div>

          <p className="mt-4 text-lg font-bold text-slate-950">
            {analysis.worstStock?.symbol ?? "-"}
          </p>

          <p className="mt-1 text-xl font-bold text-red-600">
            {analysis.worstStock
              ? `${analysis.worstStock.performancePercent.toFixed(2)} %`
              : "-"}
          </p>
        </div>

        {/* Volume */}
        <div className="rounded-xl bg-blue-50/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Plus échangée
            </span>

            <Activity
              size={20}
              className="text-blue-600"
            />
          </div>

          <p className="mt-4 text-lg font-bold text-slate-950">
            {analysis.volumeLeader?.symbol ?? "-"}
          </p>

          <p className="mt-1 text-lg font-bold text-blue-600">
            {analysis.volumeLeader
              ? formatVolume(
                  analysis.volumeLeader.totalVolume
                )
              : "-"}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            titres échangés cumulés
          </p>
        </div>
      </div>
    </div>
  );
}