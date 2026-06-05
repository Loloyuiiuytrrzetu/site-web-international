import { supabase } from "./supabase";
import type { Restaurant, Category, Dish, Locale } from "./types";
import type { ManagedRestaurant, RestaurantStatus } from "./store";

type DbDish = {
  id: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  price_amount: number;
  price_currency: string;
  image_url: string | null;
  model3d_url: string | null;
  tags: string[] | null;
  available: boolean;
  allergens: string[] | null;
  translations: Dish["translations"] | null;
  sort_order: number;
};

type DbCategory = {
  id: string;
  name: string;
  tagline: string | null;
  image_url: string | null;
  translations: Category["translations"] | null;
  sort_order: number;
  dishes: DbDish[];
};

type DbRestaurant = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  logo_url: string | null;
  cover_url: string | null;
  locales: string[];
  default_locale: string;
  theme: Restaurant["theme"];
  contact: Restaurant["contact"];
  translations: Restaurant["translations"] | null;
  status: string;
  plan: string | null;
  created_at: string;
  categories: DbCategory[];
};

const SELECT_FULL =
  "id, slug, name, tagline, logo_url, cover_url, locales, default_locale, theme, contact, translations, status, plan, created_at, categories(id, name, tagline, image_url, translations, sort_order, dishes(id, name, subtitle, description, price_amount, price_currency, image_url, model3d_url, tags, available, allergens, translations, sort_order))";

function mapDish(d: DbDish): Dish {
  return {
    id: d.id,
    name: d.name,
    subtitle: d.subtitle ?? undefined,
    description: d.description ?? undefined,
    price: { amount: Number(d.price_amount), currency: d.price_currency },
    imageUrl: d.image_url ?? undefined,
    model3dUrl: d.model3d_url ?? undefined,
    tags: d.tags ?? undefined,
    available: d.available,
    allergens: (d.allergens as Dish["allergens"]) ?? undefined,
    translations: d.translations ?? undefined,
  };
}

function mapCategory(c: DbCategory): Category {
  const dishes = [...c.dishes]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(mapDish);
  return {
    id: c.id,
    name: c.name,
    tagline: c.tagline ?? undefined,
    imageUrl: c.image_url ?? undefined,
    translations: c.translations ?? undefined,
    dishes,
  };
}

function mapRestaurant(r: DbRestaurant): ManagedRestaurant {
  const categories = [...r.categories]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(mapCategory);
  const plan = (r.plan ?? "starter") as ManagedRestaurant["plan"];
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    tagline: r.tagline ?? undefined,
    logoUrl: r.logo_url ?? undefined,
    coverUrl: r.cover_url ?? undefined,
    locales: r.locales as Locale[],
    defaultLocale: r.default_locale as Locale,
    theme: r.theme,
    contact: r.contact,
    translations: r.translations ?? undefined,
    categories,
    status: (r.status as RestaurantStatus) ?? "active",
    plan,
    createdAt: r.created_at,
  };
}

export async function fetchRestaurantBySlug(
  slug: string
): Promise<ManagedRestaurant | null> {
  const { data, error } = await supabase
    .from("restaurants")
    .select(SELECT_FULL)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("fetchRestaurantBySlug error:", error);
    return null;
  }
  if (!data) return null;
  return mapRestaurant(data as unknown as DbRestaurant);
}

export async function fetchRestaurantById(
  id: string
): Promise<ManagedRestaurant | null> {
  const { data, error } = await supabase
    .from("restaurants")
    .select(SELECT_FULL)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("fetchRestaurantById error:", error);
    return null;
  }
  if (!data) return null;
  return mapRestaurant(data as unknown as DbRestaurant);
}

export async function fetchAllManagedRestaurants(): Promise<ManagedRestaurant[]> {
  const { data, error } = await supabase
    .from("restaurants")
    .select(SELECT_FULL)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchAllManagedRestaurants error:", error);
    return [];
  }
  if (!data) return [];
  return (data as unknown as DbRestaurant[]).map(mapRestaurant);
}
