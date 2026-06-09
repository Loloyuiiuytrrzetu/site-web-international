import { NextRequest } from "next/server";
import { buildPassByToken, isAppleConfigured } from "@/lib/apple-wallet";

// Téléchargement de la passe Apple Wallet d'une carte (bouton « Ajouter au
// Wallet »). Public via le jeton de la carte.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  if (!isAppleConfigured()) {
    return Response.json({ error: "Apple Wallet non configuré." }, { status: 503 });
  }
  const { token } = await params;
  const buffer = await buildPassByToken(token);
  if (!buffer) {
    return Response.json({ error: "Carte introuvable." }, { status: 404 });
  }
  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.apple.pkpass",
      "Content-Disposition": 'attachment; filename="carte.pkpass"',
      "Cache-Control": "no-store",
    },
  });
}
