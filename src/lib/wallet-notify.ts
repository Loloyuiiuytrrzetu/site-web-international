// Orchestration des notifications Wallet — Apple ET Google.
//
// Chaque commerce peut avoir des clients iPhone (Apple Wallet) et Android
// (Google Wallet). Ces fonctions déclenchent la mise à jour / la notification
// sur les deux plateformes. Chaque plateforme est ignorée si non configurée.

import { prisma } from "@/lib/prisma";
import { sendPassPush } from "@/lib/apns";
import { googleUpdateCard, googleAnnounce } from "@/lib/google-wallet";

/** Met à jour la carte (après un tampon) et notifie ses appareils (Apple + Google). */
export async function notifyCardUpdated(cardId: string): Promise<void> {
  const card = await prisma.stampCard.update({
    where: { id: cardId },
    data: { walletUpdatedAt: new Date() },
    select: { publicToken: true },
  });

  // Apple : push APNs vers les appareils enregistrés (l'iPhone récupère la passe).
  const regs = await prisma.passRegistration.findMany({ where: { cardId } });
  if (regs.length) await sendPassPush(regs.map((r) => r.pushToken));

  // Google : met à jour l'objet (la carte Android se met à jour).
  await googleUpdateCard(card.publicToken);
}

/**
 * Diffuse un message (campagne) sur les cartes Wallet d'un commerce, sur les
 * DEUX plateformes. `birthdayOnly` ne cible que les anniversaires du jour.
 * Renvoie le nombre total de cartes/appareils notifiés (Apple + Google).
 */
export async function announceAll(
  businessId: string,
  title: string,
  message: string,
  opts?: { birthdayOnly?: boolean },
): Promise<number> {
  const apple = await announceApple(businessId, message, opts);
  const google = await googleAnnounce(businessId, title, message, opts);
  return apple + google;
}

// Partie Apple : on met le message sur chaque carte ciblée (déclenche la notif
// via changeMessage) puis on pousse APNs.
async function announceApple(
  businessId: string,
  message: string,
  opts?: { birthdayOnly?: boolean },
): Promise<number> {
  const cards = await prisma.stampCard.findMany({
    where: { program: { businessId } },
    include: { customer: true, passRegistrations: true },
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
  if (targets.length === 0) return 0;

  await prisma.stampCard.updateMany({
    where: { id: { in: targets.map((c) => c.id) } },
    data: { walletMessage: message, walletUpdatedAt: new Date() },
  });

  const tokens = targets.flatMap((c) => c.passRegistrations.map((r) => r.pushToken));
  return sendPassPush(tokens);
}
