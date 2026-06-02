"use client";

import { useState } from "react";
import Script from "next/script";
import { ArrowLeft } from "lucide-react";
import type { Category, Dish, Locale, Restaurant } from "@/lib/types";
import { MenuHeader } from "./MenuHeader";
import { CategoryCard } from "./CategoryCard";
import { DishCard } from "./DishCard";
import { DishDetailSheet } from "./DishDetailSheet";
import { MenuFooter } from "./MenuFooter";
import { OrderBar, type OrderItem } from "./OrderBar";

type Props = { restaurant: Restaurant };

export function MenuView({ restaurant }: Props) {
  const [locale, setLocale] = useState<Locale>(restaurant.defaultLocale);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeDish, setActiveDish] = useState<Dish | null>(null);
  const [order, setOrder] = useState<OrderItem[]>([]);

  const addToOrder = (dish: Dish, qty = 1) => {
    setOrder((prev) => {
      const existing = prev.find((i) => i.dish.id === dish.id);
      if (existing) {
        return prev.map((i) =>
          i.dish.id === dish.id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { dish, qty }];
    });
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: restaurant.theme.backgroundColor,
        color: restaurant.theme.textColor,
      }}
    >
      <Script
        type="module"
        src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
        strategy="lazyOnload"
      />

      <MenuHeader
        restaurant={restaurant}
        locale={locale}
        onLocaleChange={setLocale}
      />

      {activeCategory ? (
        <CategoryView
          restaurant={restaurant}
          category={activeCategory}
          onBack={() => setActiveCategory(null)}
          onOpenDish={setActiveDish}
          onAddDish={addToOrder}
        />
      ) : (
        <HomeView
          restaurant={restaurant}
          onSelectCategory={setActiveCategory}
        />
      )}

      <MenuFooter restaurant={restaurant} />

      <OrderBar
        items={order}
        theme={restaurant.theme}
        onClick={() => {
          /* TODO: open order sheet */
        }}
      />

      <DishDetailSheet
        dish={activeDish}
        theme={restaurant.theme}
        onClose={() => setActiveDish(null)}
        onAdd={addToOrder}
      />
    </div>
  );
}

function HomeView({
  restaurant,
  onSelectCategory,
}: {
  restaurant: Restaurant;
  onSelectCategory: (c: Category) => void;
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-6 pt-6">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {restaurant.categories.map((c) => (
          <CategoryCard
            key={c.id}
            category={c}
            theme={restaurant.theme}
            onClick={() => onSelectCategory(c)}
          />
        ))}
      </section>
    </main>
  );
}

function CategoryView({
  restaurant,
  category,
  onBack,
  onOpenDish,
  onAddDish,
}: {
  restaurant: Restaurant;
  category: Category;
  onBack: () => void;
  onOpenDish: (d: Dish) => void;
  onAddDish: (d: Dish, qty?: number) => void;
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-6 pt-4">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 rounded-full border bg-white/60 px-3 py-1.5 text-xs font-medium active:scale-95"
        style={{
          borderColor: `${restaurant.theme.primaryColor}33`,
          color: restaurant.theme.textColor,
        }}
      >
        <ArrowLeft size={14} />
        Retour aux catégories
      </button>

      <header className="mb-4">
        <h2 className="text-2xl font-semibold leading-tight">{category.name}</h2>
        {category.tagline && (
          <p className="mt-1 text-sm opacity-70">{category.tagline}</p>
        )}
        <p className="mt-2 text-xs opacity-60">
          {category.dishes.length} plat
          {category.dishes.length > 1 ? "s" : ""}
        </p>
      </header>

      <div className="space-y-2.5">
        {category.dishes.map((d) => (
          <DishCard
            key={d.id}
            dish={d}
            theme={restaurant.theme}
            onOpen={() => onOpenDish(d)}
            onAdd={() => onAddDish(d, 1)}
          />
        ))}
        {category.dishes.length === 0 && (
          <p className="py-10 text-center text-sm opacity-60">
            Aucun plat dans cette catégorie pour l&apos;instant.
          </p>
        )}
      </div>
    </main>
  );
}
