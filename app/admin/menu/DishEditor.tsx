"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useRestaurantStore } from "@/lib/store";
import type { Dish } from "@/lib/types";
import { Button, Field, Input, Textarea } from "../_components/ui";
import { FileUploader } from "../_components/FileUploader";

type Props = {
  categoryId: string;
  dish: Dish | null;
  onClose: () => void;
};

export function DishEditor({ categoryId, dish, onClose }: Props) {
  const addDish = useRestaurantStore((s) => s.addDish);
  const updateDish = useRestaurantStore((s) => s.updateDish);

  const [name, setName] = useState(dish?.name ?? "");
  const [subtitle, setSubtitle] = useState(dish?.subtitle ?? "");
  const [description, setDescription] = useState(dish?.description ?? "");
  const [price, setPrice] = useState(String(dish?.price.amount ?? ""));
  const [currency, setCurrency] = useState(dish?.price.currency ?? "EUR");
  const [imageUrl, setImageUrl] = useState<string | undefined>(dish?.imageUrl);
  const [model3dUrl, setModel3dUrl] = useState<string | undefined>(
    dish?.model3dUrl
  );
  const [tagsInput, setTagsInput] = useState(dish?.tags?.join(", ") ?? "");
  const [available, setAvailable] = useState(dish?.available ?? true);

  const canSave = name.trim().length > 0 && !isNaN(Number(price));

  const save = () => {
    if (!canSave) return;
    const payload: Omit<Dish, "id"> = {
      name: name.trim(),
      subtitle: subtitle.trim() || undefined,
      description: description.trim() || undefined,
      price: { amount: Number(price), currency },
      imageUrl,
      model3dUrl,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      available,
    };
    if (dish) updateDish(categoryId, dish.id, payload);
    else addDish(categoryId, payload);
    onClose();
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
          <h2 className="text-lg font-semibold">
            {dish ? "Modifier le plat" : "Nouveau plat"}
          </h2>
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
          <Field label="Nom du plat">
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Tagliatelles à la truffe"
            />
          </Field>

          <Field label="Sous-titre">
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Ex: Crème fraîche, parmesan 24 mois"
            />
          </Field>

          <Field label="Description">
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre plat..."
            />
          </Field>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <Field label="Prix">
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </Field>
            </div>
            <Field label="Devise">
              <select
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-200"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="EUR">EUR €</option>
                <option value="USD">USD $</option>
                <option value="GBP">GBP £</option>
                <option value="BHD">BHD</option>
                <option value="AED">AED</option>
                <option value="MAD">MAD</option>
                <option value="XOF">XOF</option>
              </select>
            </Field>
          </div>

          <Field label="Tags (séparés par des virgules)">
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Signature, Végétarien"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <FileUploader
              label="Photo du plat"
              kind="image"
              accept="image/*"
              value={imageUrl}
              onChange={setImageUrl}
            />
            <FileUploader
              label="Modèle 3D (optionnel)"
              kind="3d"
              accept=".glb,.gltf,model/gltf-binary,model/gltf+json"
              value={model3dUrl}
              onChange={setModel3dUrl}
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-brand-700 focus:ring-brand-600"
            />
            <span className="font-medium">Plat disponible</span>
            <span className="ml-auto text-xs text-neutral-500">
              Visible sur le menu client
            </span>
          </label>
        </div>

        <div className="mt-5 flex gap-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button onClick={save} disabled={!canSave} className="flex-1">
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
}
