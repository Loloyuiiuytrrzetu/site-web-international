// Envoi de notifications Web Push (côté serveur).
//
// Clés VAPID : on les lit d'abord depuis les variables d'environnement
// (VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY) ; si absentes, on les génère UNE FOIS
// et on les persiste en base (table AppConfig). Ainsi les notifications
// fonctionnent sans aucune configuration manuelle.

import webpush from "web-push";
import { prisma } from "@/lib/prisma";
import { baseUrl } from "@/lib/url";

export type PushPayload = { title: string; body: string; url?: string };

// Sujet VAPID : un contact (exigé par la spec). Configurable via env.
function vapidSubject(): string {
  const s = process.env.VAPID_SUBJECT || "mailto:contact@walletiz.app";
  return s.startsWith("mailto:") || s.startsWith("https://") ? s : `mailto:${s}`;
}

/** Récupère les clés VAPID (env > base > génération+persistance). */
export async function getVapidKeys(): Promise<{ publicKey: string; privateKey: string }> {
  const envPub = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const envPriv = process.env.VAPID_PRIVATE_KEY;
  if (envPub && envPriv) return { publicKey: envPub, privateKey: envPriv };

  const rows = await prisma.appConfig.findMany({
    where: { key: { in: ["vapidPublic", "vapidPrivate"] } },
  });
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  if (map.vapidPublic && map.vapidPrivate) {
    return { publicKey: map.vapidPublic, privateKey: map.vapidPrivate };
  }

  const keys = webpush.generateVAPIDKeys();
  await prisma.$transaction([
    prisma.appConfig.upsert({
      where: { key: "vapidPublic" },
      create: { key: "vapidPublic", value: keys.publicKey },
      update: { value: keys.publicKey },
    }),
    prisma.appConfig.upsert({
      where: { key: "vapidPrivate" },
      create: { key: "vapidPrivate", value: keys.privateKey },
      update: { value: keys.privateKey },
    }),
  ]);
  return keys;
}

/** Clé publique (sûre à exposer au navigateur pour l'abonnement). */
export async function getPublicKey(): Promise<string> {
  return (await getVapidKeys()).publicKey;
}

async function configured() {
  const { publicKey, privateKey } = await getVapidKeys();
  webpush.setVapidDetails(vapidSubject(), publicKey, privateKey);
  return webpush;
}

/**
 * Envoie une notification à tous les abonnés d'un commerce.
 * - `birthdayOnly` : ne cible que les clients dont c'est l'anniversaire aujourd'hui.
 * Chaque notification ouvre la carte personnelle du client.
 * Les abonnements expirés (404/410) sont supprimés automatiquement.
 * Renvoie le nombre d'envois réussis.
 */
export async function sendToBusiness(
  businessId: string,
  base: PushPayload,
  opts?: { birthdayOnly?: boolean },
): Promise<number> {
  const subs = await prisma.pushSubscription.findMany({
    where: { customer: { businessId } },
    include: { customer: { include: { cards: { take: 1 } } } },
  });

  let targets = subs;
  if (opts?.birthdayOnly) {
    const now = new Date();
    targets = subs.filter(
      (s) =>
        s.customer.birthdate &&
        s.customer.birthdate.getMonth() === now.getMonth() &&
        s.customer.birthdate.getDate() === now.getDate(),
    );
  }
  if (targets.length === 0) return 0;

  const wp = await configured();
  const dead: string[] = [];
  let ok = 0;

  await Promise.all(
    targets.map(async (s) => {
      const token = s.customer.cards[0]?.publicToken;
      const payload = JSON.stringify({
        title: base.title,
        body: base.body,
        url: token ? `${baseUrl()}/c/${token}` : baseUrl(),
      } satisfies PushPayload);
      try {
        await wp.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload,
        );
        ok++;
      } catch (err: unknown) {
        const code = (err as { statusCode?: number })?.statusCode;
        if (code === 404 || code === 410) dead.push(s.id);
      }
    }),
  );

  if (dead.length) {
    await prisma.pushSubscription.deleteMany({ where: { id: { in: dead } } });
  }
  return ok;
}
