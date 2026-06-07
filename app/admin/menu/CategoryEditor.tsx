"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useRestaurantStore } from "@/lib/store";
import type { Category } from "@/lib/types";
import { Button, Field, Input } from "../_components/ui";
import { FileUploader } from "../_components/FileUploader";

type Props = {
  category: Category | null;
  onClose: () => void;
};

export function CategoryEditor({ category, onClose }: Props) {
  const addCategory = useRestaurantStore((s) => s.addCategory);
  const updateCategory = useRestaurantStore((s) => s.updateCategory);

  const [name, setName] = useState(category?.name ?? "");
  const [tagline, setTagline] = useState(category?.tagline ?? "");
  const [imageUrl, setImageUrl] = useState<string | undefined>(
    category?.imageUrl
  );

  const save = () => {
    if (!name.trim()) return;
    const payload = { name: name.trim(), tagline: tagline.trim() || undefined, imageUrl };
    if (category) updateCategory(category.id, payload);
    else addCategory(payload);
    onClose();
  };

  return (
    <Modal title={category ? "Modifier la catégorie" : "Nouvelle catégorie"} onClose={onClose}>
      <Field label="Nom de la catégorie">
        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Plats principaux"
        />
      </Field>
      <div className="mt-3">
        <Field label="Slogan (optionnel)">
          <Input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="Ex: Hearty plates for every craving"
          />
        </Field>
      </div>
      <div className="mt-4">
        <FileUploader
          label="Image de catégorie"
          kind="image"
          accept="image/*"
          value={imageUrl}
          onChange={setImageUrl}
        />
      </div>
      <div className="mt-5 flex gap-2">
        <Button variant="secondary" onClick={onClose} className="flex-1">
          Annuler
        </Button>
        <Button onClick={save} disabled={!name.trim()} className="flex-1">
          Enregistrer
        </Button>
      </div>
    </Modal>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
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
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-neutral-100"
          >
            <X size={18} />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
