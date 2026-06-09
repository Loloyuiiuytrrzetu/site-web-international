"use client";

import { useState, useTransition } from "react";
import { addStamp } from "@/lib/loyalty";

// Bouton utilisé à la caisse pour ajouter un tampon à un client.
// En vrai, le serveur scannerait le QR du client ; ici on l'appelle
// directement avec le jeton de la carte.
export function StampButton({
  token,
  color,
}: {
  token: string;
  color: string;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleClick() {
    startTransition(async () => {
      const res = await addStamp(token);
      if ("error" in res) setMessage(res.error);
      else if (res.rewarded) setMessage(`🎉 Récompense : ${res.reward} !`);
      else setMessage(`+1 tampon (${res.stampsCount}/${res.goal})`);
    });
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClick}
        disabled={pending}
        className="rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        style={{ background: color }}
      >
        {pending ? "..." : "+ Tampon"}
      </button>
      {message && <span className="text-sm text-neutral-600">{message}</span>}
    </div>
  );
}
