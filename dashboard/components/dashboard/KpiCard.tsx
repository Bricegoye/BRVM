type Props = {
  title: string;
  value: string;
  variation?: number | null;
  subtitle?: string;
};

export default function KpiCard({
  title,
  value,
  variation,
  subtitle,
}: Props) {
  const positive = (variation ?? 0) >= 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <div className="mt-3 flex items-end justify-between gap-4">
        <p className="text-2xl font-bold text-slate-950">
          {value}
        </p>

        {variation !== undefined && variation !== null && (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              positive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {positive ? "+" : ""}
            {variation.toFixed(2)} %
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-slate-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}