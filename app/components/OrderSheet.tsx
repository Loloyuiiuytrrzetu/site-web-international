"use client";

import { useEffect } from "react";
import { X, Minus, Plus } from "lucide-react";
import type { Locale, RestaurantTheme } from "@/lib/types";
import { t, UI_LABELS } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";
import type { OrderItem } from "./OrderBar";

type Props = {
  open: boolean;
  items: OrderItem[];
  theme: RestaurantTheme;
  locale: Locale;
  onClose: () => void;
  onUpdateQty: (dishId: string, qty: number) => void;
};

export function OrderSheet({ open, items, theme, locale, onClose, onUpdateQty }: Props) {
  const labels = UI_LABELS[locale];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const currency = items[0]?.dish.price.currency ?? "EUR";
  const total = items.reduce((s, i) => s + i.dish.price.amount * i.qty, 0);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <div
        className="relative z-10 w-full max-w-md rounded-t-3xl bg-white shadow-2xl"
        style={{ maxHeight: "85vh" }}
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-semibold text-neutral-900">{labels.myOrder}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto px-5 py-3">
          <ul className="divide-y">
            {items.map(({ dish, qty }) => {
              const name = t(dish.name, "name", dish.translations, locale) ?? dish.name;
              return (
                <li key={dish.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900">{name}</p>
                    <p className="text-xs text-neutral-500">
                      {formatPrice(dish.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onUpdateQty(dish.id, qty - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-300 text-neutral-700 active:scale-95"
                      aria-label="-"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-5 text-center text-sm font-semibold text-neutral-900">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQty(dish.id, qty + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-white active:scale-95"
                      style={{ backgroundColor: theme.accentColor }}
                      aria-label="+"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="w-16 text-right text-sm font-semibold text-neutral-900">
                    {formatPrice({ amount: dish.price.amount * qty, currency: dish.price.currency })}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex items-center justify-between border-t px-5 py-4">
          <span className="text-sm font-medium text-neutral-700">{labels.total}</span>
          <span className="text-lg font-bold" style={{ color: theme.accentColor }}>
            {formatPrice({ amount: total, currency })}
          </span>
        </div>
      </div>
    </div>
  );
}
