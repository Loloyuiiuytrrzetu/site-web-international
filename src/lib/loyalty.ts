"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Ajoute un tampon à une carte.
 * Si la carte atteint l'objectif, on enregistre la récompense
 * et on remet le compteur à zéro pour un nouveau cycle.
 *
 * C'est ici que, plus tard, on déclenchera la mise à jour de la passe
 * Apple/Google Wallet (push APNs / API Google).
 */
export async function addStamp(publicToken: string) {
  const card = await prisma.stampCard.findUnique({
    where: { publicToken },
    include: { program: true },
  });
  if (!card) return { error: "Carte introuvable" };

  const goal = card.program.stampsGoal;
  const next = card.stampsCount + 1;

  if (next >= goal) {
    // Objectif atteint : on délivre la récompense et on recommence à zéro.
    await prisma.$transaction([
      prisma.stamp.create({ data: { cardId: card.id } }),
      prisma.rewardRedemption.create({
        data: { cardId: card.id, label: card.program.rewardLabel },
      }),
      prisma.stampCard.update({
        where: { id: card.id },
        data: { stampsCount: 0 },
      }),
    ]);
    revalidatePath(`/c/${publicToken}`);
    revalidatePath("/caisse");
    return { rewarded: true, reward: card.program.rewardLabel };
  }

  await prisma.$transaction([
    prisma.stamp.create({ data: { cardId: card.id } }),
    prisma.stampCard.update({
      where: { id: card.id },
      data: { stampsCount: next },
    }),
  ]);
  revalidatePath(`/c/${publicToken}`);
  revalidatePath("/caisse");
  return { rewarded: false, stampsCount: next, goal };
}

/** Retire un tampon (en cas d'erreur de la caisse). */
export async function removeStamp(publicToken: string) {
  const card = await prisma.stampCard.findUnique({ where: { publicToken } });
  if (!card || card.stampsCount <= 0) return { error: "Rien à retirer" };

  await prisma.stampCard.update({
    where: { id: card.id },
    data: { stampsCount: card.stampsCount - 1 },
  });
  revalidatePath(`/c/${publicToken}`);
  revalidatePath("/caisse");
  return { stampsCount: card.stampsCount - 1 };
}
