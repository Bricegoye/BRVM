import DashboardShell from "@/components/dashboard/DashboardShell";
import StocksTable from "@/components/dashboard/StocksTable";

import {
  getLatestStocks,
} from "@/services/stock.service";

export const revalidate = 3600;

export default async function ActionsPage() {
  const stocks = await getLatestStocks();

  return (
    <DashboardShell>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-950">
          Actions BRVM
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Consulte les dernières cotations des sociétés présentes sur la BRVM.
        </p>
      </div>

      <StocksTable stocks={stocks} />
    </DashboardShell>
  );
}