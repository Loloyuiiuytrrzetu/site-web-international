import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { translateText } from "@/lib/translate-server";
import { sendInviteEmail } from "@/lib/email-resend";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const DEFAULT_THEME = {
  primaryColor: "#1f2937",
  backgroundColor: "#faf7f2",
  textColor: "#1f2937",
  accentColor: "#c2410c",
};

function getSiteOrigin(req: NextRequest): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const origin = req.headers.get("origin");
  if (origin) return origin;
  const host = req.headers.get("host");
  if (host) return `https://${host}`;
  return "https://walletiz.vercel.app";
}

export async function POST(req: NextRequest) {
  if (!URL || !ANON || !SERVICE) {
    return NextResponse.json(
      {
        error:
          "Variables Supabase manquantes (SUPABASE_SERVICE_ROLE_KEY non configurée ?).",
      },
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

  let body: {
    name?: string;
    slug?: string;
    tagline?: string;
    plan?: string;
    ownerEmail?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide." }, { status: 400 });
  }

  const name = body.name?.trim();
  const slug = (body.slug?.trim() || (name ? slugify(name) : "")).trim();
  const tagline = body.tagline?.trim() || null;
  const plan = ["starter", "pro", "enterprise"].includes(body.plan ?? "")
    ? (body.plan as "starter" | "pro" | "enterprise")
    : "starter";
  const ownerEmail = body.ownerEmail?.trim().toLowerCase();

  if (!name) {
    return NextResponse.json(
      { error: "Le nom du restaurant est requis." },
      { status: 400 }
    );
  }
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json(
      { error: "Le slug doit contenir uniquement des lettres, chiffres et tirets." },
      { status: 400 }
    );
  }
  if (!ownerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) {
    return NextResponse.json(
      { error: "L'email du restaurateur est invalide." },
      { status: 400 }
    );
  }

  const admin = createClient(URL, SERVICE, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: existingSlug } = await admin
    .from("restaurants")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existingSlug) {
    return NextResponse.json(
      { error: `Ce slug "${slug}" est déjà utilisé.` },
      { status: 409 }
    );
  }

  const { data: resto, error: restoErr } = await admin
    .from("restaurants")
    .insert({
      name,
      slug,
      tagline,
      plan,
      status: "active",
      locales: ["fr", "en", "ar", "es", "it", "de", "pt", "zh"],
      default_locale: "fr",
      theme: DEFAULT_THEME,
      contact: {},
    })
    .select("id")
    .single();

  if (restoErr || !resto) {
    return NextResponse.json(
      { error: restoErr?.message || "Échec création restaurant." },
      { status: 500 }
    );
  }

  const siteOrigin = getSiteOrigin(req);
  const redirectTo = `${siteOrigin}/auth/setup`;

  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "invite",
    email: ownerEmail,
    options: {
      data: {
        role: "restaurateur",
        restaurant_id: resto.id,
      },
      redirectTo,
    },
  });

  if (linkErr || !linkData?.properties?.action_link) {
    await admin.from("restaurants").delete().eq("id", resto.id);
    const msg = linkErr?.message.includes("already")
      ? "Un utilisateur avec cet email existe déjà."
      : linkErr?.message ?? "Échec de génération du lien d'invitation.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  await admin
    .from("profiles")
    .update({ role: "restaurateur", restaurant_id: resto.id })
    .eq("email", ownerEmail);

  const emailRes = await sendInviteEmail({
    to: ownerEmail,
    inviteLink: linkData.properties.action_link,
    restaurantName: name,
  });

  if (!emailRes.ok) {
    return NextResponse.json(
      {
        error: `Le restaurant a été créé mais l'email n'a pas pu être envoyé. ${emailRes.error}`,
      },
      { status: 500 }
    );
  }

  if (tagline) {
    const trans = await translateText(tagline, "tagline");
    if (trans.ok && Object.keys(trans.data).length > 0) {
      const translations: Record<string, { tagline: string }> = {};
      for (const [locale, translated] of Object.entries(trans.data)) {
        if (translated) translations[locale] = { tagline: translated };
      }
      await admin
        .from("restaurants")
        .update({ translations })
        .eq("id", resto.id);
    }
  }

  return NextResponse.json({
    restaurantId: resto.id,
    slug,
    ownerEmail,
    emailSent: true,
  });
}
