"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Category, Dish, Restaurant, RestaurantContact, RestaurantTheme } from "./types";
import { demoRestaurant } from "./demo-restaurant";

type State = {
  restaurant: Restaurant;
};

type Actions = {
  reset: () => void;
  updateInfo: (patch: Partial<Pick<Restaurant, "name" | "tagline" | "logoUrl" | "coverUrl">>) => void;
  updateTheme: (patch: Partial<RestaurantTheme>) => void;
  updateContact: (patch: Partial<RestaurantContact>) => void;
  addCategory: (cat: Omit<Category, "id" | "dishes">) => void;
  updateCategory: (id: string, patch: Partial<Omit<Category, "id" | "dishes">>) => void;
  deleteCategory: (id: string) => void;
  addDish: (categoryId: string, dish: Omit<Dish, "id">) => void;
  updateDish: (categoryId: string, dishId: string, patch: Partial<Omit<Dish, "id">>) => void;
  deleteDish: (categoryId: string, dishId: string) => void;
};

const uid = () => Math.random().toString(36).slice(2, 10);

export const useRestaurantStore = create<State & Actions>()(
  persist(
    (set) => ({
      restaurant: demoRestaurant,

      reset: () => set({ restaurant: demoRestaurant }),

      updateInfo: (patch) =>
        set((s) => ({ restaurant: { ...s.restaurant, ...patch } })),

      updateTheme: (patch) =>
        set((s) => ({
          restaurant: { ...s.restaurant, theme: { ...s.restaurant.theme, ...patch } },
        })),

      updateContact: (patch) =>
        set((s) => ({
          restaurant: { ...s.restaurant, contact: { ...s.restaurant.contact, ...patch } },
        })),

      addCategory: (cat) =>
        set((s) => ({
          restaurant: {
            ...s.restaurant,
            categories: [
              ...s.restaurant.categories,
              { ...cat, id: uid(), dishes: [] },
            ],
          },
        })),

      updateCategory: (id, patch) =>
        set((s) => ({
          restaurant: {
            ...s.restaurant,
            categories: s.restaurant.categories.map((c) =>
              c.id === id ? { ...c, ...patch } : c
            ),
          },
        })),

      deleteCategory: (id) =>
        set((s) => ({
          restaurant: {
            ...s.restaurant,
            categories: s.restaurant.categories.filter((c) => c.id !== id),
          },
        })),

      addDish: (categoryId, dish) =>
        set((s) => ({
          restaurant: {
            ...s.restaurant,
            categories: s.restaurant.categories.map((c) =>
              c.id === categoryId
                ? { ...c, dishes: [...c.dishes, { ...dish, id: uid() }] }
                : c
            ),
          },
        })),

      updateDish: (categoryId, dishId, patch) =>
        set((s) => ({
          restaurant: {
            ...s.restaurant,
            categories: s.restaurant.categories.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    dishes: c.dishes.map((d) =>
                      d.id === dishId ? { ...d, ...patch } : d
                    ),
                  }
                : c
            ),
          },
        })),

      deleteDish: (categoryId, dishId) =>
        set((s) => ({
          restaurant: {
            ...s.restaurant,
            categories: s.restaurant.categories.map((c) =>
              c.id === categoryId
                ? { ...c, dishes: c.dishes.filter((d) => d.id !== dishId) }
                : c
            ),
          },
        })),
    }),
    { name: "walletiz-restaurant" }
  )
);
