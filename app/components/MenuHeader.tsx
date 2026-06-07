"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import type { Locale, Restaurant } from "@/lib/types";

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

type Props = {
  restaurant: Restaurant;
  locale: Locale;
  onLocaleChange: (l: Locale) => void;
};

export function MenuHeader({ restaurant, locale, onLocaleChange }: Props) {
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
    <header
      className="sticky top-0 z-40 backdrop-blur-md"
      style={{
        backgroundColor: `${restaurant.theme.backgroundColor}f2`,
      }}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-white"
            style={{ backgroundColor: restaurant.theme.primaryColor }}
          >
            {restaurant.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h1
              className="truncate text-base font-semibold leading-tight"
              style={{ color: restaurant.theme.textColor }}
            >
              {restaurant.name}
            </h1>
            {restaurant.tagline && (
              <p
                className="truncate text-xs leading-tight opacity-70"
                style={{ color: restaurant.theme.textColor }}
              >
                {restaurant.tagline}
              </p>
            )}
          </div>
        </div>

        <div className="relative shrink-0" ref={ref}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-full border bg-white/60 px-3 py-1.5 text-xs font-medium transition active:scale-95"
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
                    className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition hover:bg-neutral-50"
                    style={{
                      color: restaurant.theme.textColor,
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
      </div>
    </header>
  );
}
