"use server";

import { prisma } from "@/lib/prisma";
import { getPublicKey } from "@/lib/push";

// Actions appelées depuis la carte client (publique) pour gérer l'abonnement
// aux notifications. On scope par le jeton public de la carte : on retrouve le
// client à partir de sa carte, et on rattache l'abonnement à ce client.

// Forme d'un abonnement Web Push sérialisé envoyé par le navigateur.
type SerializedSub = {
  endpoint: string;
  keys?: { p256dh?: string; auth?: string };
};

/** Clé publique VAPID à utiliser côté navigateur pour s'abonner. */
export async function getPushPublicKey(): Promise<string> {
  return getPublicKey();
}

/** Enregistre l'abonnement du client (lié à sa carte). */
export async function subscribeUser(token: string, sub: SerializedSub) {
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    return { error: "Abonnement invalide." };
  }

  const card = await prisma.stampCard.findUnique({
    where: { publicToken: token },
    select: { customerId: true },
  });
  if (!card) return { error: "Carte introuvable." };

  // upsert sur l'endpoint (unique) : ré-abonnement = mise à jour.
  await prisma.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    create: {
      customerId: card.customerId,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    },
    update: {
      customerId: card.customerId,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    },
  });

  return { ok: true };
}

/** Désabonne le client (suppression par endpoint). */
export async function unsubscribeUser(endpoint: string) {
  if (!endpoint) return { error: "Endpoint manquant." };
  await prisma.pushSubscription.deleteMany({ where: { endpoint } });
  return { ok: true };
}
