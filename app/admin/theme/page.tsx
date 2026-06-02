"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useCurrentRestaurant, useRestaurantStore } from "@/lib/store";
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

  return (
    <div className="mx-auto max-w-3xl p-4 lg:p-8">
      <PageHeader
        title="Apparence"
        description="Personnalisez les couleurs et le style de votre menu."
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
              style={{ color: theme.textColor }}
            >
              {restaurant.tagline || "Votre slogan"}
            </p>
            <h2
              className="mt-6 text-3xl italic leading-none"
              style={{
                color: theme.textColor,
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontWeight: 400,
              }}
            >
              {restaurant.name}
            </h2>
            <div
              className="mt-5 rounded-xl border p-3"
              style={{
                borderColor: `${theme.primaryColor}33`,
                color: theme.textColor,
              }}
            >
              <p className="text-xs opacity-90">
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
