"use client";

import { useActionState, useState } from "react";
import { updateBranding } from "@/lib/customize";
import { StampGrid } from "@/components/StampGrid";

type Initial = {
  name: string;
  category: string;
  color: string;
  programName: string;
  rewardLabel: string;
  stampsGoal: number;
};

// Formulaire de personnalisation avec aperçu EN DIRECT de la carte.
export function CustomizeForm({ initial }: { initial: Initial }) {
  const [state, formAction, pending] = useActionState(updateBranding, undefined);

  // État local uniquement pour l'aperçu (les vraies valeurs sont envoyées au serveur).
  const [name, setName] = useState(initial.name);
  const [category, setCategory] = useState(initial.category);
  const [color, setColor] = useState(initial.color);
  const [programName, setProgramName] = useState(initial.programName);
  const [rewardLabel, setRewardLabel] = useState(initial.rewardLabel);
  const [stampsGoal, setStampsGoal] = useState(initial.stampsGoal);

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_auto]">
      {/* Formulaire */}
      <form action={formAction} className="space-y-4">
        <Field label="Nom du commerce">
          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            required
          />
        </Field>

        <Field label="Type de commerce">
          <input
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="ex : Restaurant, Coiffeur, Boutique…"
            className="input"
          />
        </Field>

        <Field label="Couleur de la carte">
          <div className="flex items-center gap-3">
            <input
              name="color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-11 w-16 cursor-pointer rounded-lg border border-neutral-200"
            />
            <span className="text-sm text-neutral-500">{color}</span>
          </div>
        </Field>

        <hr className="border-neutral-100" />

        <Field label="Nom de la carte de fidélité">
          <input
            name="programName"
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
            placeholder="ex : Carte café"
            className="input"
          />
        </Field>

        <Field label="Récompense">
          <input
            name="rewardLabel"
            value={rewardLabel}
            onChange={(e) => setRewardLabel(e.target.value)}
            placeholder="ex : 1 café offert"
            className="input"
          />
        </Field>

        <Field label={`Objectif : ${stampsGoal} tampons`}>
          <input
            name="stampsGoal"
            type="range"
            min={2}
            max={20}
            value={stampsGoal}
            onChange={(e) => setStampsGoal(Number(e.target.value))}
            className="w-full"
          />
        </Field>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state?.ok && <p className="text-sm text-green-600">✓ Enregistré !</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-xl px-6 py-3 font-semibold text-white disabled:opacity-50"
          style={{ background: color }}
        >
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>

      {/* Aperçu en direct */}
      <div>
        <p className="mb-2 text-sm font-bold text-neutral-500">Aperçu</p>
        <div
          className="w-72 rounded-3xl p-6 text-white shadow-2xl"
          style={{ background: color }}
        >
          <p className="text-xs opacity-70">{category || "Carte de fidélité"}</p>
          <p className="text-xl font-bold">{name || "Votre commerce"}</p>
          <p className="mb-4 text-sm opacity-80">{programName || "Carte de fidélité"}</p>
          <div className="rounded-2xl bg-white/10 p-3">
            <StampGrid count={Math.min(3, stampsGoal)} goal={stampsGoal} color="#ffffff" />
          </div>
          <p className="mt-4 text-xs opacity-90">
            Récompense : {rewardLabel || "1 produit offert"} 🎁
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
