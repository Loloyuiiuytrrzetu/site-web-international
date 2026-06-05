"use client";

import { Box, Image as ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useRestaurantStore } from "@/lib/store";
import { uploadFile } from "@/lib/supabase-storage";

type Props = {
  label: string;
  accept: string;
  value?: string;
  onChange: (url: string | undefined) => void;
  kind: "image" | "3d";
};

export function FileUploader({ label, accept, value, onChange, kind }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const restaurantId = useRestaurantStore((s) => s.currentRestaurantId);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    const result = await uploadFile(file, restaurantId, kind);
    setUploading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onChange(result.url);
  };

  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-neutral-700">{label}</p>
      <div className="flex items-start gap-3">
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50">
          {uploading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
              <Loader2 size={20} className="animate-spin text-neutral-700" />
            </div>
          )}
          {value && kind === "image" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          )}
          {value && kind === "3d" && (
            <div className="flex flex-col items-center gap-1 text-brand-700">
              <Box size={28} />
              <span className="text-[10px] font-semibold">3D OK</span>
            </div>
          )}
          {!value && !uploading && (
            <div className="flex flex-col items-center gap-1 text-neutral-400">
              {kind === "image" ? <ImageIcon size={20} /> : <Box size={20} />}
              <span className="text-[10px]">Vide</span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <button
            type="button"
            disabled={uploading}
            onClick={() => ref.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-800 hover:bg-neutral-50 active:scale-95 disabled:opacity-60"
          >
            <Upload size={14} />
            {uploading ? "Téléversement..." : value ? "Remplacer" : "Téléverser"}
          </button>
          {value && !uploading && (
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 active:scale-95"
            >
              <Trash2 size={14} />
              Supprimer
            </button>
          )}
          <p className="text-[10px] text-neutral-500">
            {kind === "image"
              ? "JPG, PNG ou WebP. Max 5 Mo."
              : "GLB ou GLTF. Max 20 Mo."}
          </p>
          {error && (
            <p className="text-[11px] font-medium text-red-600">{error}</p>
          )}
        </div>
      </div>
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
