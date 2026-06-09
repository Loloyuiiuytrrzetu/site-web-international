import { NextRequest } from "next/server";
import { googleSaveUrl, isGoogleConfigured } from "@/lib/google-wallet";

// « Ajouter à Google Wallet » : crée la carte côté Google si besoin, puis
// redirige vers le lien officiel d'ajout au Wallet.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  if (!isGoogleConfigured()) {
    return Response.json({ error: "Google Wallet non configuré." }, { status: 503 });
  }
  const { token } = await params;
  try {
    const url = await googleSaveUrl(token);
    if (!url) return Response.json({ error: "Carte introuvable." }, { status: 404 });
    return Response.redirect(url, 302);
  } catch {
    return Response.json({ error: "Erreur Google Wallet." }, { status: 502 });
  }
}
