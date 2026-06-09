"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSessionBusinessId } from "@/lib/auth";
import { customerName } from "@/lib/format";
import { notifyCardUpdated } from "@/lib/wallet-notify";

// Résultat renvoyé au scanner du commerçant.
export type StampResult =
  | { error: string }
  | {
      ok: true;
      rewarded: boolean;
      reward?: string;
      stampsCount: number;
      goal: number;
      customer: string;
      color: string;
    };

/**
 * Ajoute un tampon à une carte (déclenché par le SCAN du commerçant).
 * Réservé au commerçant connecté, et uniquement sur SES cartes —
 * sinon n'importe quel client pourrait s'ajouter des points.
 *
 * Si la carte atteint l'objectif, on enregistre la récompense et on remet le
 * compteur à zéro pour un nouveau cycle.
 *
 * C'est ici que, plus tard, on déclenchera la mise à jour de la passe
 * Apple/Google Wallet (push APNs / API Google).
 */
export async function addStamp(publicToken: string): Promise<StampResult> {
  const businessId = await getSessionBusinessId();
  if (!businessId) return { error: "Vous devez être connecté." };

  const card = await prisma.stampCard.findUnique({
    where: { publicToken },
    include: {
      program: { include: { business: true } },
      customer: true,
    },
  });
  if (!card) return { error: "Carte introuvable." };

  // Sécurité multi-tenant : la carte doit appartenir au commerce connecté.
  if (card.program.businessId !== businessId) {
    return { error: "Cette carte n'appartient pas à votre commerce." };
  }

  const goal = card.program.stampsGoal;
  const color = card.program.business.color;
  const name = customerName(card.customer);
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
    // Met à jour la passe Apple Wallet du client (+ notification iPhone).
    await notifyCardUpdated(card.id);
    revalidatePath(`/c/${publicToken}`);
    revalidatePath("/dashboard");
    return {
      ok: true,
      rewarded: true,
      reward: card.program.rewardLabel,
      stampsCount: goal,
      goal,
      customer: name,
      color,
    };
  }

  await prisma.$transaction([
    prisma.stamp.create({ data: { cardId: card.id } }),
    prisma.stampCard.update({
      where: { id: card.id },
      data: { stampsCount: next },
    }),
  ]);
  // Met à jour la passe Apple Wallet du client (+ notification iPhone).
  await notifyCardUpdated(card.id);
  revalidatePath(`/c/${publicToken}`);
  revalidatePath("/dashboard");
  return {
    ok: true,
    rewarded: false,
    stampsCount: next,
    goal,
    customer: name,
    color,
  };
}

/** Retire un tampon (en cas d'erreur de saisie). Commerçant connecté uniquement. */
export async function removeStamp(publicToken: string) {
  const businessId = await getSessionBusinessId();
  if (!businessId) return { error: "Vous devez être connecté." };

  const card = await prisma.stampCard.findUnique({
    where: { publicToken },
    include: { program: true },
  });
  if (!card || card.program.businessId !== businessId) {
    return { error: "Carte introuvable." };
  }
  if (card.stampsCount <= 0) return { error: "Rien à retirer." };

  await prisma.stampCard.update({
    where: { id: card.id },
    data: { stampsCount: card.stampsCount - 1 },
  });
  revalidatePath(`/c/${publicToken}`);
  revalidatePath("/dashboard");
  return { stampsCount: card.stampsCount - 1 };
}
