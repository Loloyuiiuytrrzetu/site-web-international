"use client";

import { useMemo, useRef, useState } from "react";
import Script from "next/script";
import Image from "next/image";
import type { Dish, Locale, Restaurant } from "@/lib/types";
import { MenuHeader } from "./MenuHeader";
import { CategoryCard } from "./CategoryCard";
import { DishCard } from "./DishCard";
import { DishDetailSheet } from "./DishDetailSheet";
import { MenuFooter } from "./MenuFooter";
import { OrderBar, type OrderItem } from "./OrderBar";

type Props = { restaurant: Restaurant };

export function MenuView({ restaurant }: Props) {
  const [locale, setLocale] = useState<Locale>(restaurant.defaultLocale);
  const [activeDish, setActiveDish] = useState<Dish | null>(null);
  const [order, setOrder] = useState<OrderItem[]>([]);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

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

  const scrollToCategory = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const totalDishes = useMemo(
    () => restaurant.categories.reduce((n, c) => n + c.dishes.length, 0),
    [restaurant]
  );

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

      {restaurant.coverUrl && (
        <div className="relative h-44 w-full overflow-hidden sm:h-56">
          <Image
            src={restaurant.coverUrl}
            alt={restaurant.name}
            fill
            sizes="100vw"
            priority
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 text-white">
            <p className="text-xs uppercase tracking-widest opacity-90">Menu</p>
            <p className="text-sm opacity-90">{totalDishes} plats à découvrir</p>
          </div>
        </div>
      )}

      <nav className="sticky top-[57px] z-20 -mb-px overflow-x-auto border-b backdrop-blur"
        style={{
          backgroundColor: `${restaurant.theme.backgroundColor}ee`,
          borderColor: `${restaurant.theme.primaryColor}14`,
        }}
      >
        <div className="mx-auto flex max-w-3xl gap-2 px-4 py-2">
          {restaurant.categories.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => scrollToCategory(c.id)}
              className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition active:scale-95"
              style={{
                borderColor: `${restaurant.theme.primaryColor}33`,
                color: restaurant.theme.textColor,
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 pt-4">
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {restaurant.categories.map((c) => (
            <CategoryCard
              key={c.id}
              category={c}
              theme={restaurant.theme}
              onClick={() => scrollToCategory(c.id)}
            />
          ))}
        </section>

        {restaurant.categories.map((c) => (
          <section
            key={c.id}
            id={c.id}
            ref={(el) => {
              sectionRefs.current[c.id] = el;
            }}
            className="scroll-mt-32 pt-8"
          >
            <header className="mb-3 flex items-end justify-between">
              <h2 className="text-lg font-semibold">{c.name}</h2>
              <span className="text-xs opacity-60">{c.dishes.length} plats</span>
            </header>
            <div className="space-y-2.5">
              {c.dishes.map((d) => (
                <DishCard
                  key={d.id}
                  dish={d}
                  theme={restaurant.theme}
                  onOpen={() => setActiveDish(d)}
                  onAdd={() => addToOrder(d, 1)}
                />
              ))}
            </div>
          </section>
        ))}
      </main>

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
