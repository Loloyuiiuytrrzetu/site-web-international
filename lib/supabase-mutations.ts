import { supabase } from "./supabase";
import type { Category, Dish, Restaurant, RestaurantContact, RestaurantTheme } from "./types";

function logError(scope: string, error: unknown) {
  console.error(`[supabase-mutations] ${scope}:`, error);
}

export async function updateRestaurantInfo(
  id: string,
  patch: Partial<Pick<Restaurant, "name" | "tagline" | "logoUrl" | "coverUrl">>
) {
  const row: Record<string, unknown> = {};
  if ("name" in patch && patch.name) row.name = patch.name;
  if ("tagline" in patch) row.tagline = patch.tagline || null;
  if ("logoUrl" in patch) row.logo_url = patch.logoUrl || null;
  if ("coverUrl" in patch) row.cover_url = patch.coverUrl || null;
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from("restaurants").update(row).eq("id", id);
  if (error) logError("updateRestaurantInfo", error);
}

export async function updateRestaurantStatusRow(
  id: string,
  status: "active" | "suspended" | "draft"
) {
  const { error } = await supabase
    .from("restaurants")
    .update({ status })
    .eq("id", id);
  if (error) logError("updateRestaurantStatusRow", error);
}

export async function updateRestaurantTranslations(
  id: string,
  translations: Restaurant["translations"]
) {
  const { error } = await supabase
    .from("restaurants")
    .update({ translations: translations ?? null })
    .eq("id", id);
  if (error) logError("updateRestaurantTranslations", error);
}

export async function updateRestaurantTheme(id: string, theme: RestaurantTheme) {
  const { error } = await supabase
    .from("restaurants")
    .update({ theme })
    .eq("id", id);
  if (error) logError("updateRestaurantTheme", error);
}

export async function updateRestaurantContact(
  id: string,
  contact: RestaurantContact
) {
  const { error } = await supabase
    .from("restaurants")
    .update({ contact })
    .eq("id", id);
  if (error) logError("updateRestaurantContact", error);
}

export async function insertCategory(
  restaurantId: string,
  category: Category & { sort_order: number }
) {
  const { error } = await supabase.from("categories").insert({
    id: category.id,
    restaurant_id: restaurantId,
    name: category.name,
    tagline: category.tagline || null,
    image_url: category.imageUrl || null,
    translations: category.translations ?? null,
    sort_order: category.sort_order,
  });
  if (error) logError("insertCategory", error);
}

export async function updateCategoryRow(
  id: string,
  patch: Partial<Omit<Category, "id" | "dishes">>
) {
  const row: Record<string, unknown> = {};
  if ("name" in patch && patch.name) row.name = patch.name;
  if ("tagline" in patch) row.tagline = patch.tagline || null;
  if ("imageUrl" in patch) row.image_url = patch.imageUrl || null;
  if ("translations" in patch) row.translations = patch.translations ?? null;
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from("categories").update(row).eq("id", id);
  if (error) logError("updateCategoryRow", error);
}

export async function deleteCategoryRow(id: string) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) logError("deleteCategoryRow", error);
}

export async function insertDish(
  categoryId: string,
  dish: Dish & { sort_order: number }
) {
  const { error } = await supabase.from("dishes").insert({
    id: dish.id,
    category_id: categoryId,
    name: dish.name,
    subtitle: dish.subtitle || null,
    description: dish.description || null,
    price_amount: dish.price.amount,
    price_currency: dish.price.currency,
    image_url: dish.imageUrl || null,
    model3d_url: dish.model3dUrl || null,
    tags: dish.tags ?? null,
    available: dish.available,
    allergens: dish.allergens ?? null,
    translations: dish.translations ?? null,
    sort_order: dish.sort_order,
  });
  if (error) logError("insertDish", error);
}

export async function updateDishRow(
  id: string,
  patch: Partial<Omit<Dish, "id">>
) {
  const row: Record<string, unknown> = {};
  if ("name" in patch && patch.name) row.name = patch.name;
  if ("subtitle" in patch) row.subtitle = patch.subtitle || null;
  if ("description" in patch) row.description = patch.description || null;
  if ("price" in patch && patch.price) {
    row.price_amount = patch.price.amount;
    row.price_currency = patch.price.currency;
  }
  if ("imageUrl" in patch) row.image_url = patch.imageUrl || null;
  if ("model3dUrl" in patch) row.model3d_url = patch.model3dUrl || null;
  if ("tags" in patch) row.tags = patch.tags ?? null;
  if ("available" in patch) row.available = patch.available;
  if ("allergens" in patch) row.allergens = patch.allergens ?? null;
  if ("translations" in patch) row.translations = patch.translations ?? null;
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from("dishes").update(row).eq("id", id);
  if (error) logError("updateDishRow", error);
}

export async function deleteDishRow(id: string) {
  const { error } = await supabase.from("dishes").delete().eq("id", id);
  if (error) logError("deleteDishRow", error);
}
