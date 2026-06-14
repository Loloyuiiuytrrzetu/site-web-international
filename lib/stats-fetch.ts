import { supabase } from "./supabase";

export type DailyView = { day: string; count: number };
export type MonthlyView = { key: string; label: string; count: number };
export type TopDish = {
  dishId: string;
  name: string;
  count: number;
};
export type LocaleStat = { locale: string; count: number };

export type RestaurantStats = {
  viewsWeek: number;
  viewsMonth: number;
  daily: DailyView[];
  monthly: MonthlyView[];
  topDishesByMonth: Record<string, TopDish[]>;
  localesByMonth: Record<string, LocaleStat[]>;
  currentMonthKey: string;
  lastViewAt: string | null;
};

type ViewRow = {
  dish_id: string | null;
  session_id: string | null;
  locale: string | null;
  viewed_at: string;
};

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  return x;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(d: Date): string {
  return d
    .toLocaleDateString("fr-FR", { month: "short" })
    .replace(".", "");
}

function buildYearMonthly(year: number): MonthlyView[] {
  const arr: MonthlyView[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(year, i, 1);
    arr.push({ key: monthKey(d), label: monthLabel(d), count: 0 });
  }
  return arr;
}

function buildEmptyDaily(days: number): DailyView[] {
  const now = new Date();
  const arr: DailyView[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    arr.push({ day: isoDay(d), count: 0 });
  }
  return arr;
}

export async function fetchRestaurantStats(
  restaurantId: string,
  dishesById: Map<string, string>
): Promise<RestaurantStats> {
  const now = new Date();
  const currentYear = now.getFullYear();
  const yearStart = new Date(currentYear, 0, 1);
  const currentMonthKey = monthKey(now);

  const { data, error } = await supabase
    .from("restaurant_views")
    .select("dish_id, session_id, locale, viewed_at")
    .eq("restaurant_id", restaurantId)
    .gte("viewed_at", yearStart.toISOString())
    .order("viewed_at", { ascending: false })
    .limit(50000);

  const empty: RestaurantStats = {
    viewsWeek: 0,
    viewsMonth: 0,
    daily: buildEmptyDaily(7),
    monthly: buildYearMonthly(currentYear),
    topDishesByMonth: {},
    localesByMonth: {},
    currentMonthKey,
    lastViewAt: null,
  };

  if (error || !data) return empty;

  const rows = data as ViewRow[];

  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);

  const menuViewsOnly = rows.filter((r) => r.dish_id === null);

  const viewsMonth = menuViewsOnly.filter(
    (r) => new Date(r.viewed_at) >= monthStart
  ).length;
  const viewsWeek = menuViewsOnly.filter(
    (r) => new Date(r.viewed_at) >= weekStart
  ).length;

  const monthly = buildYearMonthly(currentYear);
  const monthlyMap = new Map(monthly.map((m) => [m.key, m] as const));
  for (const r of menuViewsOnly) {
    const d = new Date(r.viewed_at);
    const key = monthKey(d);
    const entry = monthlyMap.get(key);
    if (entry) entry.count++;
  }

  const dailyMap = new Map<string, number>();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    dailyMap.set(isoDay(d), 0);
  }
  for (const r of menuViewsOnly) {
    const day = isoDay(new Date(r.viewed_at));
    if (dailyMap.has(day)) {
      dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1);
    }
  }
  const daily: DailyView[] = Array.from(dailyMap.entries()).map(
    ([day, count]) => ({ day, count })
  );

  const dishesPerMonth = new Map<string, Map<string, number>>();
  for (const r of rows) {
    if (!r.dish_id) continue;
    const key = monthKey(new Date(r.viewed_at));
    if (!monthlyMap.has(key)) continue;
    const inner = dishesPerMonth.get(key) ?? new Map<string, number>();
    inner.set(r.dish_id, (inner.get(r.dish_id) ?? 0) + 1);
    dishesPerMonth.set(key, inner);
  }
  const topDishesByMonth: Record<string, TopDish[]> = {};
  for (const m of monthly) {
    const inner = dishesPerMonth.get(m.key) ?? new Map<string, number>();
    topDishesByMonth[m.key] = Array.from(inner.entries())
      .map(([dishId, count]) => ({
        dishId,
        name: dishesById.get(dishId) ?? "Plat supprimé",
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  const localesPerMonth = new Map<string, Map<string, number>>();
  for (const r of menuViewsOnly) {
    const key = monthKey(new Date(r.viewed_at));
    if (!monthlyMap.has(key)) continue;
    const inner = localesPerMonth.get(key) ?? new Map<string, number>();
    const loc = r.locale ?? "?";
    inner.set(loc, (inner.get(loc) ?? 0) + 1);
    localesPerMonth.set(key, inner);
  }
  const localesByMonth: Record<string, LocaleStat[]> = {};
  for (const m of monthly) {
    const inner = localesPerMonth.get(m.key) ?? new Map<string, number>();
    localesByMonth[m.key] = Array.from(inner.entries())
      .map(([locale, count]) => ({ locale, count }))
      .sort((a, b) => b.count - a.count);
  }

  return {
    viewsWeek,
    viewsMonth,
    daily,
    monthly,
    topDishesByMonth,
    localesByMonth,
    currentMonthKey,
    lastViewAt: rows[0]?.viewed_at ?? null,
  };
}
