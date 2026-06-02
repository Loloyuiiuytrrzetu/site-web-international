"use client";

import { useEffect, useState } from "react";
import { useCurrentRestaurant, useRestaurantStore } from "@/lib/store";
import { Card, Field, Input, PageHeader } from "../_components/ui";

type Preset = {
  name: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
};

const PRESETS: Preset[] = [
  // Clairs colorés
  { name: "Élégant", primaryColor: "#1f2937", backgroundColor: "#ede4d3", textColor: "#1f2937", accentColor: "#c2410c" },
  { name: "Sable", primaryColor: "#78350f", backgroundColor: "#f4e4c1", textColor: "#451a03", accentColor: "#b45309" },
  { name: "Menthe", primaryColor: "#0f766e", backgroundColor: "#cdebe1", textColor: "#134e4a", accentColor: "#059669" },
  { name: "Pêche", primaryColor: "#7c2d12", backgroundColor: "#fcd8b0", textColor: "#431407", accentColor: "#ea580c" },
  { name: "Lavande", primaryColor: "#581c87", backgroundColor: "#e0d2eb", textColor: "#3b0764", accentColor: "#a855f7" },
  { name: "Rose poudré", primaryColor: "#831843", backgroundColor: "#fbcfe0", textColor: "#500724", accentColor: "#be185d" },
  { name: "Ciel", primaryColor: "#1e40af", backgroundColor: "#bfdbfe", textColor: "#1e3a8a", accentColor: "#0284c7" },
  { name: "Olive", primaryColor: "#365314", backgroundColor: "#dde2c0", textColor: "#1a2e05", accentColor: "#65a30d" },
  // Foncés
  { name: "Nocturne", primaryColor: "#fbbf24", backgroundColor: "#0f172a", textColor: "#f8fafc", accentColor: "#f59e0b" },
  { name: "Forêt", primaryColor: "#facc15", backgroundColor: "#14532d", textColor: "#ecfdf5", accentColor: "#fde047" },
  { name: "Espresso", primaryColor: "#fcd34d", backgroundColor: "#3e2723", textColor: "#fef3c7", accentColor: "#fb923c" },
  { name: "Bourgogne", primaryColor: "#fcd34d", backgroundColor: "#4a0a17", textColor: "#fef2f2", accentColor: "#f59e0b" },
  { name: "Charbon", primaryColor: "#f5f5f5", backgroundColor: "#1c1917", textColor: "#fafaf9", accentColor: "#e7e5e4" },
  { name: "Encre", primaryColor: "#a5f3fc", backgroundColor: "#082f49", textColor: "#e0f2fe", accentColor: "#67e8f9" },
];

export default function ThemePage() {
  const restaurant = useCurrentRestaurant();
  const updateTheme = useRestaurantStore((s) => s.updateTheme);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !restaurant) return null;
  const theme = restaurant.theme;

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
                  onClick={() =>
                    updateTheme({
                      primaryColor: p.primaryColor,
                      backgroundColor: p.backgroundColor,
                      textColor: p.textColor,
                      accentColor: p.accentColor,
                    })
                  }
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
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: p.accentColor }}
                    />
                  </div>
                  <span className="truncate text-xs font-semibold">{p.name}</span>
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
              onChange={(v) => updateTheme({ primaryColor: v })}
            />
            <ColorField
              label="Accentuation"
              value={theme.accentColor}
              onChange={(v) => updateTheme({ accentColor: v })}
            />
            <ColorField
              label="Fond"
              value={theme.backgroundColor}
              onChange={(v) => updateTheme({ backgroundColor: v })}
            />
            <ColorField
              label="Texte"
              value={theme.textColor}
              onChange={(v) => updateTheme({ textColor: v })}
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
              className="text-center text-[10px] font-medium uppercase tracking-[0.25em] opacity-70"
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
              className="mt-5 rounded-xl p-3"
              style={{ backgroundColor: `${theme.primaryColor}10` }}
            >
              <p className="text-xs opacity-80">
                Voici à quoi ressemble votre menu pour vos clients.
              </p>
            </div>
          </div>
        </Card>
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
