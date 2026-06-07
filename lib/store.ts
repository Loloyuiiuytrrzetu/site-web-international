"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Category,
  Dish,
  Restaurant,
  RestaurantContact,
  RestaurantTheme,
  Translatable,
} from "./types";
import { demoRestaurant } from "./demo-restaurant";
import {
  deleteCategoryRow,
  deleteDishRow,
  insertCategory,
  insertDish,
  updateCategoryRow,
  updateDishRow,
  updateRestaurantContact,
  updateRestaurantInfo,
  updateRestaurantPlanRow,
  updateRestaurantStatusRow,
  updateRestaurantTheme,
  updateRestaurantTranslations,
} from "./supabase-mutations";
import {
  callTranslate,
  debouncedTranslate,
  mergeFieldTranslation,
} from "./translate-client";

export type RestaurantStatus = "active" | "suspended" | "draft";

export type ManagedRestaurant = Restaurant & {
  status: RestaurantStatus;
  createdAt: string;
  plan: "pro" | "custom";
};

type State = {
  restaurants: ManagedRestaurant[];
  currentRestaurantId: string;
};

type Actions = {
  reset: () => void;
  setCurrentRestaurant: (id: string) => void;
  loadFromSupabase: (restaurant: ManagedRestaurant) => void;
  loadAllFromSupabase: (restaurants: ManagedRestaurant[]) => void;
  createRestaurant: (
    init: Pick<Restaurant, "name" | "slug"> &
      Partial<Pick<Restaurant, "tagline" | "defaultLocale">> & {
        plan?: ManagedRestaurant["plan"];
      }
  ) => string;
  deleteRestaurant: (id: string) => Promise<void>;
  updateRestaurantStatus: (id: string, status: RestaurantStatus) => void;
  updateRestaurantPlan: (id: string, plan: ManagedRestaurant["plan"]) => void;

  updateInfo: (
    patch: Partial<Pick<Restaurant, "name" | "tagline" | "logoUrl" | "coverUrl">>
  ) => void;
  updateTheme: (patch: Partial<RestaurantTheme>) => void;
  updateContact: (patch: Partial<RestaurantContact>) => void;
  addCategory: (cat: Omit<Category, "id" | "dishes">) => void;
  updateCategory: (
    id: string,
    patch: Partial<Omit<Category, "id" | "dishes">>
  ) => void;
  deleteCategory: (id: string) => void;
  addDish: (categoryId: string, dish: Omit<Dish, "id">) => void;
  updateDish: (
    categoryId: string,
    dishId: string,
    patch: Partial<Omit<Dish, "id">>
  ) => void;
  deleteDish: (categoryId: string, dishId: string) => void;
};

const uid = () => Math.random().toString(36).slice(2, 10);

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : uid();

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const initialDemo: ManagedRestaurant = {
  ...demoRestaurant,
  status: "active",
  plan: "pro",
  createdAt: "2025-01-15T10:00:00Z",
};

const initialState: State = {
  restaurants: [initialDemo],
  currentRestaurantId: initialDemo.id,
};

function mapCurrent<T extends State>(
  state: T,
  updater: (r: ManagedRestaurant) => ManagedRestaurant
): T {
  return {
    ...state,
    restaurants: state.restaurants.map((r) =>
      r.id === state.currentRestaurantId ? updater(r) : r
    ),
  };
}

export const useRestaurantStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initialState,

      reset: () => set(initialState),

      setCurrentRestaurant: (id) => set({ currentRestaurantId: id }),

      loadFromSupabase: (restaurant) =>
        set({
          restaurants: [restaurant],
          currentRestaurantId: restaurant.id,
        }),

      loadAllFromSupabase: (restaurants) =>
        set((s) => {
          const stillHasCurrent = restaurants.some(
            (r) => r.id === s.currentRestaurantId
          );
          return {
            restaurants,
            currentRestaurantId: stillHasCurrent
              ? s.currentRestaurantId
              : restaurants[0]?.id ?? "",
          };
        }),

      createRestaurant: (init) => {
        const id = newId();
        const baseSlug = init.slug || slugify(init.name);
        const newR: ManagedRestaurant = {
          id,
          slug: baseSlug || id,
          name: init.name,
          tagline: init.tagline,
          locales: ["fr", "en", "ar", "es", "it", "de", "pt", "zh"],
          defaultLocale: init.defaultLocale ?? "fr",
          theme: {
            primaryColor: "#1f2937",
            backgroundColor: "#faf7f2",
            textColor: "#1f2937",
            accentColor: "#c2410c",
          },
          contact: {},
          categories: [],
          status: "active",
          plan: init.plan ?? "pro",
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ restaurants: [...s.restaurants, newR] }));
        return id;
      },

      deleteRestaurant: async (id) => {
        const { supabase } = await import("./supabase");
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) {
          throw new Error("Session expirée, reconnectez-vous.");
        }
        const res = await fetch("/api/walletiz/delete-restaurant", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ restaurantId: id }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Échec de la suppression.");
        }
        set((s) => {
          const remaining = s.restaurants.filter((r) => r.id !== id);
          return {
            restaurants: remaining,
            currentRestaurantId:
              s.currentRestaurantId === id
                ? remaining[0]?.id ?? ""
                : s.currentRestaurantId,
          };
        });
      },

      updateRestaurantStatus: (id, status) => {
        set((s) => ({
          restaurants: s.restaurants.map((r) =>
            r.id === id ? { ...r, status } : r
          ),
        }));
        void updateRestaurantStatusRow(id, status);
      },

      updateRestaurantPlan: (id, plan) => {
        set((s) => ({
          restaurants: s.restaurants.map((r) =>
            r.id === id ? { ...r, plan } : r
          ),
        }));
        void updateRestaurantPlanRow(id, plan);
      },

      updateInfo: (patch) => {
        const id = get().currentRestaurantId;
        set((s) => mapCurrent(s, (r) => ({ ...r, ...patch })));
        void updateRestaurantInfo(id, patch);
        if ("tagline" in patch && patch.tagline) {
          debouncedTranslate(
            `resto-tagline-${id}`,
            patch.tagline,
            "tagline",
            (trans) => void applyRestaurantFieldTrans(id, "tagline", trans)
          );
        }
      },

      updateTheme: (patch) => {
        set((s) =>
          mapCurrent(s, (r) => ({ ...r, theme: { ...r.theme, ...patch } }))
        );
        const state = get();
        const current = state.restaurants.find(
          (r) => r.id === state.currentRestaurantId
        );
        if (current) void updateRestaurantTheme(current.id, current.theme);
      },

      updateContact: (patch) => {
        set((s) =>
          mapCurrent(s, (r) => ({ ...r, contact: { ...r.contact, ...patch } }))
        );
        const state = get();
        const current = state.restaurants.find(
          (r) => r.id === state.currentRestaurantId
        );
        if (current) void updateRestaurantContact(current.id, current.contact);
      },

      addCategory: (cat) => {
        const id = newId();
        const restaurantId = get().currentRestaurantId;
        const current = get().restaurants.find((r) => r.id === restaurantId);
        const sortOrder = current?.categories.length ?? 0;
        set((s) =>
          mapCurrent(s, (r) => ({
            ...r,
            categories: [...r.categories, { ...cat, id, dishes: [] }],
          }))
        );
        void (async () => {
          await insertCategory(restaurantId, {
            ...cat,
            id,
            dishes: [],
            sort_order: sortOrder,
          });
          await translateCategoryFields(id, cat.name, cat.tagline);
        })();
      },

      updateCategory: (id, patch) => {
        set((s) =>
          mapCurrent(s, (r) => ({
            ...r,
            categories: r.categories.map((c) =>
              c.id === id ? { ...c, ...patch } : c
            ),
          }))
        );
        void updateCategoryRow(id, patch);
        if ("name" in patch && patch.name) {
          debouncedTranslate(
            `cat-name-${id}`,
            patch.name,
            "category_name",
            (trans) => void applyCategoryFieldTrans(id, "name", trans)
          );
        }
        if ("tagline" in patch && patch.tagline) {
          debouncedTranslate(
            `cat-tagline-${id}`,
            patch.tagline,
            "category_tagline",
            (trans) => void applyCategoryFieldTrans(id, "tagline", trans)
          );
        }
      },

      deleteCategory: (id) => {
        set((s) =>
          mapCurrent(s, (r) => ({
            ...r,
            categories: r.categories.filter((c) => c.id !== id),
          }))
        );
        void deleteCategoryRow(id);
      },

      addDish: (categoryId, dish) => {
        const id = newId();
        const restaurantId = get().currentRestaurantId;
        const current = get().restaurants.find((r) => r.id === restaurantId);
        const cat = current?.categories.find((c) => c.id === categoryId);
        const sortOrder = cat?.dishes.length ?? 0;
        set((s) =>
          mapCurrent(s, (r) => ({
            ...r,
            categories: r.categories.map((c) =>
              c.id === categoryId
                ? { ...c, dishes: [...c.dishes, { ...dish, id }] }
                : c
            ),
          }))
        );
        void (async () => {
          await insertDish(categoryId, { ...dish, id, sort_order: sortOrder });
          await translateDishFields(
            id,
            dish.name,
            dish.subtitle,
            dish.description
          );
        })();
      },

      updateDish: (categoryId, dishId, patch) => {
        set((s) =>
          mapCurrent(s, (r) => ({
            ...r,
            categories: r.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    dishes: c.dishes.map((d) =>
                      d.id === dishId ? { ...d, ...patch } : d
                    ),
                  }
                : c
            ),
          }))
        );
        void updateDishRow(dishId, patch);
        if ("name" in patch && patch.name) {
          debouncedTranslate(
            `dish-name-${dishId}`,
            patch.name,
            "dish_name",
            (trans) => void applyDishFieldTrans(dishId, "name", trans)
          );
        }
        if ("subtitle" in patch && patch.subtitle) {
          debouncedTranslate(
            `dish-subtitle-${dishId}`,
            patch.subtitle,
            "dish_subtitle",
            (trans) => void applyDishFieldTrans(dishId, "subtitle", trans)
          );
        }
        if ("description" in patch && patch.description) {
          debouncedTranslate(
            `dish-desc-${dishId}`,
            patch.description,
            "dish_description",
            (trans) => void applyDishFieldTrans(dishId, "description", trans)
          );
        }
      },

      deleteDish: (categoryId, dishId) => {
        set((s) =>
          mapCurrent(s, (r) => ({
            ...r,
            categories: r.categories.map((c) =>
              c.id === categoryId
                ? { ...c, dishes: c.dishes.filter((d) => d.id !== dishId) }
                : c
            ),
          }))
        );
        void deleteDishRow(dishId);
      },
    }),
    {
      name: "walletiz-store",
      version: 3,
      migrate: () => initialState,
    }
  )
);

export function useCurrentRestaurant(): ManagedRestaurant | undefined {
  return useRestaurantStore((s) =>
    s.restaurants.find((r) => r.id === s.currentRestaurantId)
  );
}

// --- Helpers de traduction (appelés depuis les actions) ---

async function applyRestaurantFieldTrans(
  restaurantId: string,
  field: "name" | "tagline",
  trans: Partial<Record<string, string>>
) {
  const state = useRestaurantStore.getState();
  const resto = state.restaurants.find((r) => r.id === restaurantId);
  if (!resto) return;
  const merged = mergeFieldTranslation(
    resto.translations as Translatable<"name" | "tagline"> | undefined,
    field,
    trans as never
  );
  useRestaurantStore.setState((s) => ({
    restaurants: s.restaurants.map((r) =>
      r.id === restaurantId ? { ...r, translations: merged } : r
    ),
  }));
  await updateRestaurantTranslations(restaurantId, merged);
}

async function applyCategoryFieldTrans(
  categoryId: string,
  field: "name" | "tagline",
  trans: Partial<Record<string, string>>
) {
  const state = useRestaurantStore.getState();
  const resto = state.restaurants.find((r) =>
    r.categories.some((c) => c.id === categoryId)
  );
  if (!resto) return;
  const cat = resto.categories.find((c) => c.id === categoryId);
  if (!cat) return;
  const merged = mergeFieldTranslation(
    cat.translations as Translatable<"name" | "tagline"> | undefined,
    field,
    trans as never
  );
  useRestaurantStore.setState((s) => ({
    restaurants: s.restaurants.map((r) =>
      r.id === resto.id
        ? {
            ...r,
            categories: r.categories.map((c) =>
              c.id === categoryId ? { ...c, translations: merged } : c
            ),
          }
        : r
    ),
  }));
  await updateCategoryRow(categoryId, { translations: merged });
}

async function applyDishFieldTrans(
  dishId: string,
  field: "name" | "subtitle" | "description",
  trans: Partial<Record<string, string>>
) {
  const state = useRestaurantStore.getState();
  let restoId = "";
  let catId = "";
  let dish: Dish | undefined;
  for (const r of state.restaurants) {
    for (const c of r.categories) {
      const d = c.dishes.find((d) => d.id === dishId);
      if (d) {
        restoId = r.id;
        catId = c.id;
        dish = d;
        break;
      }
    }
    if (dish) break;
  }
  if (!dish || !restoId || !catId) return;
  const merged = mergeFieldTranslation(
    dish.translations as
      | Translatable<"name" | "subtitle" | "description">
      | undefined,
    field,
    trans as never
  );
  useRestaurantStore.setState((s) => ({
    restaurants: s.restaurants.map((r) =>
      r.id === restoId
        ? {
            ...r,
            categories: r.categories.map((c) =>
              c.id === catId
                ? {
                    ...c,
                    dishes: c.dishes.map((d) =>
                      d.id === dishId ? { ...d, translations: merged } : d
                    ),
                  }
                : c
            ),
          }
        : r
    ),
  }));
  await updateDishRow(dishId, { translations: merged });
}

async function translateCategoryFields(
  catId: string,
  name?: string,
  tagline?: string
) {
  const [nameTrans, taglineTrans] = await Promise.all([
    name ? callTranslate(name, "category_name") : Promise.resolve(null),
    tagline
      ? callTranslate(tagline, "category_tagline")
      : Promise.resolve(null),
  ]);
  if (nameTrans) await applyCategoryFieldTrans(catId, "name", nameTrans);
  if (taglineTrans)
    await applyCategoryFieldTrans(catId, "tagline", taglineTrans);
}

async function translateDishFields(
  dishId: string,
  name?: string,
  subtitle?: string,
  description?: string
) {
  const [nameTrans, subTrans, descTrans] = await Promise.all([
    name ? callTranslate(name, "dish_name") : Promise.resolve(null),
    subtitle ? callTranslate(subtitle, "dish_subtitle") : Promise.resolve(null),
    description
      ? callTranslate(description, "dish_description")
      : Promise.resolve(null),
  ]);
  if (nameTrans) await applyDishFieldTrans(dishId, "name", nameTrans);
  if (subTrans) await applyDishFieldTrans(dishId, "subtitle", subTrans);
  if (descTrans) await applyDishFieldTrans(dishId, "description", descTrans);
}

const TARGET_LOCALES = ["en", "ar", "es", "it", "de", "pt", "zh"] as const;

function fieldNeedsTranslation(
  translations: Translatable<string> | undefined,
  field: string
): boolean {
  if (!translations) return true;
  for (const l of TARGET_LOCALES) {
    const v = translations[l]?.[field];
    if (!v) return true;
  }
  return false;
}

export type TranslationTask = {
  text: string;
  run: () => Promise<void>;
};

export function buildMissingTranslationTasks(): TranslationTask[] {
  const state = useRestaurantStore.getState();
  const resto = state.restaurants.find(
    (r) => r.id === state.currentRestaurantId
  );
  if (!resto) return [];
  const tasks: TranslationTask[] = [];

  if (
    resto.tagline &&
    fieldNeedsTranslation(
      resto.translations as Translatable<string> | undefined,
      "tagline"
    )
  ) {
    const text = resto.tagline;
    tasks.push({
      text,
      run: async () => {
        const r = await callTranslate(text, "tagline");
        if (r) await applyRestaurantFieldTrans(resto.id, "tagline", r);
      },
    });
  }

  for (const cat of resto.categories) {
    if (
      cat.name &&
      fieldNeedsTranslation(
        cat.translations as Translatable<string> | undefined,
        "name"
      )
    ) {
      const text = cat.name;
      const id = cat.id;
      tasks.push({
        text,
        run: async () => {
          const r = await callTranslate(text, "category_name");
          if (r) await applyCategoryFieldTrans(id, "name", r);
        },
      });
    }
    if (
      cat.tagline &&
      fieldNeedsTranslation(
        cat.translations as Translatable<string> | undefined,
        "tagline"
      )
    ) {
      const text = cat.tagline;
      const id = cat.id;
      tasks.push({
        text,
        run: async () => {
          const r = await callTranslate(text, "category_tagline");
          if (r) await applyCategoryFieldTrans(id, "tagline", r);
        },
      });
    }
    for (const dish of cat.dishes) {
      if (
        dish.name &&
        fieldNeedsTranslation(
          dish.translations as Translatable<string> | undefined,
          "name"
        )
      ) {
        const text = dish.name;
        const id = dish.id;
        tasks.push({
          text,
          run: async () => {
            const r = await callTranslate(text, "dish_name");
            if (r) await applyDishFieldTrans(id, "name", r);
          },
        });
      }
      if (
        dish.subtitle &&
        fieldNeedsTranslation(
          dish.translations as Translatable<string> | undefined,
          "subtitle"
        )
      ) {
        const text = dish.subtitle;
        const id = dish.id;
        tasks.push({
          text,
          run: async () => {
            const r = await callTranslate(text, "dish_subtitle");
            if (r) await applyDishFieldTrans(id, "subtitle", r);
          },
        });
      }
      if (
        dish.description &&
        fieldNeedsTranslation(
          dish.translations as Translatable<string> | undefined,
          "description"
        )
      ) {
        const text = dish.description;
        const id = dish.id;
        tasks.push({
          text,
          run: async () => {
            const r = await callTranslate(text, "dish_description");
            if (r) await applyDishFieldTrans(id, "description", r);
          },
        });
      }
    }
  }

  return tasks;
}

export async function runTranslationTasks(
  tasks: TranslationTask[],
  onProgress?: (done: number, total: number) => void
): Promise<void> {
  onProgress?.(0, tasks.length);
  for (let i = 0; i < tasks.length; i++) {
    await tasks[i].run();
    onProgress?.(i + 1, tasks.length);
  }
}
