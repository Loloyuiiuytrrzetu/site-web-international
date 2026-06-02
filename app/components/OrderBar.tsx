"use client";

import { ShoppingBag } from "lucide-react";
import type { Dish, Locale, RestaurantTheme } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { UI_LABELS } from "@/lib/i18n";

export type OrderItem = { dish: Dish; qty: number };

type Props = {
  items: OrderItem[];
  theme: RestaurantTheme;
  locale: Locale;
  onClick: () => void;
};

export function OrderBar({ items, theme, locale, onClick }: Props) {
  if (items.length === 0) return null;
  const labels = UI_LABELS[locale];

  const totalQty = items.reduce((sum, i) => sum + i.qty, 0);
  const currency = items[0].dish.price.currency;
  const totalAmount = items.reduce(
    (sum, i) => sum + i.dish.price.amount * i.qty,
    0
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-2">
      <button
        type="button"
        onClick={onClick}
        className="mx-auto flex w-full max-w-md items-center justify-between rounded-full px-5 py-3.5 text-white shadow-2xl transition active:scale-[0.98]"
        style={{ backgroundColor: theme.accentColor }}
      >
        <span className="flex items-center gap-2.5">
          <span className="relative">
            <ShoppingBag size={20} />
            <span
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold"
              style={{ color: theme.accentColor }}
            >
              {totalQty}
            </span>
          </span>
          <span className="text-sm font-semibold">{labels.myOrder}</span>
        </span>
        <span className="text-sm font-bold">
          {formatPrice({ amount: totalAmount, currency })}
        </span>
      </button>
    </div>
  );
}
