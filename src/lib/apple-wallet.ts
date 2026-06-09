// Apple Wallet — génération et signature de la passe (.pkpass).
//
// La configuration (certificats Apple) est lue depuis les variables
// d'environnement. Tant qu'elles ne sont pas définies, le Wallet est
// « non configuré » et l'app continue de fonctionner normalement.
//
// Variables attendues (voir docs/APPLE_WALLET.md) :
//   APPLE_PASS_TYPE_ID        ex: pass.app.walletiz.loyalty
//   APPLE_TEAM_ID             identifiant d'équipe Apple Developer
//   APPLE_PASS_CERT           certificat Pass Type ID (PEM ou base64)
//   APPLE_PASS_KEY            clé privée associée (PEM ou base64)
//   APPLE_PASS_KEY_PASSPHRASE passphrase de la clé (si protégée)
//   APPLE_WWDR_CERT           certificat intermédiaire Apple WWDR (PEM ou base64)

import { PKPass } from "passkit-generator";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { baseUrl } from "@/lib/url";
import { solidPng, hexToRgbString } from "@/lib/png";
import { customerName } from "@/lib/format";

export type AppleConfig = {
  passTypeId: string;
  teamId: string;
  signerCert: Buffer;
  signerKey: Buffer;
  signerKeyPassphrase?: string;
  wwdr: Buffer;
};

// Accepte une valeur PEM brute (contient "BEGIN") ou encodée en base64.
function readCert(value?: string): Buffer | null {
  if (!value) return null;
  if (value.includes("BEGIN")) return Buffer.from(value, "utf8");
  try {
    return Buffer.from(value, "base64");
  } catch {
    return null;
  }
}

export function appleConfig(): AppleConfig | null {
  const passTypeId = process.env.APPLE_PASS_TYPE_ID;
  const teamId = process.env.APPLE_TEAM_ID;
  const signerCert = readCert(process.env.APPLE_PASS_CERT);
  const signerKey = readCert(process.env.APPLE_PASS_KEY);
  const wwdr = readCert(process.env.APPLE_WWDR_CERT);
  if (!passTypeId || !teamId || !signerCert || !signerKey || !wwdr) return null;
  return {
    passTypeId,
    teamId,
    signerCert,
    signerKey,
    wwdr,
    signerKeyPassphrase: process.env.APPLE_PASS_KEY_PASSPHRASE || undefined,
  };
}

export function isAppleConfigured(): boolean {
  return appleConfig() !== null;
}

/** Garantit qu'une carte possède un jeton d'autorisation pour le service web. */
export async function ensureAuthToken(
  cardId: string,
  existing: string | null,
): Promise<string> {
  if (existing) return existing;
  const token = randomBytes(20).toString("hex");
  await prisma.stampCard.update({
    where: { id: cardId },
    data: { walletAuthToken: token },
  });
  return token;
}

type CardForPass = {
  id: string;
  publicToken: string;
  stampsCount: number;
  walletAuthToken: string | null;
  walletMessage: string | null;
  customer: { firstName: string | null; lastName: string | null; email: string | null };
  program: {
    name: string;
    stampsGoal: number;
    rewardLabel: string;
    business: { name: string; color: string };
  };
};

/** Construit le buffer .pkpass signé pour une carte. */
export async function buildPassBuffer(card: CardForPass): Promise<Buffer | null> {
  const cfg = appleConfig();
  if (!cfg) return null;

  const business = card.program.business;
  const color = business.color;
  const authToken = await ensureAuthToken(card.id, card.walletAuthToken);
  const remaining = Math.max(0, card.program.stampsGoal - card.stampsCount);

  const pass = new PKPass(
    {
      "icon.png": solidPng(29, color),
      "icon@2x.png": solidPng(58, color),
      "logo.png": solidPng(160, color),
      "logo@2x.png": solidPng(320, color),
    },
    {
      wwdr: cfg.wwdr,
      signerCert: cfg.signerCert,
      signerKey: cfg.signerKey,
      signerKeyPassphrase: cfg.signerKeyPassphrase,
    },
    {
      passTypeIdentifier: cfg.passTypeId,
      teamIdentifier: cfg.teamId,
      serialNumber: card.publicToken,
      organizationName: business.name,
      description: `Carte de fidélité ${business.name}`,
      foregroundColor: "rgb(255,255,255)",
      labelColor: "rgb(255,255,255)",
      backgroundColor: hexToRgbString(color),
      webServiceURL: `${baseUrl()}/api/wallet/apple/v1`,
      authenticationToken: authToken,
    },
  );

  pass.type = "storeCard";

  pass.headerFields.push({
    key: "stamps",
    label: "Tampons",
    value: `${card.stampsCount}/${card.program.stampsGoal}`,
  });
  pass.primaryFields.push({
    key: "program",
    label: card.program.name,
    value: business.name,
  });
  pass.secondaryFields.push(
    { key: "reward", label: "Récompense", value: card.program.rewardLabel },
    { key: "remaining", label: "Restant", value: `${remaining}` },
  );

  // Le message d'actualité (campagne) : sa modification déclenche la notif iPhone.
  if (card.walletMessage) {
    pass.backFields.push({
      key: "news",
      label: "Actualité",
      value: card.walletMessage,
      changeMessage: "%@",
    });
  }
  pass.backFields.push({
    key: "holder",
    label: "Client",
    value: customerName(card.customer),
  });

  pass.setBarcodes({
    message: `${baseUrl()}/c/${card.publicToken}`,
    format: "PKBarcodeFormatQR",
    messageEncoding: "iso-8859-1",
  });

  return pass.getAsBuffer();
}

/** Charge une carte par jeton public et construit sa passe. */
export async function buildPassByToken(token: string): Promise<Buffer | null> {
  if (!isAppleConfigured()) return null;
  const card = await prisma.stampCard.findUnique({
    where: { publicToken: token },
    include: { program: { include: { business: true } }, customer: true },
  });
  if (!card) return null;
  return buildPassBuffer(card);
}
