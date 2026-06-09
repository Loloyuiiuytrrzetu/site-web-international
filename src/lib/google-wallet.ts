// Google Wallet — carte de fidélité pour Android.
//
// Configuration via variables d'environnement (voir docs/GOOGLE_WALLET.md) :
//   GOOGLE_WALLET_ISSUER_ID  identifiant émetteur (Google Pay & Wallet Console)
//   GOOGLE_WALLET_SA_EMAIL   e-mail du compte de service
//   GOOGLE_WALLET_SA_KEY     clé privée du compte de service (PEM)
//
// Tant que ce n'est pas configuré, Google Wallet est « non configuré » et
// l'app fonctionne normalement.

import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { baseUrl } from "@/lib/url";

const WO_BASE = "https://walletobjects.googleapis.com/walletobjects/v1";
const SCOPE = "https://www.googleapis.com/auth/wallet_object.issuer";

export type GoogleConfig = { issuerId: string; saEmail: string; saKey: string };

export function googleConfig(): GoogleConfig | null {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
  const saEmail = process.env.GOOGLE_WALLET_SA_EMAIL;
  // La clé peut contenir des "\n" littéraux (cas fréquent sur Vercel).
  const saKey = process.env.GOOGLE_WALLET_SA_KEY?.replace(/\\n/g, "\n");
  if (!issuerId || !saEmail || !saKey) return null;
  return { issuerId, saEmail, saKey };
}

export function isGoogleConfigured(): boolean {
  return googleConfig() !== null;
}

// --- Authentification (jeton d'accès via compte de service) -----------------

let cachedToken: { token: string; exp: number } | null = null;

async function getAccessToken(cfg: GoogleConfig): Promise<string> {
  if (cachedToken && cachedToken.exp > Date.now() + 30_000) return cachedToken.token;

  const now = Math.floor(Date.now() / 1000);
  const assertion = jwt.sign(
    { iss: cfg.saEmail, scope: SCOPE, aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 },
    cfg.saKey,
    { algorithm: "RS256" },
  );

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) throw new Error(`Google token error ${res.status}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: json.access_token, exp: Date.now() + json.expires_in * 1000 };
  return json.access_token;
}

async function api(
  cfg: GoogleConfig,
  method: string,
  path: string,
  body?: unknown,
): Promise<{ status: number; json: Record<string, unknown> }> {
  const token = await getAccessToken(cfg);
  const res = await fetch(`${WO_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json: Record<string, unknown> = {};
  try {
    json = (await res.json()) as Record<string, unknown>;
  } catch {
    /* corps vide */
  }
  return { status: res.status, json };
}

// --- Identifiants déterministes ---------------------------------------------

function classId(cfg: GoogleConfig, businessId: string): string {
  return `${cfg.issuerId}.biz_${businessId}`;
}
function objectId(cfg: GoogleConfig, token: string): string {
  return `${cfg.issuerId}.card_${token}`;
}

// --- Classe (modèle du programme, une par commerce) -------------------------

type Business = { id: string; name: string; color: string; category: string | null };

function classPayload(cfg: GoogleConfig, business: Business) {
  return {
    id: classId(cfg, business.id),
    issuerName: business.name,
    programName: business.category ? `${business.category}` : "Carte de fidélité",
    reviewStatus: "UNDER_REVIEW",
    hexBackgroundColor: business.color,
    programLogo: {
      sourceUri: { uri: `${baseUrl()}/api/wallet/google/logo/${business.id}` },
      contentDescription: { defaultValue: { language: "fr", value: business.name } },
    },
  };
}

async function ensureClass(cfg: GoogleConfig, business: Business): Promise<void> {
  const id = classId(cfg, business.id);
  const get = await api(cfg, "GET", `/loyaltyClass/${id}`);
  if (get.status === 404) {
    await api(cfg, "POST", `/loyaltyClass`, classPayload(cfg, business));
  } else {
    await api(cfg, "PUT", `/loyaltyClass/${id}`, classPayload(cfg, business));
  }
}

// --- Objet (la carte d'un client) -------------------------------------------

type CardFull = {
  publicToken: string;
  stampsCount: number;
  walletMessage: string | null;
  program: { stampsGoal: number; rewardLabel: string; business: Business };
  customer: { firstName: string | null; lastName: string | null; email: string | null };
};

function objectPayload(cfg: GoogleConfig, card: CardFull) {
  const business = card.program.business;
  return {
    id: objectId(cfg, card.publicToken),
    classId: classId(cfg, business.id),
    state: "ACTIVE",
    accountName: [card.customer.firstName, card.customer.lastName].filter(Boolean).join(" ") || "Client",
    loyaltyPoints: {
      label: "Tampons",
      balance: { string: `${card.stampsCount}/${card.program.stampsGoal}` },
    },
    secondaryLoyaltyPoints: {
      label: "Récompense",
      balance: { string: card.program.rewardLabel },
    },
    barcode: {
      type: "QR_CODE",
      value: `${baseUrl()}/c/${card.publicToken}`,
    },
    hexBackgroundColor: business.color,
  };
}

async function ensureObject(cfg: GoogleConfig, card: CardFull): Promise<void> {
  const id = objectId(cfg, card.publicToken);
  const get = await api(cfg, "GET", `/loyaltyObject/${id}`);
  if (get.status === 404) {
    await api(cfg, "POST", `/loyaltyObject`, objectPayload(cfg, card));
  } else {
    await api(cfg, "PUT", `/loyaltyObject/${id}`, objectPayload(cfg, card));
  }
}

// --- Lien « Ajouter à Google Wallet » ---------------------------------------

/** Crée la classe + l'objet si besoin, puis renvoie l'URL « Save to Google Wallet ». */
export async function googleSaveUrl(token: string): Promise<string | null> {
  const cfg = googleConfig();
  if (!cfg) return null;

  const card = await prisma.stampCard.findUnique({
    where: { publicToken: token },
    include: { program: { include: { business: true } }, customer: true },
  });
  if (!card) return null;

  await ensureClass(cfg, card.program.business);
  await ensureObject(cfg, card);

  const claims = {
    iss: cfg.saEmail,
    aud: "google",
    typ: "savetowallet",
    iat: Math.floor(Date.now() / 1000),
    payload: { loyaltyObjects: [{ id: objectId(cfg, card.publicToken) }] },
  };
  const signed = jwt.sign(claims, cfg.saKey, { algorithm: "RS256" });
  return `https://pay.google.com/gp/v/save/${signed}`;
}

// --- Mises à jour & notifications -------------------------------------------

/** Met à jour les points de la carte côté Google (pass mise à jour en silence). */
export async function googleUpdateCard(token: string): Promise<void> {
  const cfg = googleConfig();
  if (!cfg) return;
  const card = await prisma.stampCard.findUnique({
    where: { publicToken: token },
    include: { program: { include: { business: true } }, customer: true },
  });
  if (!card) return;
  const id = objectId(cfg, card.publicToken);
  const get = await api(cfg, "GET", `/loyaltyObject/${id}`);
  if (get.status === 200) await api(cfg, "PUT", `/loyaltyObject/${id}`, objectPayload(cfg, card));
}

/**
 * Diffuse un message (campagne) sur les cartes Google d'un commerce : ajoute un
 * message à chaque objet -> notification sur le téléphone Android.
 * Renvoie le nombre de cartes notifiées.
 */
export async function googleAnnounce(
  businessId: string,
  title: string,
  message: string,
  opts?: { birthdayOnly?: boolean },
): Promise<number> {
  const cfg = googleConfig();
  if (!cfg) return 0;

  const cards = await prisma.stampCard.findMany({
    where: { program: { businessId } },
    include: { customer: true },
  });

  let targets = cards;
  if (opts?.birthdayOnly) {
    const now = new Date();
    targets = cards.filter(
      (c) =>
        c.customer.birthdate &&
        c.customer.birthdate.getMonth() === now.getMonth() &&
        c.customer.birthdate.getDate() === now.getDate(),
    );
  }

  let ok = 0;
  for (const card of targets) {
    const id = objectId(cfg, card.publicToken);
    const res = await api(cfg, "POST", `/loyaltyObject/${id}/addMessage`, {
      message: {
        id: `msg_${Date.now()}`,
        header: title,
        body: message,
        messageType: "TEXT",
      },
    });
    if (res.status >= 200 && res.status < 300) ok++;
  }
  return ok;
}
