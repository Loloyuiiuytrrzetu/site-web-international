import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// Service web PassKit : (dé)enregistrement d'un appareil pour une passe.
// Apple appelle ces endpoints quand le client ajoute / retire la carte du Wallet.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Vérifie l'en-tête "Authorization: ApplePass <authToken>" contre la carte.
async function authCard(request: NextRequest, serialNumber: string) {
  const header = request.headers.get("authorization") || "";
  const token = header.replace(/^ApplePass\s+/i, "").trim();
  if (!token) return null;
  const card = await prisma.stampCard.findUnique({
    where: { publicToken: serialNumber },
    select: { id: true, walletAuthToken: true },
  });
  if (!card || !card.walletAuthToken || card.walletAuthToken !== token) return null;
  return card;
}

// Enregistrement de l'appareil (le client a ajouté la carte au Wallet).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ deviceLibraryId: string; serialNumber: string }> },
) {
  const { deviceLibraryId, serialNumber } = await params;
  const card = await authCard(request, serialNumber);
  if (!card) return new Response(null, { status: 401 });

  let pushToken = "";
  try {
    const body = await request.json();
    pushToken = String(body?.pushToken ?? "");
  } catch {
    /* ignore */
  }
  if (!pushToken) return new Response(null, { status: 400 });

  const existing = await prisma.passRegistration.findUnique({
    where: { deviceLibraryId_cardId: { deviceLibraryId, cardId: card.id } },
  });

  if (existing) {
    if (existing.pushToken !== pushToken) {
      await prisma.passRegistration.update({
        where: { id: existing.id },
        data: { pushToken },
      });
    }
    return new Response(null, { status: 200 }); // déjà enregistré
  }

  await prisma.passRegistration.create({
    data: { cardId: card.id, deviceLibraryId, pushToken },
  });
  return new Response(null, { status: 201 });
}

// Désenregistrement de l'appareil (carte retirée du Wallet).
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ deviceLibraryId: string; serialNumber: string }> },
) {
  const { deviceLibraryId, serialNumber } = await params;
  const card = await authCard(request, serialNumber);
  if (!card) return new Response(null, { status: 401 });

  await prisma.passRegistration.deleteMany({
    where: { deviceLibraryId, cardId: card.id },
  });
  return new Response(null, { status: 200 });
}
