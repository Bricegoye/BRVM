"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  Activity,
  BarChart3,
  Building2,
  History,
  Info,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";

const menu = [
  {
    label: "Vue d’ensemble",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    label: "Actions",
    icon: Building2,
    href: "/actions",
  },
  {
    label: "Indices",
    icon: BarChart3,
    href: "/indices",
  },
  {
    label: "Activité du marché",
    icon: Activity,
    href: "/activity",
  },
  {
    label: "Historique",
    icon: History,
    href: "/history",
  },
  {
    label: "À propos",
    icon: Info,
    href: "/about",
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  }

  function Navigation() {
    return (
      <>
        <div className="mb-10">
          <div className="text-xl font-bold text-white">
            BRVM Analytics
          </div>

          <p className="mt-1 text-xs text-slate-400">
            Market Intelligence Platform
          </p>
        </div>

        <nav className="space-y-2">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() =>
                  setMobileOpen(false)
                }
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Icon size={18} />

                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-xl bg-slate-900 p-4">
          <p className="text-xs text-slate-400">
            Collecte automatique
          </p>

          <div className="mt-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />

            <span className="text-sm font-medium text-white">
              Opérationnelle
            </span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* ====================== */}
      {/* DESKTOP SIDEBAR */}
      {/* ====================== */}

      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col bg-slate-950 px-5 py-7 lg:flex">
        <Navigation />
      </aside>

      {/* ====================== */}
      {/* MOBILE HEADER */}
      {/* ====================== */}

      <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <div>
          <p className="font-bold text-slate-950">
            BRVM Analytics
          </p>

          <p className="text-[10px] text-slate-400">
            Market Intelligence Platform
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setMobileOpen(true)
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700"
          aria-label="Ouvrir le menu"
        >
          <Menu size={21} />
        </button>
      </header>

      {/* ====================== */}
      {/* MOBILE OVERLAY */}
      {/* ====================== */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={() =>
            setMobileOpen(false)
          }
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
        />
      )}

      {/* ====================== */}
      {/* MOBILE DRAWER */}
      {/* ====================== */}

      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 flex w-[280px] flex-col bg-slate-950 px-5 py-7 transition-transform duration-300 lg:hidden ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={() =>
            setMobileOpen(false)
          }
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-slate-300"
          aria-label="Fermer le menu"
        >
          <X size={18} />
        </button>

        <Navigation />
      </aside>
    </>
  );
}