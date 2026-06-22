"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useCurrentRestaurant, useRestaurantStore } from "@/lib/store";
import {
  FONT_OPTIONS,
  buildGoogleFontsUrl,
  getFontOption,
} from "@/lib/fonts";
import { Card, Field, Input, PageHeader } from "../_components/ui";

type Preset = {
  name: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
};

// Tous les textColor sont choisis pour rester lisibles sur leur fond
const PRESETS: Preset[] = [
  // Clairs avec fonds prononcés
  { name: "Élégant", primaryColor: "#3a2618", backgroundColor: "#e8dcc0", textColor: "#2a1810", accentColor: "#a0421b" },
  { name: "Sable", primaryColor: "#5c2c0c", backgroundColor: "#e8c995", textColor: "#3d1d08", accentColor: "#8a4310" },
  { name: "Menthe", primaryColor: "#0f5c4f", backgroundColor: "#a7d4c5", textColor: "#0a3d33", accentColor: "#0f7060" },
  { name: "Pêche", primaryColor: "#7c2d12", backgroundColor: "#f8c79a", textColor: "#4a1a08", accentColor: "#c2410c" },
  { name: "Lavande", primaryColor: "#4a1d6e", backgroundColor: "#c9b3e0", textColor: "#2d0d4e", accentColor: "#7c2db5" },
  { name: "Rose poudré", primaryColor: "#6b1431", backgroundColor: "#f0b8cb", textColor: "#420a1f", accentColor: "#9b1b48" },
  { name: "Ciel", primaryColor: "#1e3a8a", backgroundColor: "#9dc4f0", textColor: "#172554", accentColor: "#1e40af" },
  { name: "Olive", primaryColor: "#2d3e0a", backgroundColor: "#c8d4a0", textColor: "#1a2807", accentColor: "#4d6614" },
  // Foncés avec textes très lisibles
  { name: "Nocturne", primaryColor: "#fbbf24", backgroundColor: "#0f172a", textColor: "#f8fafc", accentColor: "#fbbf24" },
  { name: "Forêt", primaryColor: "#facc15", backgroundColor: "#14532d", textColor: "#ecfdf5", accentColor: "#fde047" },
  { name: "Espresso", primaryColor: "#fcd34d", backgroundColor: "#3e2723", textColor: "#fef3c7", accentColor: "#fb923c" },
  { name: "Bourgogne", primaryColor: "#fcd34d", backgroundColor: "#4a0a17", textColor: "#fef2f2", accentColor: "#fde047" },
  { name: "Charbon", primaryColor: "#fafaf9", backgroundColor: "#1c1917", textColor: "#fafaf9", accentColor: "#e7e5e4" },
  { name: "Encre", primaryColor: "#7dd3fc", backgroundColor: "#082f49", textColor: "#e0f2fe", accentColor: "#67e8f9" },
];

export default function ThemePage() {
  const restaurant = useCurrentRestaurant();
  const updateTheme = useRestaurantStore((s) => s.updateTheme);
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !restaurant) return null;
  const theme = restaurant.theme;
  const titleFont = getFontOption(theme.fontTitle);
  const bodyFont = getFontOption(theme.fontBody);
  const restoNameFont = getFontOption(theme.fontRestoName);
  const taglineFont = getFontOption(theme.fontTagline);
  const googleHref = buildGoogleFontsUrl([
    theme.fontTitle ?? "system",
    theme.fontBody ?? "system",
    theme.fontRestoName ?? "system",
    theme.fontTagline ?? "system",
  ]);

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const applyPreset = (p: Preset) => {
    updateTheme({
      primaryColor: p.primaryColor,
      backgroundColor: p.backgroundColor,
      textColor: p.textColor,
      accentColor: p.accentColor,
    });
    flashSaved();
  };

  const setColor = (key: keyof typeof theme, v: string) => {
    updateTheme({ [key]: v } as Partial<typeof theme>);
    flashSaved();
  };

  const setFont = (
    which: "fontTitle" | "fontBody" | "fontRestoName" | "fontTagline",
    id: string
  ) => {
    updateTheme({ [which]: id } as Partial<typeof theme>);
    flashSaved();
  };

  return (
    <div className="mx-auto max-w-3xl p-4 lg:p-8">
      {googleHref && (
        // eslint-disable-next-line @next/next/no-css-tags
        <link rel="stylesheet" href={googleHref} />
      )}
      <PageHeader
        title="Apparence"
        description="Personnalisez les couleurs, polices et style de votre menu."
      />

      <div className="flex flex-col gap-4">
        <Card title="Thèmes prédéfinis" description="Cliquez pour appliquer instantanément.">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {PRESETS.map((p) => {
              const active =
                theme.primaryColor === p.primaryColor &&
                theme.backgroundColor === p.backgroundColor;
              return (
                <button
                  type="button"
                  key={p.name}
                  onClick={() => applyPreset(p)}
                  className={`flex items-center gap-2 rounded-xl border p-2.5 text-left transition active:scale-95 ${
                    active
                      ? "border-neutral-900 shadow-md"
                      : "border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: p.backgroundColor }}
                  >
                    <span
                      className="text-[10px] font-bold italic"
                      style={{
                        color: p.textColor,
                        fontFamily: "Georgia, serif",
                      }}
                    >
                      Aa
                    </span>
                  </div>
                  <span className="truncate text-xs font-semibold text-neutral-900">
                    {p.name}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card title="Couleurs personnalisées">
          <div className="grid gap-3 sm:grid-cols-2">
            <ColorField
              label="Principale"
              value={theme.primaryColor}
              onChange={(v) => setColor("primaryColor", v)}
            />
            <ColorField
              label="Accentuation"
              value={theme.accentColor}
              onChange={(v) => setColor("accentColor", v)}
            />
            <ColorField
              label="Fond"
              value={theme.backgroundColor}
              onChange={(v) => setColor("backgroundColor", v)}
            />
            <ColorField
              label="Texte"
              value={theme.textColor}
              onChange={(v) => setColor("textColor", v)}
            />
          </div>
        </Card>

        <Card
          title="Polices"
          description="Choisissez une police différente pour chaque élément, indépendamment."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FontPicker
              label="Nom du restaurant"
              hint="Affiché en grand en haut de votre menu"
              value={theme.fontRestoName ?? "system"}
              onChange={(id) => setFont("fontRestoName", id)}
            />
            <FontPicker
              label="Slogan"
              hint="Le slogan affiché sous votre nom"
              value={theme.fontTagline ?? "system"}
              onChange={(id) => setFont("fontTagline", id)}
            />
            <FontPicker
              label="Titres (catégories et plats)"
              hint="Nom des catégories et des plats"
              value={theme.fontTitle ?? "system"}
              onChange={(id) => setFont("fontTitle", id)}
            />
            <FontPicker
              label="Corps de texte"
              hint="Descriptions, prix et autres textes"
              value={theme.fontBody ?? "system"}
              onChange={(id) => setFont("fontBody", id)}
            />
          </div>
        </Card>

        <Card title="Aperçu en direct">
          <div
            className="rounded-2xl p-5"
            style={{
              backgroundColor: theme.backgroundColor,
              color: theme.textColor,
            }}
          >
            <p
              className="text-center text-[10px] font-medium uppercase tracking-[0.25em] opacity-80"
              style={{
                color: theme.textColor,
                fontFamily: taglineFont.family,
                fontStyle: taglineFont.style,
                fontWeight: taglineFont.weight,
              }}
            >
              {restaurant.tagline || "Votre slogan"}
            </p>
            <h2
              className="mt-6 text-3xl leading-tight"
              style={{
                color: theme.textColor,
                fontFamily: restoNameFont.family,
                fontStyle: restoNameFont.style,
                fontWeight: restoNameFont.weight ?? 600,
              }}
            >
              {restaurant.name}
            </h2>
            <p
              className="mt-4 text-sm font-semibold"
              style={{
                color: theme.textColor,
                fontFamily: titleFont.family,
                fontStyle: titleFont.style,
                fontWeight: titleFont.weight ?? 600,
              }}
            >
              Exemple de catégorie
            </p>
            <div
              className="mt-5 rounded-xl border p-3"
              style={{
                borderColor: `${theme.primaryColor}33`,
                color: theme.textColor,
              }}
            >
              <p
                className="text-xs opacity-90"
                style={{ fontFamily: bodyFont.family }}
              >
                Voici à quoi ressemble votre menu pour vos clients.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {saved && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg">
          <Check size={14} />
          Enregistré
        </div>
      )}
    </div>
  );
}

function FontPicker({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = getFontOption(value);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div>
      <div className="mb-1.5">
        <p className="text-xs font-semibold text-neutral-900">{label}</p>
        {hint && <p className="text-[11px] text-neutral-500">{hint}</p>}
      </div>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-left transition hover:border-neutral-400"
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-neutral-200 text-base text-neutral-900"
              style={{
                fontFamily: selected.family,
                fontWeight: selected.weight ?? 600,
                fontStyle: selected.style,
              }}
            >
              Aa
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-neutral-900">
                {selected.label}
              </span>
              <span className="block truncate text-[10px] text-neutral-500">
                {selected.description}
              </span>
            </span>
          </span>
          <ChevronDown
            size={16}
            className={`shrink-0 text-neutral-500 transition ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1.5 max-h-96 overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-xl">
            {FONT_OPTIONS.map((font) => {
              const active = value === font.id;
              return (
                <button
                  type="button"
                  key={font.id}
                  onClick={() => {
                    onChange(font.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 border-b border-neutral-100 px-3 py-2.5 text-left transition last:border-b-0 hover:bg-neutral-50 ${
                    active ? "bg-neutral-50" : ""
                  }`}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-neutral-200 text-base text-neutral-900"
                    style={{
                      fontFamily: font.family,
                      fontWeight: font.weight ?? 600,
                      fontStyle: font.style,
                    }}
                  >
                    Aa
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-sm ${
                        active
                          ? "font-semibold text-neutral-900"
                          : "text-neutral-800"
                      }`}
                    >
                      {font.label}
                    </span>
                    <span className="block truncate text-[10px] text-neutral-500">
                      {font.description}
                    </span>
                  </span>
                  {active && (
                    <Check
                      size={14}
                      className="shrink-0 text-neutral-900"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 shrink-0 cursor-pointer rounded border border-neutral-300"
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </Field>
  );
}
