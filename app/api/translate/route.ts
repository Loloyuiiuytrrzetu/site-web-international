import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { translateText, type TranslateKind } from "@/lib/translate-server";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const VALID_KINDS: TranslateKind[] = [
  "tagline",
  "category_name",
  "category_tagline",
  "dish_name",
  "dish_subtitle",
  "dish_description",
];

export async function POST(req: NextRequest) {
  if (!URL || !ANON) {
    return NextResponse.json(
      { error: "Configuration Supabase manquante." },
      { status: 500 }
    );
  }
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  const token = auth.slice(7);

  const userClient = createClient(URL, ANON, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData.user) {
    return NextResponse.json({ error: "Session invalide." }, { status: 401 });
  }

  let body: { text?: string; kind?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide." }, { status: 400 });
  }
  const text = body.text;
  const kind = body.kind as TranslateKind | undefined;
  if (typeof text !== "string" || !kind || !VALID_KINDS.includes(kind)) {
    return NextResponse.json(
      { error: "Paramètres invalides." },
      { status: 400 }
    );
  }
  if (text.length > 2000) {
    return NextResponse.json({ error: "Texte trop long." }, { status: 400 });
  }
  const result = await translateText(text, kind);
  if (!result) {
    return NextResponse.json(
      { error: "Échec de la traduction." },
      { status: 500 }
    );
  }
  return NextResponse.json({ translations: result });
}
