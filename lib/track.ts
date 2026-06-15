"use client";

import { supabase } from "./supabase";

const SESSION_KEY = "walletiz_session_id";
const DEDUP_WINDOW_MS = 24 * 60 * 60 * 1000;

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

function wasRecent(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const ts = localStorage.getItem(key);
    if (!ts) return false;
    const t = Number(ts);
    if (!Number.isFinite(t)) return false;
    return Date.now() - t < DEDUP_WINDOW_MS;
  } catch {
    return false;
  }
}

function markNow(key: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, String(Date.now()));
  } catch {}
}

export async function trackMenuView(restaurantId: string, locale?: string) {
  if (!restaurantId) return;
  const key = `walletiz_last_menu_${restaurantId}_${locale ?? "?"}`;
  if (wasRecent(key)) return;
  markNow(key);
  try {
    await supabase.from("restaurant_views").insert({
      restaurant_id: restaurantId,
      dish_id: null,
      locale: locale ?? null,
      session_id: getSessionId() || null,
    });
  } catch {}
}

export async function trackDishView(
  restaurantId: string,
  dishId: string,
  locale?: string
) {
  if (!restaurantId || !dishId) return;
  const key = `walletiz_last_dish_${dishId}_${locale ?? "?"}`;
  if (wasRecent(key)) return;
  markNow(key);
  try {
    await supabase.from("restaurant_views").insert({
      restaurant_id: restaurantId,
      dish_id: dishId,
      locale: locale ?? null,
      session_id: getSessionId() || null,
    });
  } catch {}
}
