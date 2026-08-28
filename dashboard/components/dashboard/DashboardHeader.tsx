type Props = {
  sessionDate: string;
};

export default function DashboardHeader({
  sessionDate,
}: Props) {
  const parsedDate = sessionDate
    ? new Date(`${sessionDate}T12:00:00`)
    : null;

  const formattedDate =
    parsedDate && !Number.isNaN(parsedDate.getTime())
      ? new Intl.DateTimeFormat("fr-FR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }).format(parsedDate)
      : "Date indisponible";

  return (
    <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">
          Vue d’ensemble du marché
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Analyse de la dernière séance BRVM
        </p>
      </div>

      <div className="flex w-full shrink-0 items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:block sm:w-auto sm:min-w-40">
        <p className="text-xs text-slate-400">
          Dernière séance
        </p>

        <p className="font-semibold text-slate-800 sm:mt-1">
          {formattedDate}
        </p>
      </div>
    </header>
  );
}