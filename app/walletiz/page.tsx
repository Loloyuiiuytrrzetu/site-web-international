"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  PauseCircle,
  TrendingUp,
  UtensilsCrossed,
} from "lucide-react";
import { useRestaurantStore } from "@/lib/store";
import { Card, PageHeader } from "../admin/_components/ui";

const PLAN_PRICE = { starter: 19, pro: 39, enterprise: 99 } as const;

export default function WalletizDashboardPage() {
  const restaurants = useRestaurantStore((s) => s.restaurants);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const active = restaurants.filter((r) => r.status === "active");
  const suspended = restaurants.filter((r) => r.status === "suspended");
  const totalDishes = restaurants.reduce(
    (n, r) => n + r.categories.reduce((m, c) => m + c.dishes.length, 0),
    0
  );
  const mrr = restaurants.reduce(
    (sum, r) => sum + (r.status === "active" ? PLAN_PRICE[r.plan] : 0),
    0
  );

  return (
    <div className="mx-auto max-w-6xl p-5 lg:p-8">
      <PageHeader
        title="Console Walletiz"
        description="Vue d'ensemble de tous vos restaurants clients."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          icon={Building2}
          label="Restaurants"
          value={restaurants.length}
          tone="violet"
        />
        <Kpi
          icon={CheckCircle2}
          label="Actifs"
          value={active.length}
          tone="emerald"
        />
        <Kpi
          icon={PauseCircle}
          label="Suspendus"
          value={suspended.length}
          tone="amber"
        />
        <Kpi
          icon={TrendingUp}
          label="MRR estimé"
          value={`${mrr} €`}
          tone="violet"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card
            title="Derniers restaurants"
            description={`${totalDishes} plats au total sur l'ensemble du parc.`}
          >
            <ul className="divide-y divide-neutral-100">
              {restaurants.slice(0, 5).map((r) => (
                <li
                  key={r.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg font-bold text-white"
                    style={{ backgroundColor: r.theme.primaryColor }}
                  >
                    {r.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-neutral-900">
                      {r.name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Plan {r.plan} · {r.categories.length} catégories
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </li>
              ))}
            </ul>
            <Link
              href="/walletiz/restaurants"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:underline"
            >
              Tous les restaurants <ArrowRight size={12} />
            </Link>
          </Card>
        </div>

        <Card title="Vous (Walletiz)">
          <div className="flex flex-col gap-3 text-sm">
            <Row icon={UtensilsCrossed} label="Restaurants signés" value={String(restaurants.length)} />
            <Row icon={TrendingUp} label="Revenu mensuel" value={`${mrr} €`} />
          </div>
          <Link
            href="/walletiz/restaurants"
            className="mt-5 block w-full rounded-lg bg-violet-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-violet-700"
          >
            Gérer les comptes
          </Link>
        </Card>
      </div>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string | number;
  tone: "violet" | "emerald" | "amber";
}) {
  const tones = {
    violet: "bg-violet-100 text-violet-700",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
  }[tone];
  return (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tones}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-neutral-500">{label}</p>
        <p className="text-xl font-bold text-neutral-900">{value}</p>
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={14} className="text-neutral-400" />
      <span className="text-xs text-neutral-600">{label}</span>
      <span className="ml-auto font-semibold text-neutral-900">{value}</span>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "active"
      ? "bg-emerald-100 text-emerald-700"
      : status === "suspended"
      ? "bg-amber-100 text-amber-700"
      : "bg-neutral-200 text-neutral-700";
  const label =
    status === "active"
      ? "Actif"
      : status === "suspended"
      ? "Suspendu"
      : "Brouillon";
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${styles}`}
    >
      {label}
    </span>
  );
}
