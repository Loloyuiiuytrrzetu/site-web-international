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
  topDishes: TopDish[];
  locales: LocaleStat[];
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

export async function fetchRestaurantStats(
  restaurantId: string,
  dishesById: Map<string, string>
): Promise<RestaurantStats> {
  const now = new Date();
  const historyStart = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const { data, error } = await supabase
    .from("restaurant_views")
    .select("dish_id, session_id, locale, viewed_at")
    .eq("restaurant_id", restaurantId)
    .gte("viewed_at", historyStart.toISOString())
    .order("viewed_at", { ascending: false })
    .limit(50000);

  const empty: RestaurantStats = {
    viewsWeek: 0,
    viewsMonth: 0,
    daily: buildEmptyDaily(7),
    monthly: buildEmptyMonthly(12),
    topDishes: [],
    locales: [],
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

  const monthlyMap = new Map<string, number>();
  const monthlyList: MonthlyView[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("fr-FR", {
      month: "short",
      year: "2-digit",
    });
    monthlyMap.set(key, 0);
    monthlyList.push({ key, label, count: 0 });
  }
  for (const r of menuViewsOnly) {
    const d = new Date(r.viewed_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (monthlyMap.has(key)) {
      monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + 1);
    }
  }
  const monthly: MonthlyView[] = monthlyList.map((m) => ({
    ...m,
    count: monthlyMap.get(m.key) ?? 0,
  }));

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

  const dishCount = new Map<string, number>();
  for (const r of rows) {
    if (r.dish_id && new Date(r.viewed_at) >= monthStart) {
      dishCount.set(r.dish_id, (dishCount.get(r.dish_id) ?? 0) + 1);
    }
  }
  const topDishes: TopDish[] = Array.from(dishCount.entries())
    .map(([dishId, count]) => ({
      dishId,
      name: dishesById.get(dishId) ?? "Plat supprimé",
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const localeCount = new Map<string, number>();
  for (const r of menuViewsOnly) {
    if (new Date(r.viewed_at) >= monthStart) {
      const loc = r.locale ?? "?";
      localeCount.set(loc, (localeCount.get(loc) ?? 0) + 1);
    }
  }
  const locales: LocaleStat[] = Array.from(localeCount.entries())
    .map(([locale, count]) => ({ locale, count }))
    .sort((a, b) => b.count - a.count);

  return {
    viewsWeek,
    viewsMonth,
    daily,
    monthly,
    topDishes,
    locales,
    lastViewAt: rows[0]?.viewed_at ?? null,
  };
}

function buildEmptyMonthly(months: number): MonthlyView[] {
  const now = new Date();
  const arr: MonthlyView[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("fr-FR", {
      month: "short",
      year: "2-digit",
    });
    arr.push({ key, label, count: 0 });
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
