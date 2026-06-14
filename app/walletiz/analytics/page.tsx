"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  TrendingUp,
  UtensilsCrossed,
} from "lucide-react";
import { useRestaurantStore } from "@/lib/store";
import { Card, PageHeader } from "../../admin/_components/ui";

const PLAN_PRICE = { pro: 79, custom: 140 } as const;
const PLAN_LABEL = { pro: "Pro", custom: "Sur mesure" } as const;

export default function AnalyticsPage() {
  const restaurants = useRestaurantStore((s) => s.restaurants);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const stats = useMemo(() => {
    const total = restaurants.length;
    const active = restaurants.filter((r) => r.status === "active");
    const suspended = restaurants.filter((r) => r.status === "suspended");
    const draft = restaurants.filter((r) => r.status === "draft");

    const totalDishes = restaurants.reduce(
      (n, r) => n + r.categories.reduce((m, c) => m + c.dishes.length, 0),
      0
    );
    const avgDishes = total > 0 ? Math.round(totalDishes / total) : 0;

    const proRestos = restaurants.filter((r) => r.plan === "pro");
    const customRestos = restaurants.filter((r) => r.plan === "custom");

    const mrr = active.reduce((sum, r) => sum + PLAN_PRICE[r.plan], 0);
    const mrrPro = active
      .filter((r) => r.plan === "pro")
      .reduce((sum) => sum + PLAN_PRICE.pro, 0);
    const mrrCustom = active
      .filter((r) => r.plan === "custom")
      .reduce((sum) => sum + PLAN_PRICE.custom, 0);

    const now = new Date();
    const months: { label: string; count: number; key: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push({
        key,
        label: d.toLocaleDateString("fr-FR", { month: "short" }),
        count: 0,
      });
    }
    for (const r of restaurants) {
      const d = new Date(r.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const m = months.find((mm) => mm.key === key);
      if (m) m.count++;
    }

    const ranked = restaurants
      .map((r) => ({
        r,
        dishes: r.categories.reduce((n, c) => n + c.dishes.length, 0),
      }))
      .sort((a, b) => b.dishes - a.dishes)
      .slice(0, 5);

    return {
      total,
      activeCount: active.length,
      suspendedCount: suspended.length,
      draftCount: draft.length,
      totalDishes,
      avgDishes,
      proCount: proRestos.length,
      customCount: customRestos.length,
      mrr,
      mrrPro,
      mrrCustom,
      arr: mrr * 12,
      months,
      ranked,
    };
  }, [restaurants]);

  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-6xl p-5 lg:p-8">
      <PageHeader
        title="Statistiques"
        description="Activité et revenu de tous vos restaurants clients."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          icon={Building2}
          label="Restaurants"
          value={stats.total}
          tone="violet"
        />
        <Kpi
          icon={CheckCircle2}
          label="Actifs"
          value={stats.activeCount}
          tone="emerald"
        />
        <Kpi
          icon={TrendingUp}
          label="MRR"
          value={`${stats.mrr} €`}
          hint={`${stats.arr} € / an`}
          tone="violet"
        />
        <Kpi
          icon={UtensilsCrossed}
          label="Plats moyen"
          value={stats.avgDishes}
          hint={`${stats.totalDishes} plats au total`}
          tone="amber"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card
          title="Répartition des plans"
          description="Nombre de restaurants et revenu par plan."
        >
          <div className="flex flex-col gap-3">
            <PlanBar
              label={PLAN_LABEL.pro}
              count={stats.proCount}
              total={stats.total}
              mrr={stats.mrrPro}
              color="#1f2937"
            />
            <PlanBar
              label={PLAN_LABEL.custom}
              count={stats.customCount}
              total={stats.total}
              mrr={stats.mrrCustom}
              color="#7a1226"
            />
          </div>
        </Card>

        <Card
          title="Répartition des statuts"
          description="État actuel des comptes."
        >
          <div className="flex flex-col gap-3">
            <StatusBar
              label="Actifs"
              count={stats.activeCount}
              total={stats.total}
              color="#059669"
            />
            <StatusBar
              label="Suspendus"
              count={stats.suspendedCount}
              total={stats.total}
              color="#d97706"
            />
            <StatusBar
              label="Brouillons"
              count={stats.draftCount}
              total={stats.total}
              color="#6b7280"
            />
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <Card
          title="Inscriptions par mois"
          description="Nouveaux restaurants signés sur les 6 derniers mois."
        >
        <div className="flex items-end gap-2 sm:gap-4">
            {stats.months.map((m) => {
              const max = Math.max(1, ...stats.months.map((x) => x.count));
              const h = Math.max(4, Math.round((m.count / max) * 100));
              return (
                <div key={m.key} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-neutral-900">
                    {m.count}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-brand-600"
                    style={{ height: `${h}px`, minHeight: 4 }}
                  />
                  <span className="text-[10px] uppercase tracking-wide text-neutral-500">
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <Card
          title="Top 5 restaurants par nombre de plats"
          description="Les menus les plus garnis."
        >
        {stats.ranked.length === 0 ? (
          <p className="py-6 text-center text-sm text-neutral-500">
            Aucun restaurant pour le moment.
          </p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {stats.ranked.map(({ r, dishes }) => {
              const max = stats.ranked[0]?.dishes || 1;
              const pct = Math.max(8, Math.round((dishes / max) * 100));
              return (
                <li key={r.id}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-neutral-900">
                      {r.name}
                    </span>
                    <span className="text-neutral-500">{dishes} plats</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-brand-600"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string | number;
  hint?: string;
  tone: "violet" | "emerald" | "amber";
}) {
  const tones = {
    violet: "bg-brand-100 text-brand-700",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
  }[tone];
  return (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${tones}`}
      >
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-neutral-500">{label}</p>
        <p className="truncate text-xl font-bold text-neutral-900">{value}</p>
        {hint && <p className="text-[10px] text-neutral-400">{hint}</p>}
      </div>
    </div>
  );
}

function PlanBar({
  label,
  count,
  total,
  mrr,
  color,
}: {
  label: string;
  count: number;
  total: number;
  mrr: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-neutral-900">{label}</span>
        <span className="text-neutral-500">
          {count} resto{count > 1 ? "s" : ""} · {mrr} €/mois
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function StatusBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-neutral-900">{label}</span>
        <span className="text-neutral-500">{count} · {pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
