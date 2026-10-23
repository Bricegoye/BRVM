import { notFound, redirect } from "next/navigation";

import DashboardShell from "@/components/dashboard/DashboardShell";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getFundamentalAnalysis } from "@/services/fundamental-analysis.service";

export const dynamic = "force-dynamic";

const OWNER_ID = "ccb46442-f9f2-4ce9-aa8c-4fd8370626c2";

type PageProps = {
  searchParams: Promise<{
    symbol?: string | string[];
  }>;
};

type CompanyOption = {
  companyId: number;
  symbol: string;
  companyName: string;
};

function formatValue(
  value: number | null | undefined,
  suffix = ""
): string {
  if (value == null || !Number.isFinite(value)) {
    return "Indisponible";
  }

  const formatted = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  return suffix ? `${formatted} ${suffix}` : formatted;
}

function formatDate(
  value: string | null | undefined
): string {
  if (!value) {
    return "Non renseignée";
  }

  const date = new Date(`${value.slice(0, 10)}T12:00:00`);

  if (!Number.isFinite(date.getTime())) {
    return "Non renseignée";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getSourceUrl(
  value: string | null | undefined
): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function MetricCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
      <dt className="text-base font-semibold text-slate-700">
        {title}
      </dt>

      <dd className="mt-3 text-2xl font-bold text-slate-950">
        {value}
      </dd>

      <p className="mt-3 text-base leading-relaxed text-slate-600">
        {description}
      </p>
    </div>
  );
}

export default async function FundamentalPreviewPage({
  searchParams,
}: PageProps) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/connexion");
  }

  if (user.id !== OWNER_ID) {
    notFound();
  }

  const { data: companyRows, error: companiesError } =
    await supabase
      .from("companies")
      .select("company_id, symbol, company_name")
      .order("symbol", { ascending: true });

  if (companiesError) {
    throw new Error(
      `Impossible de charger les sociétés : ${companiesError.message}`
    );
  }

  const companies: CompanyOption[] = (companyRows ?? []).map(
    (company) => ({
      companyId: Number(company.company_id),
      symbol: String(company.symbol),
      companyName: String(company.company_name),
    })
  );

  const params = await searchParams;
  const rawSymbol = Array.isArray(params.symbol)
    ? params.symbol[0]
    : params.symbol;

  const requestedSymbol = rawSymbol?.trim().toUpperCase();

  const defaultSymbol =
    companies.find((company) => company.symbol === "SNTS")?.symbol ??
    companies[0]?.symbol ??
    "";

  const selectedSymbol = requestedSymbol || defaultSymbol;

  const selectedCompany = companies.find(
    (company) => company.symbol === selectedSymbol
  );

  if (requestedSymbol && !selectedCompany) {
    notFound();
  }

  const analysis = selectedCompany
    ? await getFundamentalAnalysis(supabase, selectedSymbol)
    : null;

  const report = analysis?.fundamentals.report ?? null;
  const metrics = analysis?.calculatedMetrics ?? null;
  const sourceUrl = getSourceUrl(report?.sourceUrl);

  const usesEstimatedEarnings =
    metrics?.earningsPerShareBasis === "CLOSING_SHARES_ESTIMATE";

  const comparisonDescription = report
    ? `Comparaison de l’exercice ${report.fiscalYear} avec ${report.fiscalYear - 1}.`
    : "Comparaison avec l’exercice précédent.";

  return (
    <DashboardShell>
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <span className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
            Lecture Supabase · accès privé
          </span>

          <h1 className="mt-4 text-3xl font-bold text-slate-950">
            Analyse fondamentale
          </h1>

          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Sélectionne une société pour consulter ses ratios,
            recalculés à partir des données financières accessibles
            à ton compte et du dernier cours enregistré.
          </p>

          <p className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-base leading-relaxed text-blue-900">
            La page relit les données lors de son chargement. Les
            calculs affichés ne sont pas enregistrés en base.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <form
            action="/fondamentaux-preview"
            method="get"
            className="space-y-4"
          >
            <label
              htmlFor="company-symbol"
              className="block text-lg font-semibold text-slate-900"
            >
              Société à analyser
            </label>

            <div className="flex flex-col gap-4 sm:flex-row">
              <select
                key={selectedSymbol}
                id="company-symbol"
                name="symbol"
                defaultValue={selectedSymbol}
                disabled={companies.length === 0}
                className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {companies.length === 0 ? (
                  <option value="">Aucune société disponible</option>
                ) : (
                  companies.map((company) => (
                    <option
                      key={company.companyId}
                      value={company.symbol}
                    >
                      {company.symbol} — {company.companyName}
                    </option>
                  ))
                )}
              </select>

              <button
                type="submit"
                disabled={companies.length === 0}
                className="rounded-xl bg-blue-700 px-6 py-3 text-lg font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Afficher les calculs
              </button>
            </div>

            <p className="text-base text-slate-600">
              {companies.length} sociétés disponibles. La présence
              dans cette liste ne garantit pas la disponibilité
              d’un rapport financier vérifié.
            </p>
          </form>
        </section>

        {selectedCompany && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-base font-semibold text-blue-700">
                  {selectedCompany.symbol}
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  {analysis?.fundamentals.companyName ??
                    selectedCompany.companyName}
                </h2>

                {report ? (
                  <p className="mt-3 text-base text-slate-600">
                    Exercice {report.fiscalYear} ·{" "}
                    {report.isConsolidated
                      ? "Comptes consolidés"
                      : "Comptes individuels"}
                  </p>
                ) : (
                  <p className="mt-3 text-base text-slate-600">
                    Aucun rapport annuel vérifié disponible.
                  </p>
                )}
              </div>

              <div className="sm:text-right">
                <p className="text-base text-slate-600">
                  Cours utilisé pour les calculs
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {formatValue(
                    analysis?.calculationReferencePrice,
                    "FCFA"
                  )}
                </p>

                <p className="mt-2 text-base text-slate-600">
                  {formatDate(analysis?.calculationPriceDate)}
                </p>
              </div>
            </div>

            {metrics ? (
              <dl className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <MetricCard
                  title={usesEstimatedEarnings ? "BPA estimé" : "BPA"}
                  value={formatValue(metrics.earningsPerShare, "FCFA")}
                  description={
                    usesEstimatedEarnings
                      ? "Résultat attribuable aux actionnaires divisé par le nombre d’actions en fin d’exercice."
                      : "Résultat attribuable aux actionnaires divisé par le nombre moyen pondéré d’actions."
                  }
                />

                <MetricCard
                  title={usesEstimatedEarnings ? "PER estimé" : "PER"}
                  value={formatValue(metrics.priceEarningsRatio, "×")}
                  description="Cours de référence divisé par le BPA. Indisponible si le BPA est nul ou négatif."
                />

                <MetricCard
                  title="Valeur comptable par action"
                  value={formatValue(metrics.bookValuePerShare, "FCFA")}
                  description="Capitaux propres attribuables aux actionnaires, divisés par le nombre d’actions."
                />

                <MetricCard
                  title="Price-to-Book"
                  value={formatValue(metrics.priceToBookRatio, "×")}
                  description="Cours de référence divisé par la valeur comptable par action."
                />

                <MetricCard
                  title="Rendement du dividende brut"
                  value={formatValue(metrics.dividendYieldPercent, "%")}
                  description="Dividende brut renseigné, rapporté au cours de référence."
                />

                <MetricCard
                  title="ROE sur capitaux propres moyens"
                  value={formatValue(metrics.returnOnEquityPercent, "%")}
                  description="Résultat attribuable aux actionnaires, rapporté à la moyenne des capitaux propres en début et fin d’exercice."
                />

                <MetricCard
                  title="Marge nette"
                  value={
                    selectedSymbol === "SGBC" &&
                    metrics.netMarginPercent === null
                      ? "Non applicable"
                      : formatValue(metrics.netMarginPercent, "%")
                  }
                  description={
                    selectedSymbol === "SGBC"
                      ? "Ce ratio industriel n’est pas appliqué au produit net bancaire."
                      : "Résultat net total rapporté au chiffre d’affaires, sur le même périmètre comptable."
                  }
                />

                <MetricCard
                  title="Croissance annuelle du chiffre d’affaires"
                  value={formatValue(metrics.revenueGrowthPercent, "%")}
                  description={`${comparisonDescription} Variation du chiffre d’affaires, après conversion des unités. Indisponible si une donnée manque ou si la valeur précédente est nulle ou négative.`}
                />

                <MetricCard
                  title="Croissance annuelle du résultat net"
                  value={formatValue(metrics.netIncomeGrowthPercent, "%")}
                  description={`${comparisonDescription} Variation du résultat net total, après conversion des unités. Indisponible si une donnée manque ou si la valeur précédente est nulle ou négative.`}
                />
              </dl>
            ) : (
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-lg font-semibold text-slate-900">
                  Calculs indisponibles
                </h3>

                <p className="mt-3 text-base leading-relaxed text-slate-600">
                  Les données accessibles ne permettent pas encore
                  de calculer les indicateurs de cette société.
                  Les précisions disponibles sont indiquées
                  ci-dessous.
                </p>
              </div>
            )}

            {analysis && analysis.warnings.length > 0 && (
              <aside className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
                <h3 className="text-lg font-semibold text-amber-950">
                  Précisions sur les calculs
                </h3>

                <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-relaxed text-amber-950">
                  {analysis.warnings.map((warning, index) => (
                    <li key={`${index}-${warning}`}>
                      {warning}
                    </li>
                  ))}
                </ul>
              </aside>
            )}

            {report && (
              <footer className="mt-6 space-y-3 border-t border-slate-200 pt-6 text-base leading-relaxed">
                <p className="font-semibold text-slate-800">
                  Source : {report.sourceName || "Non renseignée"}
                </p>

                <p className="text-slate-600">
                  Publication : {formatDate(report.publicationDate)}
                </p>

                {report.sourcePage != null && (
                  <p className="text-slate-600">
                    Pages renseignées : {report.sourcePage}
                  </p>
                )}

                {sourceUrl && (
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block font-semibold text-blue-700 underline underline-offset-4 hover:text-blue-900"
                  >
                    Consulter le document financier
                  </a>
                )}
              </footer>
            )}
          </section>
        )}
      </div>
    </DashboardShell>
  );
}