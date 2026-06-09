// Déclenchement des notifications Apple Wallet.
//
// Principe : on modifie la passe (compteur de tampons, ou message d'actualité),
// on note la date de mise à jour, puis on envoie un push APNs aux appareils
// enregistrés. L'iPhone récupère alors la passe à jour et affiche la notif.

import { prisma } from "@/lib/prisma";
import { sendPassPush } from "@/lib/apns";

/** Met à jour une carte (après un tampon) et notifie ses appareils. */
export async function notifyCardUpdated(cardId: string): Promise<void> {
  await prisma.stampCard.update({
    where: { id: cardId },
    data: { walletUpdatedAt: new Date() },
  });
  const regs = await prisma.passRegistration.findMany({ where: { cardId } });
  if (regs.length) await sendPassPush(regs.map((r) => r.pushToken));
}

/**
 * Diffuse un message (campagne) sur les passes d'un commerce.
 * - `birthdayOnly` : ne cible que les clients dont c'est l'anniversaire.
 * Met le message sur chaque carte ciblée (déclenche la notif), puis push APNs.
 * Renvoie le nombre d'appareils notifiés.
 */
export async function announceToBusiness(
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

  const now = new Date();
  await prisma.stampCard.updateMany({
    where: { id: { in: targets.map((c) => c.id) } },
    data: { walletMessage: message, walletUpdatedAt: now },
  });

  const tokens = targets.flatMap((c) => c.passRegistrations.map((r) => r.pushToken));
  return sendPassPush(tokens);
}
