import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildPassBuffer, isAppleConfigured } from "@/lib/apple-wallet";

// Service web PassKit : renvoie la dernière version de la passe.
// Appelé par l'iPhone après un push pour rafraîchir la carte.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serialNumber: string }> },
) {
  if (!isAppleConfigured()) return new Response(null, { status: 503 });
  const { serialNumber } = await params;

  const card = await prisma.stampCard.findUnique({
    where: { publicToken: serialNumber },
    include: { program: { include: { business: true } }, customer: true },
  });
  if (!card) return new Response(null, { status: 404 });

  // Authentification ApplePass.
  const token = (request.headers.get("authorization") || "")
    .replace(/^ApplePass\s+/i, "")
    .trim();
  if (!card.walletAuthToken || card.walletAuthToken !== token) {
    return new Response(null, { status: 401 });
  }

  const buffer = await buildPassBuffer(card);
  if (!buffer) return new Response(null, { status: 503 });

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.apple.pkpass",
      "Last-Modified": card.walletUpdatedAt.toUTCString(),
      "Cache-Control": "no-store",
    },
  });
}
