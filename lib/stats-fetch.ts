import { supabase } from "./supabase";

export type DailyView = { day: string; count: number };
export type TopDish = {
  dishId: string;
  name: string;
  count: number;
};
export type LocaleStat = { locale: string; count: number };

export type RestaurantStats = {
  totalViews: number;
  views7d: number;
  views30d: number;
  uniqueSessions: number;
  daily: DailyView[];
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

export async function fetchRestaurantStats(
  restaurantId: string,
  dishesById: Map<string, string>
): Promise<RestaurantStats> {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const { data, error } = await supabase
    .from("restaurant_views")
    .select("dish_id, session_id, locale, viewed_at")
    .eq("restaurant_id", restaurantId)
    .gte("viewed_at", since.toISOString())
    .order("viewed_at", { ascending: false })
    .limit(10000);

  const empty: RestaurantStats = {
    totalViews: 0,
    views7d: 0,
    views30d: 0,
    uniqueSessions: 0,
    daily: buildEmptyDaily(7),
    topDishes: [],
    locales: [],
    lastViewAt: null,
  };

  if (error || !data) return empty;

  const rows = data as ViewRow[];

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  const menuViewsOnly = rows.filter((r) => r.dish_id === null);

  const views30d = menuViewsOnly.length;
  const views7d = menuViewsOnly.filter(
    (r) => new Date(r.viewed_at) >= sevenDaysAgo
  ).length;

  const sessions = new Set<string>();
  for (const r of menuViewsOnly) {
    if (r.session_id) sessions.add(r.session_id);
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

  const dishCount = new Map<string, number>();
  for (const r of rows) {
    if (r.dish_id) {
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
    const loc = r.locale ?? "?";
    localeCount.set(loc, (localeCount.get(loc) ?? 0) + 1);
  }
  const locales: LocaleStat[] = Array.from(localeCount.entries())
    .map(([locale, count]) => ({ locale, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalViews: views30d,
    views7d,
    views30d,
    uniqueSessions: sessions.size,
    daily,
    topDishes,
    locales,
    lastViewAt: rows[0]?.viewed_at ?? null,
  };
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
