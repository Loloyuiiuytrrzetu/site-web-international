"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/lib/session-actions";
import { BRAND } from "@/lib/brand";

// Connexion de l'espace commerçant (scanner, dashboard, personnalisation).
export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <main className="mx-auto flex min-h-full w-full max-w-sm flex-1 flex-col justify-center p-6">
      <Link href="/" className="mb-2 text-sm text-neutral-400 hover:underline">
        ← {BRAND.name}
      </Link>
      <h1 className="text-2xl font-bold">Espace commerçant</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Connectez-vous pour accéder à votre scanner et votre tableau de bord.
      </p>

      <form action={formAction} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Identifiant</label>
          <input
            name="slug"
            autoCapitalize="none"
            autoComplete="username"
            placeholder="ex : chez-mario"
            className="w-full rounded-xl border border-neutral-200 px-4 py-3"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Mot de passe</label>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            className="w-full rounded-xl border border-neutral-200 px-4 py-3"
            required
          />
        </div>

        {state?.error && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl py-3 font-semibold text-white disabled:opacity-50"
          style={{ background: BRAND.bordeaux }}
        >
          {pending ? "Connexion…" : "Se connecter"}
        </button>
      </form>

      <p className="mt-6 rounded-xl bg-neutral-50 p-3 text-center text-xs text-neutral-500">
        Démo : identifiant <strong>chez-mario</strong> · mot de passe{" "}
        <strong>walletiz</strong>
      </p>
    </main>
  );
}
