"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { createReward, deleteReward } from "@/lib/rewards";

export type RewardItem = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  pointsRequired: number;
  imageUrl: string | null;
  couponCode: string | null;
};

// Gestion des récompenses du programme : liste + formulaire d'ajout.
// Le commerçant peut joindre une PHOTO (compressée côté navigateur en data URL,
// donc pas besoin d'hébergement de fichiers) ou créer un COUPON de réduction.
export function RewardsManager({
  rewards,
  color,
}: {
  rewards: RewardItem[];
  color: string;
}) {
  const [state, formAction, pending] = useActionState(createReward, undefined);
  const [type, setType] = useState<"gift" | "coupon">("gift");
  const [photo, setPhoto] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);

  // Lit le fichier image, le réduit (max 480px) et le convertit en data URL.
  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 480;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        setPhoto(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  }

  // Quand l'ajout réussit, on remet le formulaire à zéro.
  if (state?.ok && formRef.current) {
    formRef.current.reset();
    if (photo) setPhoto("");
  }

  return (
    <div className="space-y-6">
      {/* Liste des récompenses existantes */}
      <div className="space-y-3">
        {rewards.length === 0 && (
          <p className="rounded-xl border border-dashed border-neutral-200 p-4 text-sm text-neutral-500">
            Aucune récompense pour l'instant. Ajoutez-en une ci-dessous 👇
          </p>
        )}
        {rewards.map((r) => (
          <RewardRow key={r.id} reward={r} color={color} />
        ))}
      </div>

      {/* Formulaire d'ajout */}
      <form
        ref={formRef}
        action={formAction}
        className="space-y-4 rounded-2xl border border-neutral-200 p-5"
      >
        <p className="font-bold">Ajouter une récompense</p>

        {/* Type : cadeau ou coupon */}
        <div className="flex gap-2">
          {(["gift", "coupon"] as const).map((t) => (
            <label
              key={t}
              className="flex-1 cursor-pointer rounded-xl border p-3 text-center text-sm font-semibold transition-colors"
              style={{
                borderColor: type === t ? color : "#d4d4d4",
                background: type === t ? `${color}10` : "transparent",
                color: type === t ? color : "#525252",
              }}
            >
              <input
                type="radio"
                name="type"
                value={t}
                checked={type === t}
                onChange={() => setType(t)}
                className="sr-only"
              />
              {t === "gift" ? "🎁 Cadeau" : "🏷️ Coupon réduction"}
            </label>
          ))}
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Titre</span>
          <input
            name="title"
            className="input"
            placeholder={type === "gift" ? "ex : 1 dessert offert" : "ex : -20% sur l'addition"}
            required
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            Description <span className="text-neutral-400">(facultatif)</span>
          </span>
          <input name="description" className="input" placeholder="Détails de l'offre" />
        </label>

        {type === "coupon" && (
          <label className="block">
            <span className="mb-1 block text-sm font-medium">
              Code coupon <span className="text-neutral-400">(facultatif)</span>
            </span>
            <input name="couponCode" className="input" placeholder="ex : MERCI20" />
          </label>
        )}

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Tampons nécessaires</span>
          <input
            name="pointsRequired"
            type="number"
            min={1}
            max={15}
            defaultValue={5}
            className="input"
            required
          />
        </label>

        {/* Photo optionnelle */}
        <div>
          <span className="mb-1 block text-sm font-medium">
            Photo <span className="text-neutral-400">(facultatif)</span>
          </span>
          <input type="file" accept="image/*" onChange={onPickPhoto} className="text-sm" />
          <input type="hidden" name="imageUrl" value={photo} />
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt="Aperçu"
              className="mt-2 h-24 w-24 rounded-xl border border-neutral-200 object-cover"
            />
          )}
        </div>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="btn rounded-xl px-5 py-3 font-semibold text-white disabled:opacity-50"
          style={{ background: color }}
        >
          {pending ? "Ajout…" : "Ajouter la récompense"}
        </button>
      </form>
    </div>
  );
}

function RewardRow({ reward, color }: { reward: RewardItem; color: string }) {
  const [pending, startTransition] = useTransition();

  function remove() {
    if (!confirm(`Supprimer « ${reward.title} » ?`)) return;
    startTransition(() => {
      deleteReward(reward.id);
    });
  }

  return (
    <div
      className={`lift flex items-center gap-3 rounded-2xl border border-neutral-200 p-3 transition-opacity ${
        pending ? "opacity-40" : ""
      }`}
    >
      {reward.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={reward.imageUrl}
          alt=""
          className="h-12 w-12 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl" style={{ background: `${color}12` }}>
          {reward.type === "coupon" ? "🏷️" : "🎁"}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{reward.title}</p>
        <p className="text-xs text-neutral-500">
          {reward.pointsRequired} tampon{reward.pointsRequired > 1 ? "s" : ""}
          {reward.type === "coupon" && reward.couponCode ? ` · code ${reward.couponCode}` : ""}
        </p>
      </div>
      <button
        onClick={remove}
        disabled={pending}
        className="btn rounded-lg px-2 py-1 text-sm text-neutral-400 hover:text-red-600"
        title="Supprimer"
      >
        🗑️
      </button>
    </div>
  );
}
