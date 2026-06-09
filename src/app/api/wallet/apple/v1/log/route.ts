import { NextRequest } from "next/server";

// Service web PassKit : endpoint de log appelé par Apple en cas d'erreur.
// On l'accepte simplement (et on journalise) pour ne pas générer d'erreurs.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body?.logs?.length) console.log("[PassKit log]", body.logs.join(" | "));
  } catch {
    /* ignore */
  }
  return new Response(null, { status: 200 });
}
