import type { Locale } from "./types";

const TARGET_LOCALES: Exclude<Locale, "fr">[] = [
  "en",
  "ar",
  "es",
  "it",
  "de",
  "pt",
  "zh",
];

const LOCALE_NAMES: Record<Exclude<Locale, "fr">, string> = {
  en: "English",
  ar: "Arabic (Modern Standard)",
  es: "Spanish",
  it: "Italian",
  de: "German",
  pt: "Portuguese (Brazil)",
  zh: "Chinese (Simplified)",
};

export type TranslateKind =
  | "tagline"
  | "category_name"
  | "category_tagline"
  | "dish_name"
  | "dish_subtitle"
  | "dish_description";

const KIND_CONTEXT: Record<TranslateKind, string> = {
  tagline: "a short restaurant tagline / slogan",
  category_name: "a menu category name (short, max 3-4 words)",
  category_tagline: "a short tagline for a menu category",
  dish_name: "the name of a dish on a restaurant menu",
  dish_subtitle: "a short subtitle describing a dish (ingredients hint)",
  dish_description: "a longer description of a dish (ingredients, prep)",
};

export async function translateText(
  text: string,
  kind: TranslateKind
): Promise<Partial<Record<Exclude<Locale, "fr">, string>> | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("[translate] ANTHROPIC_API_KEY non configurée");
    return null;
  }
  const trimmed = text.trim();
  if (!trimmed) return {};

  const languageList = TARGET_LOCALES.map(
    (l) => `- "${l}": ${LOCALE_NAMES[l]}`
  ).join("\n");

  const prompt = `Translate the following French text into 7 languages.

Context: ${KIND_CONTEXT[kind]} for a restaurant digital menu.

Target languages (use these exact codes as JSON keys):
${languageList}

Guidelines:
- Keep the same tone, length and style as the original.
- For dish names and ingredients, use the standard translation in each cuisine (don't over-translate brand names like "Tiramisu" which stay the same).
- For Arabic, use Modern Standard Arabic.
- For Chinese, use Simplified Chinese characters.
- Output ONLY a single valid JSON object, no preamble, no markdown fences.

French text:
"""${trimmed}"""`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("[translate] anthropic error", res.status, body);
      return null;
    }
    const data = await res.json();
    const content = data.content?.[0]?.text;
    if (typeof content !== "string") return null;
    const jsonStart = content.indexOf("{");
    const jsonEnd = content.lastIndexOf("}");
    if (jsonStart < 0 || jsonEnd < 0) return null;
    const slice = content.slice(jsonStart, jsonEnd + 1);
    const parsed = JSON.parse(slice) as Record<string, string>;
    const out: Partial<Record<Exclude<Locale, "fr">, string>> = {};
    for (const l of TARGET_LOCALES) {
      if (typeof parsed[l] === "string") out[l] = parsed[l];
    }
    return out;
  } catch (err) {
    console.error("[translate] exception", err);
    return null;
  }
}
