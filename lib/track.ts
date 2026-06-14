"use client";

import { supabase } from "./supabase";

const SESSION_KEY = "walletiz_session_id";

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

export async function trackMenuView(restaurantId: string, locale?: string) {
  if (!restaurantId) return;
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
  try {
    await supabase.from("restaurant_views").insert({
      restaurant_id: restaurantId,
      dish_id: dishId,
      locale: locale ?? null,
      session_id: getSessionId() || null,
    });
  } catch {}
}
