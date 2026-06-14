"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Eye,
  TrendingUp,
} from "lucide-react";
import { useCurrentRestaurant } from "@/lib/store";
import {
  fetchRestaurantStats,
  type RestaurantStats,
} from "@/lib/stats-fetch";
import { Card, PageHeader } from "../_components/ui";

const LOCALE_LABEL: Record<string, string> = {
  fr: "Français",
  en: "English",
  ar: "العربية",
  es: "Español",
  it: "Italiano",
  de: "Deutsch",
  pt: "Português",
  zh: "简体中文",
  "?": "Inconnue",
};

const MONTH_FULL: Record<string, string> = {
  janv: "janvier",
  févr: "février",
  mars: "mars",
  avr: "avril",
  mai: "mai",
  juin: "juin",
  juil: "juillet",
  août: "août",
  sept: "septembre",
  oct: "octobre",
  nov: "novembre",
  déc: "décembre",
};

export default function StatsPage() {
  const restaurant = useCurrentRestaurant();
  const [stats, setStats] = useState<RestaurantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>("");

  const dishesById = useMemo(() => {
    const map = new Map<string, string>();
    if (!restaurant) return map;
    for (const c of restaurant.categories) {
      for (const d of c.dishes) {
        map.set(d.id, d.name);
      }
    }
    return map;
  }, [restaurant]);

  useEffect(() => {
    if (!restaurant) return;
    setLoading(true);
    fetchRestaurantStats(restaurant.id, dishesById)
      .then((s) => {
        setStats(s);
        setSelectedMonthKey(s.currentMonthKey);
      })
      .finally(() => setLoading(false));
  }, [restaurant, dishesById]);

  if (!restaurant) return null;

  const currentYear = new Date().getFullYear();

  const selectedMonth = stats?.monthly.find(
    (m) => m.key === selectedMonthKey
  );
  const selectedLabel = selectedMonth
    ? `${MONTH_FULL[selectedMonth.label] ?? selectedMonth.label} ${currentYear}`
    : "";

  const topDishes = stats?.topDishesByMonth[selectedMonthKey] ?? [];
  const locales = stats?.localesByMonth[selectedMonthKey] ?? [];

  return (
    <div className="mx-auto max-w-5xl p-5 lg:p-8">
      <PageHeader
        title="Statistiques"
        description="Suivez l'engagement de vos clients sur votre menu."
      />

      {loading && !stats ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">
          Chargement des statistiques...
        </div>
      ) : !stats || stats.viewsMonth === 0 ? (
        <Card>
          <div className="py-10 text-center">
            <p className="text-6xl">📊</p>
            <h3 className="mt-4 text-base font-semibold text-neutral-900">
              Pas encore de visites
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              Dès que vos clients scanneront votre QR code, leurs visites
              apparaîtront ici.
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Kpi
              icon={Eye}
              label="Cette semaine"
              value={stats.viewsWeek}
              hint="Depuis lundi"
              tone="violet"
            />
            <Kpi
              icon={Calendar}
              label="Ce mois-ci"
              value={stats.viewsMonth}
              hint="Depuis le 1er"
              tone="emerald"
            />
            <Kpi
              icon={TrendingUp}
              label="Dernière visite"
              value={
                stats.lastViewAt
                  ? formatRelative(stats.lastViewAt)
                  : "—"
              }
              tone="amber"
            />
          </div>

          <div className="mt-6">
            <Card
              title={`Historique mensuel ${currentYear}`}
              description="Cliquez sur un mois pour voir les plats et langues consultés."
            >
              <div className="flex items-end gap-1 sm:gap-2">
                {stats.monthly.map((m) => {
                  const max = Math.max(1, ...stats.monthly.map((x) => x.count));
                  const h = Math.max(4, Math.round((m.count / max) * 140));
                  const isSelected = m.key === selectedMonthKey;
                  return (
                    <button
                      type="button"
                      key={m.key}
                      onClick={() => setSelectedMonthKey(m.key)}
                      className="group flex flex-1 flex-col items-center gap-1 rounded-md px-0.5 py-1 transition hover:bg-neutral-50"
                    >
                      <span
                        className={`text-[10px] font-semibold sm:text-xs ${
                          isSelected ? "text-brand-700" : "text-neutral-900"
                        }`}
                      >
                        {m.count}
                      </span>
                      <div
                        className={`w-full rounded-t-md transition ${
                          isSelected ? "bg-brand-700" : "bg-brand-600 opacity-70 group-hover:opacity-100"
                        }`}
                        style={{ height: `${h}px`, minHeight: 4 }}
                      />
                      <span
                        className={`text-[9px] uppercase tracking-wide sm:text-[10px] ${
                          isSelected
                            ? "font-bold text-brand-700"
                            : "text-neutral-500"
                        }`}
                      >
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="mt-4">
            <Card
              title="Vues sur les 7 derniers jours"
              description="Nombre de scans et consultations par jour."
            >
              <div className="flex items-end gap-2 sm:gap-3">
                {stats.daily.map((d) => {
                  const max = Math.max(1, ...stats.daily.map((x) => x.count));
                  const h = Math.max(4, Math.round((d.count / max) * 140));
                  return (
                    <div
                      key={d.day}
                      className="flex flex-1 flex-col items-center gap-1"
                    >
                      <span className="text-xs font-semibold text-neutral-900">
                        {d.count}
                      </span>
                      <div
                        className="w-full rounded-t-md bg-brand-600"
                        style={{ height: `${h}px`, minHeight: 4 }}
                      />
                      <span className="text-[10px] uppercase tracking-wide text-neutral-500">
                        {formatDay(d.day)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Card
              title={`Top 5 plats — ${selectedLabel}`}
              description="Les plats qui intéressent le plus vos clients ce mois-là."
            >
              {topDishes.length === 0 ? (
                <p className="py-4 text-center text-sm text-neutral-500">
                  Aucun plat consulté pour ce mois.
                </p>
              ) : (
                <ul className="flex flex-col gap-2.5">
                  {topDishes.map((d, i) => {
                    const max = topDishes[0]?.count || 1;
                    const pct = Math.max(8, Math.round((d.count / max) * 100));
                    return (
                      <li key={d.dishId}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="font-medium text-neutral-900">
                            {i + 1}. {d.name}
                          </span>
                          <span className="text-neutral-500">
                            {d.count} vue{d.count > 1 ? "s" : ""}
                          </span>
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

            <Card
              title={`Langues — ${selectedLabel}`}
              description="Quelles langues vos clients préfèrent ce mois-là."
            >
              {locales.length === 0 ? (
                <p className="py-4 text-center text-sm text-neutral-500">
                  Aucune donnée pour ce mois.
                </p>
              ) : (
                <ul className="flex flex-col gap-2.5">
                  {locales.map((l) => {
                    const max = locales[0]?.count || 1;
                    const pct = Math.max(8, Math.round((l.count / max) * 100));
                    return (
                      <li key={l.locale}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="font-medium text-neutral-900">
                            {LOCALE_LABEL[l.locale] ?? l.locale}
                          </span>
                          <span className="text-neutral-500">
                            {l.count} vue{l.count > 1 ? "s" : ""}
                          </span>
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
        </>
      )}

      <p className="mt-5 text-xs text-neutral-500">
        💡 « Cette semaine » se réinitialise chaque lundi. L'historique annuel
        se réinitialise au 1er janvier de chaque année.
      </p>
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
        <p className="truncate text-lg font-bold text-neutral-900">{value}</p>
        {hint && <p className="text-[10px] text-neutral-400">{hint}</p>}
      </div>
    </div>
  );
}

function formatDay(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", "");
}

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.round(diffMs / 60_000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 7) return `il y a ${diffD} j`;
  return d.toLocaleDateString("fr-FR");
}
