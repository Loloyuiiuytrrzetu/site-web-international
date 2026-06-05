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
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.tagline !== undefined) row.tagline = patch.tagline || null;
  if (patch.logoUrl !== undefined) row.logo_url = patch.logoUrl || null;
  if (patch.coverUrl !== undefined) row.cover_url = patch.coverUrl || null;
  const { error } = await supabase.from("restaurants").update(row).eq("id", id);
  if (error) logError("updateRestaurantInfo", error);
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
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.tagline !== undefined) row.tagline = patch.tagline || null;
  if (patch.imageUrl !== undefined) row.image_url = patch.imageUrl || null;
  if (patch.translations !== undefined) row.translations = patch.translations ?? null;
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
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.subtitle !== undefined) row.subtitle = patch.subtitle || null;
  if (patch.description !== undefined) row.description = patch.description || null;
  if (patch.price !== undefined) {
    row.price_amount = patch.price.amount;
    row.price_currency = patch.price.currency;
  }
  if (patch.imageUrl !== undefined) row.image_url = patch.imageUrl || null;
  if (patch.model3dUrl !== undefined) row.model3d_url = patch.model3dUrl || null;
  if (patch.tags !== undefined) row.tags = patch.tags ?? null;
  if (patch.available !== undefined) row.available = patch.available;
  if (patch.allergens !== undefined) row.allergens = patch.allergens ?? null;
  if (patch.translations !== undefined) row.translations = patch.translations ?? null;
  const { error } = await supabase.from("dishes").update(row).eq("id", id);
  if (error) logError("updateDishRow", error);
}

export async function deleteDishRow(id: string) {
  const { error } = await supabase.from("dishes").delete().eq("id", id);
  if (error) logError("deleteDishRow", error);
}
