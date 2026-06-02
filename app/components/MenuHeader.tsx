"use client";

import { useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import type { Locale, Restaurant } from "@/lib/types";

const LOCALE_LABELS: Record<Locale, string> = {
  fr: "FR",
  en: "EN",
  ar: "AR",
  es: "ES",
  it: "IT",
  de: "DE",
  pt: "PT",
  zh: "中文",
};

type Props = {
  restaurant: Restaurant;
  locale: Locale;
  onLocaleChange: (l: Locale) => void;
};

export function MenuHeader({ restaurant, locale, onLocaleChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-md"
      style={{
        backgroundColor: `${restaurant.theme.backgroundColor}ee`,
        borderColor: `${restaurant.theme.primaryColor}1a`,
      }}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-white"
            style={{ backgroundColor: restaurant.theme.primaryColor }}
          >
            {restaurant.name.charAt(0)}
          </div>
          <div>
            <h1
              className="text-base font-semibold leading-tight"
              style={{ color: restaurant.theme.textColor }}
            >
              {restaurant.name}
            </h1>
            {restaurant.tagline && (
              <p
                className="text-xs leading-tight opacity-70"
                style={{ color: restaurant.theme.textColor }}
              >
                {restaurant.tagline}
              </p>
            )}
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition active:scale-95"
            style={{
              borderColor: `${restaurant.theme.primaryColor}33`,
              color: restaurant.theme.textColor,
            }}
            aria-label="Choisir la langue"
          >
            <Globe size={14} />
            {LOCALE_LABELS[locale]}
            <ChevronDown size={12} />
          </button>
          {open && (
            <div
              className="absolute right-0 top-full z-50 mt-2 grid grid-cols-2 gap-1 rounded-xl border bg-white p-2 shadow-lg"
              style={{ borderColor: `${restaurant.theme.primaryColor}22` }}
            >
              {restaurant.locales.map((l) => (
                <button
                  type="button"
                  key={l}
                  onClick={() => {
                    onLocaleChange(l);
                    setOpen(false);
                  }}
                  className={`min-w-[60px] rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    l === locale
                      ? "text-white"
                      : "text-neutral-700 hover:bg-neutral-100"
                  }`}
                  style={
                    l === locale
                      ? { backgroundColor: restaurant.theme.primaryColor }
                      : undefined
                  }
                >
                  {LOCALE_LABELS[l]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
