"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Category,
  Dish,
  Restaurant,
  RestaurantContact,
  RestaurantTheme,
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
  updateRestaurantTheme,
} from "./supabase-mutations";

export type RestaurantStatus = "active" | "suspended" | "draft";

export type ManagedRestaurant = Restaurant & {
  status: RestaurantStatus;
  createdAt: string;
  plan: "starter" | "pro" | "enterprise";
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
  deleteRestaurant: (id: string) => void;
  updateRestaurantStatus: (id: string, status: RestaurantStatus) => void;

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
          locales: ["fr", "en"],
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
          plan: init.plan ?? "starter",
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ restaurants: [...s.restaurants, newR] }));
        return id;
      },

      deleteRestaurant: (id) =>
        set((s) => {
          const remaining = s.restaurants.filter((r) => r.id !== id);
          return {
            restaurants: remaining,
            currentRestaurantId:
              s.currentRestaurantId === id
                ? remaining[0]?.id ?? ""
                : s.currentRestaurantId,
          };
        }),

      updateRestaurantStatus: (id, status) =>
        set((s) => ({
          restaurants: s.restaurants.map((r) =>
            r.id === id ? { ...r, status } : r
          ),
        })),

      updateInfo: (patch) => {
        const id = get().currentRestaurantId;
        set((s) => mapCurrent(s, (r) => ({ ...r, ...patch })));
        void updateRestaurantInfo(id, patch);
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
        void insertCategory(restaurantId, {
          ...cat,
          id,
          dishes: [],
          sort_order: sortOrder,
        });
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
        void insertDish(categoryId, { ...dish, id, sort_order: sortOrder });
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
