import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// Service web PassKit : liste des passes mises à jour pour un appareil.
// Apple appelle cet endpoint (après un push) pour savoir quelles passes
// re-télécharger. On renvoie les numéros de série modifiés depuis `tag`.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deviceLibraryId: string }> },
) {
  const { deviceLibraryId } = await params;
  const sinceRaw = request.nextUrl.searchParams.get("passesUpdatedSince");
  const since = sinceRaw ? new Date(Number(sinceRaw)) : null;

  const regs = await prisma.passRegistration.findMany({
    where: { deviceLibraryId },
    include: { card: { select: { publicToken: true, walletUpdatedAt: true } } },
  });

  const updated = regs.filter(
    (r) => !since || r.card.walletUpdatedAt.getTime() > since.getTime(),
  );

  if (updated.length === 0) {
    // 204 = rien de nouveau.
    return new Response(null, { status: 204 });
  }

  const lastUpdated = Math.max(
    ...updated.map((r) => r.card.walletUpdatedAt.getTime()),
  );

  return Response.json({
    lastUpdated: String(lastUpdated),
    serialNumbers: updated.map((r) => r.card.publicToken),
  });
}
