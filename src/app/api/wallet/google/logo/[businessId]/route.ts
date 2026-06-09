import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { solidPng } from "@/lib/png";

// Logo PNG du commerce (couleur de marque), utilisé par la classe Google Wallet.
// Google a besoin d'une URL d'image publique ; on génère un carré uni.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> },
) {
  const { businessId } = await params;
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { color: true },
  });
  const png = solidPng(660, business?.color ?? "#6e1023");
  return new Response(new Uint8Array(png), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
