"use client";

import Image from "next/image";
import type { Category, RestaurantTheme } from "@/lib/types";

type Props = {
  category: Category;
  theme: RestaurantTheme;
  onClick: () => void;
};

export function CategoryCard({ category, theme, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-2xl text-left shadow-sm transition active:scale-[0.98]"
      style={{ aspectRatio: "16 / 10" }}
    >
      {category.imageUrl && (
        <Image
          src={category.imageUrl}
          alt={category.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition duration-500 group-hover:scale-105"
          unoptimized
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, transparent 30%, ${theme.primaryColor}cc 100%)`,
        }}
      />
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <h2 className="text-xl font-semibold leading-tight">{category.name}</h2>
        {category.tagline && (
          <p className="mt-0.5 text-xs opacity-90">{category.tagline}</p>
        )}
        <p className="mt-2 text-[11px] uppercase tracking-wide opacity-80">
          {category.dishes.length} plats
        </p>
      </div>
    </button>
  );
}
