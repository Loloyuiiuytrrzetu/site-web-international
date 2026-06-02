"use client";

import { useEffect, useState } from "react";
import { useRestaurantStore } from "@/lib/store";
import { Button, Card, Field, Input, PageHeader } from "../_components/ui";

const PRESETS = [
  { name: "Élégant", primaryColor: "#1f2937", backgroundColor: "#faf7f2", textColor: "#1f2937", accentColor: "#c2410c" },
  { name: "Frais", primaryColor: "#0f766e", backgroundColor: "#f0fdfa", textColor: "#134e4a", accentColor: "#059669" },
  { name: "Chaleureux", primaryColor: "#7c2d12", backgroundColor: "#fff7ed", textColor: "#431407", accentColor: "#ea580c" },
  { name: "Minimal", primaryColor: "#0a0a0a", backgroundColor: "#ffffff", textColor: "#171717", accentColor: "#404040" },
  { name: "Royal", primaryColor: "#581c87", backgroundColor: "#faf5ff", textColor: "#3b0764", accentColor: "#a855f7" },
];

export default function ThemePage() {
  const theme = useRestaurantStore((s) => s.restaurant.theme);
  const updateTheme = useRestaurantStore((s) => s.updateTheme);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-3xl p-5 lg:p-8">
      <PageHeader
        title="Apparence"
        description="Personnalisez les couleurs et le style de votre menu."
      />

      <div className="flex flex-col gap-4">
        <Card title="Thèmes prédéfinis" description="Cliquez pour appliquer instantanément.">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <Button
                key={p.name}
                variant="secondary"
                onClick={() =>
                  updateTheme({
                    primaryColor: p.primaryColor,
                    backgroundColor: p.backgroundColor,
                    textColor: p.textColor,
                    accentColor: p.accentColor,
                  })
                }
              >
                <span
                  className="h-4 w-4 rounded-full border border-neutral-300"
                  style={{ backgroundColor: p.accentColor }}
                />
                {p.name}
              </Button>
            ))}
          </div>
        </Card>

        <Card title="Couleurs personnalisées">
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField
              label="Couleur principale"
              value={theme.primaryColor}
              onChange={(v) => updateTheme({ primaryColor: v })}
            />
            <ColorField
              label="Couleur d'accentuation (boutons, prix)"
              value={theme.accentColor}
              onChange={(v) => updateTheme({ accentColor: v })}
            />
            <ColorField
              label="Couleur de fond"
              value={theme.backgroundColor}
              onChange={(v) => updateTheme({ backgroundColor: v })}
            />
            <ColorField
              label="Couleur du texte"
              value={theme.textColor}
              onChange={(v) => updateTheme({ textColor: v })}
            />
          </div>
        </Card>

        <Card title="Aperçu en direct">
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-white"
                style={{ backgroundColor: theme.primaryColor }}
              >
                A
              </div>
              <div>
                <p className="font-semibold">Aperçu en direct</p>
                <p className="text-xs opacity-70">Voici à quoi ressemble votre menu.</p>
              </div>
            </div>
            <button
              type="button"
              className="mt-4 rounded-full px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: theme.accentColor }}
            >
              Ajouter au panier · 12,50 €
            </button>
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
