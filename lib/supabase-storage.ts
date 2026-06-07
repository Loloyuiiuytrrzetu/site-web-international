import { supabase } from "./supabase";

const BUCKET = "restaurant-assets";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 Mo
const MAX_3D_BYTES = 20 * 1024 * 1024; // 20 Mo

export type UploadKind = "image" | "3d";

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

function getExt(name: string): string {
  const i = name.lastIndexOf(".");
  if (i < 0) return "bin";
  return name.slice(i + 1).toLowerCase();
}

function newName(prefix: string, ext: string): string {
  const uuid =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${prefix}-${uuid}.${ext}`;
}

export async function uploadFile(
  file: File,
  restaurantId: string,
  kind: UploadKind
): Promise<UploadResult> {
  if (!restaurantId) {
    return { ok: false, error: "Aucun restaurant sélectionné." };
  }

  const maxBytes = kind === "image" ? MAX_IMAGE_BYTES : MAX_3D_BYTES;
  if (file.size > maxBytes) {
    const maxMo = Math.round(maxBytes / 1024 / 1024);
    return { ok: false, error: `Fichier trop volumineux (max ${maxMo} Mo).` };
  }

  const ext = getExt(file.name);
  const prefix = kind === "image" ? "img" : "model";
  const path = `${restaurantId}/${newName(prefix, ext)}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

  if (error) {
    console.error("uploadFile error:", error);
    return {
      ok: false,
      error: error.message || "Échec du téléversement.",
    };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
