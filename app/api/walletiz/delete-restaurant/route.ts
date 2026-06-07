import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: NextRequest) {
  if (!URL || !ANON || !SERVICE) {
    return NextResponse.json(
      { error: "Variables Supabase manquantes." },
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

  const { data: profile } = await userClient
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profile?.role !== "walletiz") {
    return NextResponse.json(
      { error: "Accès refusé (rôle super admin requis)." },
      { status: 403 }
    );
  }

  let body: { restaurantId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide." }, { status: 400 });
  }

  const restaurantId = body.restaurantId?.trim();
  if (!restaurantId) {
    return NextResponse.json(
      { error: "restaurantId manquant." },
      { status: 400 }
    );
  }

  const admin = createClient(URL, SERVICE, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: linkedProfiles } = await admin
    .from("profiles")
    .select("id")
    .eq("restaurant_id", restaurantId);

  for (const p of linkedProfiles ?? []) {
    const { error: delUserErr } = await admin.auth.admin.deleteUser(p.id);
    if (delUserErr) {
      return NextResponse.json(
        { error: `Échec suppression utilisateur : ${delUserErr.message}` },
        { status: 500 }
      );
    }
  }

  const { error: delRestoErr } = await admin
    .from("restaurants")
    .delete()
    .eq("id", restaurantId);

  if (delRestoErr) {
    return NextResponse.json(
      { error: `Échec suppression restaurant : ${delRestoErr.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
