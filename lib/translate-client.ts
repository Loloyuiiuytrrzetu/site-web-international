"use client";

import { supabase } from "./supabase";
import type { Locale, Translatable } from "./types";

export type TranslateKind =
  | "tagline"
  | "category_name"
  | "category_tagline"
  | "dish_name"
  | "dish_subtitle"
  | "dish_description";

type TranslationMap = Partial<Record<Exclude<Locale, "fr">, string>>;

export async function callTranslate(
  text: string,
  kind: TranslateKind
): Promise<TranslationMap | null> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return null;
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text, kind }),
    });
    if (!res.ok) {
      console.error("[translate-client] HTTP", res.status);
      return null;
    }
    const data = await res.json();
    return (data.translations as TranslationMap) ?? null;
  } catch (err) {
    console.error("[translate-client] exception", err);
    return null;
  }
}

export function mergeFieldTranslation<K extends string>(
  existing: Translatable<K> | undefined,
  field: K,
  fieldTrans: TranslationMap
): Translatable<K> {
  const result: Translatable<K> = { ...(existing ?? {}) };
  for (const [locale, value] of Object.entries(fieldTrans)) {
    const l = locale as Exclude<Locale, "fr">;
    result[l] = { ...(result[l] ?? {}), [field]: value } as Translatable<K>[Locale];
  }
  return result;
}

const DEBOUNCE_MS = 1500;
const timers = new Map<string, ReturnType<typeof setTimeout>>();

export function debouncedTranslate(
  key: string,
  text: string,
  kind: TranslateKind,
  onResult: (translations: TranslationMap) => void
) {
  const existing = timers.get(key);
  if (existing) clearTimeout(existing);
  const t = setTimeout(async () => {
    timers.delete(key);
    const result = await callTranslate(text, kind);
    if (result) onResult(result);
  }, DEBOUNCE_MS);
  timers.set(key, t);
}
