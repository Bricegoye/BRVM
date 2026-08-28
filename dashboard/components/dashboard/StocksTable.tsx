"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import type { StockRow } from "@/services/stock.service";

type Props = {
  stocks: StockRow[];
};

const ITEMS_PER_PAGE = 10;

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatVolume(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value);
}

function Variation({
  value,
}: {
  value: number;
}) {
  const positive = value > 0;
  const negative = value < 0;

  return (
    <div
      className={`inline-flex items-center justify-end gap-1 font-semibold ${
        positive
          ? "text-emerald-600"
          : negative
            ? "text-red-600"
            : "text-slate-500"
      }`}
    >
      {positive && <TrendingUp size={15} />}
      {negative && <TrendingDown size={15} />}

      <span>
        {positive ? "+" : ""}
        {value.toFixed(2)} %
      </span>
    </div>
  );
}

export default function StocksTable({
  stocks,
}: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredStocks = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return stocks;
    }

    return stocks.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(query) ||
        stock.companyName.toLowerCase().includes(query)
    );
  }, [stocks, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredStocks.length / ITEMS_PER_PAGE)
  );

  const currentPage = Math.min(page, totalPages);

  const visibleStocks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredStocks.slice(
      start,
      start + ITEMS_PER_PAGE
    );
  }, [filteredStocks, currentPage]);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}

      <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            Toutes les actions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {stocks.length} sociétés cotées
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              handleSearch(event.target.value)
            }
            placeholder="Rechercher une société..."
            aria-label="Rechercher une société"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {filteredStocks.length > 0 ? (
        <>
          {/* Affichage mobile */}

          <div className="divide-y divide-slate-100 md:hidden">
            {visibleStocks.map((stock) => (
              <article
                key={stock.companyId}
                className="p-4 transition hover:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-950">
                      {stock.symbol}
                    </p>

                    <p className="mt-1 truncate text-sm text-slate-500">
                      {stock.companyName}
                    </p>
                  </div>

                  <Variation
                    value={stock.variationPercent}
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-3">
                  <div>
                    <p className="text-xs text-slate-400">
                      Cours
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {formatPrice(stock.closePrice)}
                      <span className="ml-1 text-xs font-normal text-slate-400">
                        FCFA
                      </span>
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400">
                      Volume
                    </p>

                    <p className="mt-1 font-semibold text-slate-700">
                      {formatVolume(stock.volume)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Tableau tablette et ordinateur */}

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Symbole
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Société
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Cours
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Variation
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Volume
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleStocks.map((stock) => (
                  <tr
                    key={stock.companyId}
                    className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-950">
                        {stock.symbol}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700">
                        {stock.companyName}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <span className="font-semibold text-slate-900">
                        {formatPrice(stock.closePrice)}
                      </span>

                      <span className="ml-1 text-xs text-slate-400">
                        FCFA
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <Variation
                        value={stock.variationPercent}
                      />
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-slate-700">
                      {formatVolume(stock.volume)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-700">
            Aucune société trouvée
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Essaie un autre symbole ou nom de société.
          </p>
        </div>
      )}

      {/* Footer et pagination */}

      <div className="flex items-center justify-between gap-4 border-t border-slate-100 px-4 py-4 sm:px-6">
        <p className="text-xs text-slate-400">
          {filteredStocks.length} résultat
          {filteredStocks.length !== 1 ? "s" : ""}
        </p>

        {filteredStocks.length > ITEMS_PER_PAGE && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setPage((current) =>
                  Math.max(1, current - 1)
                )
              }
              disabled={currentPage === 1}
              aria-label="Page précédente"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={17} />
            </button>

            <span className="min-w-16 text-center text-xs font-medium text-slate-500">
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setPage((current) =>
                  Math.min(totalPages, current + 1)
                )
              }
              disabled={currentPage === totalPages}
              aria-label="Page suivante"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}