"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRestaurantStore } from "@/lib/store";
import { Button, Field, Input } from "../../admin/_components/ui";
import type { ManagedRestaurant } from "@/lib/store";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function NewRestaurantModal({ onClose }: { onClose: () => void }) {
  const create = useRestaurantStore((s) => s.createRestaurant);
  const setCurrent = useRestaurantStore((s) => s.setCurrentRestaurant);
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [plan, setPlan] = useState<ManagedRestaurant["plan"]>("starter");
  const [slugTouched, setSlugTouched] = useState(false);

  const onName = (v: string) => {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const submit = () => {
    if (!name.trim()) return;
    const id = create({
      name: name.trim(),
      slug: slug.trim() || slugify(name.trim()),
      tagline: tagline.trim() || undefined,
      plan,
    });
    setCurrent(id);
    onClose();
    router.push("/admin/restaurant");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <div className="relative z-10 max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Nouveau restaurant</h2>
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-neutral-100"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex flex-col gap-3">
          <Field label="Nom du restaurant">
            <Input
              autoFocus
              value={name}
              onChange={(e) => onName(e.target.value)}
              placeholder="Ex: La Trattoria"
            />
          </Field>

          <Field
            label="URL du menu"
            hint={`Le menu sera accessible sur /r/${slug || "votre-resto"}`}
          >
            <div className="flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm">
              <span className="text-neutral-400">/r/</span>
              <input
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                className="flex-1 bg-transparent outline-none"
                placeholder="la-trattoria"
              />
            </div>
          </Field>

          <Field label="Slogan (optionnel)">
            <Input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Cuisine italienne authentique"
            />
          </Field>

          <Field label="Plan d'abonnement">
            <div className="grid grid-cols-3 gap-2">
              {(["starter", "pro", "enterprise"] as const).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPlan(p)}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium capitalize transition ${
                    plan === p
                      ? "border-brand-700 bg-brand-50 text-brand-700"
                      : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  {p}
                  <span className="mt-0.5 block text-[10px] text-neutral-500">
                    {p === "starter" ? "19 €" : p === "pro" ? "39 €" : "99 €"}/mois
                  </span>
                </button>
              ))}
            </div>
          </Field>
        </div>

        <div className="mt-5 flex gap-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button onClick={submit} disabled={!name.trim()} className="flex-1">
            Créer le compte
          </Button>
        </div>
      </div>
    </div>
  );
}
