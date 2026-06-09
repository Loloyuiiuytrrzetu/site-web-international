"use client";

import { useActionState } from "react";
import { enrollCustomer } from "@/lib/enroll";

// Formulaire d'inscription du client (1er scan). Prénom, nom, anniversaire.
export function EnrollForm({ slug, color }: { slug: string; color: string }) {
  // On "fixe" le slug du commerce dans l'action serveur.
  const action = enrollCustomer.bind(null, slug);
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Prénom</span>
          <input name="firstName" className="input" autoComplete="given-name" required />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Nom</span>
          <input name="lastName" className="input" autoComplete="family-name" required />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">
          Date d'anniversaire 🎂
        </span>
        <input name="birthdate" type="date" className="input" />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">
          Email <span className="text-neutral-400">(facultatif)</span>
        </span>
        <input name="email" type="email" className="input" autoComplete="email" />
      </label>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl py-3 font-semibold text-white disabled:opacity-50"
        style={{ background: color }}
      >
        {pending ? "Création de la carte…" : "Recevoir ma carte de fidélité"}
      </button>
    </form>
  );
}
