"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { ArrowLeft, Check, ChevronDown, Globe } from "lucide-react";
import type { Category, Dish, Locale, Restaurant } from "@/lib/types";
import { t, UI_LABELS } from "@/lib/i18n";
import { CategoryCard } from "./CategoryCard";
import { DishCard } from "./DishCard";
import { DishDetailSheet } from "./DishDetailSheet";
import { MenuFooter } from "./MenuFooter";
import { OrderBar, type OrderItem } from "./OrderBar";

const LOCALE_LABELS: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  ar: "العربية",
  es: "Español",
  it: "Italiano",
  de: "Deutsch",
  pt: "Português",
  zh: "简体中文",
};

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

      {activeCategory ? (
        <CategoryView
          restaurant={restaurant}
          category={activeCategory}
          locale={locale}
          onLocaleChange={setLocale}
          onBack={() => setActiveCategory(null)}
          onOpenDish={setActiveDish}
          onAddDish={addToOrder}
        />
      ) : (
        <HomeView
          restaurant={restaurant}
          locale={locale}
          onLocaleChange={setLocale}
          onSelectCategory={setActiveCategory}
        />
      )}

      <MenuFooter restaurant={restaurant} locale={locale} />
      <OrderBar
        items={order}
        theme={restaurant.theme}
        locale={locale}
        onClick={() => undefined}
      />
      <DishDetailSheet
        dish={activeDish}
        theme={restaurant.theme}
        locale={locale}
        onClose={() => setActiveDish(null)}
        onAdd={addToOrder}
      />
    </div>
  );
}

function HomeView({
  restaurant,
  locale,
  onLocaleChange,
  onSelectCategory,
}: {
  restaurant: Restaurant;
  locale: Locale;
  onLocaleChange: (l: Locale) => void;
  onSelectCategory: (c: Category) => void;
}) {
  const tagline = t(restaurant.tagline, "tagline", restaurant.translations, locale);
  return (
    <>
      <header className="mx-auto max-w-3xl px-5 pb-10 pt-14 sm:pb-14 sm:pt-20">
        {tagline ? (
          <p
            className="text-center text-[11px] font-medium uppercase tracking-[0.3em] opacity-70"
            style={{ color: restaurant.theme.textColor }}
          >
            {tagline}
          </p>
        ) : (
          <div className="h-4" />
        )}

        <div className="mt-14 flex items-end justify-between gap-3 sm:mt-20">
          <h1
            className="flex-1 text-5xl italic leading-none tracking-tight sm:text-6xl"
            style={{
              color: restaurant.theme.textColor,
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontWeight: 400,
            }}
          >
            {restaurant.name}
          </h1>
          <LocaleSwitcher
            restaurant={restaurant}
            locale={locale}
            onLocaleChange={onLocaleChange}
          />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-6">
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {restaurant.categories.map((c) => (
            <CategoryCard
              key={c.id}
              category={c}
              theme={restaurant.theme}
              locale={locale}
              onClick={() => onSelectCategory(c)}
            />
          ))}
        </section>
      </main>
    </>
  );
}

function CategoryView({
  restaurant,
  category,
  locale,
  onLocaleChange,
  onBack,
  onOpenDish,
  onAddDish,
}: {
  restaurant: Restaurant;
  category: Category;
  locale: Locale;
  onLocaleChange: (l: Locale) => void;
  onBack: () => void;
  onOpenDish: (d: Dish) => void;
  onAddDish: (d: Dish, qty?: number) => void;
}) {
  const labels = UI_LABELS[locale];
  const name = t(category.name, "name", category.translations, locale) ?? category.name;
  const tagline = t(category.tagline, "tagline", category.translations, locale);

  return (
    <main className="mx-auto max-w-3xl px-4 pb-6 pt-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-full border bg-white/70 px-3 py-1.5 text-xs font-medium active:scale-95"
          style={{
            borderColor: `${restaurant.theme.primaryColor}33`,
            color: restaurant.theme.textColor,
          }}
        >
          <ArrowLeft size={14} />
          {labels.back}
        </button>
        <LocaleSwitcher
          restaurant={restaurant}
          locale={locale}
          onLocaleChange={onLocaleChange}
        />
      </div>

      <header className="mb-4">
        <h2 className="text-2xl font-semibold leading-tight">{name}</h2>
        {tagline && <p className="mt-1 text-sm opacity-70">{tagline}</p>}
        <p className="mt-2 text-xs opacity-60">{labels.dishes(category.dishes.length)}</p>
      </header>

      <div className="space-y-2.5">
        {category.dishes.map((d) => (
          <DishCard
            key={d.id}
            dish={d}
            theme={restaurant.theme}
            locale={locale}
            onOpen={() => onOpenDish(d)}
            onAdd={() => onAddDish(d, 1)}
          />
        ))}
        {category.dishes.length === 0 && (
          <p className="py-10 text-center text-sm opacity-60">{labels.noDishes}</p>
        )}
      </div>
    </main>
  );
}

function LocaleSwitcher({
  restaurant,
  locale,
  onLocaleChange,
}: {
  restaurant: Restaurant;
  locale: Locale;
  onLocaleChange: (l: Locale) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 shadow-sm transition active:scale-95"
        style={{ borderColor: `${restaurant.theme.primaryColor}33` }}
        aria-label="Choisir la langue"
      >
        <Globe size={14} />
        {LOCALE_LABELS[locale]}
        <ChevronDown size={12} />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-2xl border bg-white shadow-xl"
          style={{ borderColor: `${restaurant.theme.primaryColor}22` }}
        >
          {restaurant.locales.map((l) => {
            const active = l === locale;
            return (
              <button
                type="button"
                key={l}
                onClick={() => {
                  onLocaleChange(l);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-neutral-800 transition hover:bg-neutral-50"
                style={{
                  backgroundColor: active
                    ? `${restaurant.theme.primaryColor}10`
                    : undefined,
                }}
              >
                <span className={active ? "font-semibold" : ""}>
                  {LOCALE_LABELS[l]}
                </span>
                {active && (
                  <Check
                    size={14}
                    style={{ color: restaurant.theme.primaryColor }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
