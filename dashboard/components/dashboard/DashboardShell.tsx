import type { ReactNode } from "react";

import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

type Props = {
  children: ReactNode;
};

export default function DashboardShell({
  children,
}: Props) {
  return (
    <main className="min-h-screen bg-slate-50">
      <DashboardSidebar />

      <section
        className="
          min-h-screen
          min-w-0
          px-4
          pb-24
          pt-20
          sm:px-6
          lg:ml-64
          lg:px-8
          lg:pb-8
          lg:pt-8
        "
      >
        <div className="mx-auto w-full max-w-[1600px]">
          {children}
        </div>
      </section>
    </main>
  );
}