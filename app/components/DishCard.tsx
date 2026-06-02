"use client";

import Image from "next/image";
import { Box, Plus } from "lucide-react";
import type { Dish, Locale, RestaurantTheme } from "@/lib/types";
import { ALLERGENS } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { t } from "@/lib/i18n";

type Props = {
  dish: Dish;
  theme: RestaurantTheme;
  locale: Locale;
  onOpen: () => void;
  onAdd: () => void;
};

export function DishCard({ dish, theme, locale, onOpen, onAdd }: Props) {
  const name = t(dish.name, "name", dish.translations, locale) ?? dish.name;
  const subtitle = t(dish.subtitle, "subtitle", dish.translations, locale);
  const allergenEmojis = (dish.allergens ?? [])
    .map((a) => ALLERGENS.find((x) => x.id === a)?.emoji)
    .filter(Boolean)
    .slice(0, 4)
    .join(" ");

  return (
    <article className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm">
      <button
        type="button"
        onClick={onOpen}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100 active:scale-95"
      >
        {dish.imageUrl && (
          <Image
            src={dish.imageUrl}
            alt={name}
            fill
            sizes="96px"
            className="object-cover"
            unoptimized
          />
        )}
        {dish.model3dUrl && (
          <span
            className="absolute right-1 top-1 flex items-center gap-0.5 rounded-full bg-black/70 px-1.5 py-0.5 text-[9px] font-semibold text-white"
            title="Vue 3D disponible"
          >
            <Box size={9} />
            3D
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={onOpen}
        className="flex flex-1 flex-col items-start text-left"
      >
        <h3 className="text-sm font-semibold leading-snug text-neutral-900">
          {name}
        </h3>
        {subtitle && (
          <p className="mt-0.5 line-clamp-2 text-xs text-neutral-600">
            {subtitle}
          </p>
        )}
        {allergenEmojis && (
          <p className="mt-1 text-[13px] leading-none" title="Allergènes">
            {allergenEmojis}
          </p>
        )}
        <div className="mt-auto flex w-full items-center justify-between pt-2">
          <span
            className="text-sm font-bold"
            style={{ color: theme.accentColor }}
          >
            {formatPrice(dish.price)}
          </span>
        </div>
      </button>

      <button
        type="button"
        onClick={onAdd}
        aria-label={`Ajouter ${name}`}
        className="self-end flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-md transition active:scale-90"
        style={{ backgroundColor: theme.accentColor }}
      >
        <Plus size={18} />
      </button>
    </article>
  );
}
