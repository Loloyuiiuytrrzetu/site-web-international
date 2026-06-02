"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Box, Image as ImageIcon, Minus, Plus, X } from "lucide-react";
import type { Dish, Locale, RestaurantTheme } from "@/lib/types";
import { ALLERGENS } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { t, UI_LABELS } from "@/lib/i18n";

type Props = {
  dish: Dish | null;
  theme: RestaurantTheme;
  locale: Locale;
  onClose: () => void;
  onAdd: (dish: Dish, qty: number) => void;
};

export function DishDetailSheet({ dish, theme, locale, onClose, onAdd }: Props) {
  const [qty, setQty] = useState(1);
  const [view, setView] = useState<"photo" | "3d">("photo");

  useEffect(() => {
    if (dish) {
      setQty(1);
      setView("photo");
    }
  }, [dish]);

  useEffect(() => {
    if (!dish) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [dish]);

  if (!dish) return null;

  const labels = UI_LABELS[locale];
  const name = t(dish.name, "name", dish.translations, locale) ?? dish.name;
  const subtitle = t(dish.subtitle, "subtitle", dish.translations, locale);
  const description = t(dish.description, "description", dish.translations, locale);
  const has3d = Boolean(dish.model3dUrl);
  const dishAllergens = ALLERGENS.filter((a) => dish.allergens?.includes(a.id));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white text-neutral-900 shadow-2xl sm:rounded-3xl">
        <div className="relative aspect-[4/3] w-full bg-neutral-100">
          {view === "photo" && dish.imageUrl && (
            <Image
              src={dish.imageUrl}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, 448px"
              className="object-cover"
              unoptimized
            />
          )}
          {view === "3d" && has3d && (
            /* @ts-expect-error: model-viewer is a custom element */
            <model-viewer
              src={dish.model3dUrl}
              alt={name}
              camera-controls
              auto-rotate
              shadow-intensity="1"
              style={{ width: "100%", height: "100%", background: "#f5f5f5" }}
            />
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow active:scale-90"
          >
            <X size={18} />
          </button>

          {has3d && (
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1 rounded-full bg-black/70 p-1 backdrop-blur">
              <button
                type="button"
                onClick={() => setView("photo")}
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition ${
                  view === "photo" ? "bg-white text-black" : "text-white"
                }`}
              >
                <ImageIcon size={12} /> {labels.photo}
              </button>
              <button
                type="button"
                onClick={() => setView("3d")}
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition ${
                  view === "3d" ? "bg-white text-black" : "text-white"
                }`}
              >
                <Box size={12} /> {labels.view3d}
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4 pt-4">
          {dish.tags && dish.tags.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {dish.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                  style={{
                    backgroundColor: `${theme.accentColor}1a`,
                    color: theme.accentColor,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h2 className="text-xl font-semibold leading-tight">{name}</h2>
          {subtitle && (
            <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>
          )}
          {description && (
            <p className="mt-3 text-sm leading-relaxed text-neutral-700">
              {description}
            </p>
          )}

          {dishAllergens.length > 0 && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-800">
                ⚠️ {labels.allergens}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {dishAllergens.map((a) => (
                  <span
                    key={a.id}
                    className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-amber-900 shadow-sm"
                  >
                    <span className="text-sm leading-none">{a.emoji}</span>
                    {a.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-neutral-100 bg-white p-4">
          <div className="flex items-center gap-1 rounded-full border border-neutral-300 p-0.5">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full active:scale-90"
              aria-label="-"
            >
              <Minus size={14} />
            </button>
            <span className="min-w-[24px] text-center text-sm font-semibold">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full active:scale-90"
              aria-label="+"
            >
              <Plus size={14} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              onAdd(dish, qty);
              onClose();
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white shadow-md active:scale-95"
            style={{ backgroundColor: theme.accentColor }}
          >
            {labels.add}{" "}
            {formatPrice({
              amount: dish.price.amount * qty,
              currency: dish.price.currency,
            })}
          </button>
        </div>
      </div>
    </div>
  );
}
