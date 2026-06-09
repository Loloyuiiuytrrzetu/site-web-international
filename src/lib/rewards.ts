"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSessionBusiness } from "@/lib/auth";

// Gestion des récompenses du programme (commerçant connecté uniquement).
// Une récompense = un cadeau ("gift") ou un coupon de réduction ("coupon"),
// débloqué à partir d'un certain nombre de tampons, avec photo optionnelle.

export type RewardState = { ok?: boolean; error?: string };

/** Récupère le programme du commerce connecté, en vérifiant la propriété. */
async function ownedProgram() {
  const business = await getSessionBusiness();
  if (!business) return null;
  const program = await prisma.loyaltyProgram.findFirst({
    where: { businessId: business.id },
    orderBy: { createdAt: "asc" },
  });
  return program;
}

/** Photo optionnelle : on accepte une data URL (upload) ou une URL http(s). */
function cleanImage(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  if (v.startsWith("data:image/") || /^https?:\/\//.test(v)) return v;
  return null;
}

/** Ajoute une récompense au programme. */
export async function createReward(
  _prev: RewardState | undefined,
  formData: FormData,
): Promise<RewardState> {
  const program = await ownedProgram();
  if (!program) return { error: "Vous devez être connecté." };

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const type = String(formData.get("type") ?? "gift").trim();
  const points = parseInt(String(formData.get("pointsRequired") ?? ""), 10);
  const couponCode = String(formData.get("couponCode") ?? "").trim();
  const imageUrl = cleanImage(String(formData.get("imageUrl") ?? ""));

  if (!title) return { error: "Donnez un titre à la récompense." };
  if (type !== "gift" && type !== "coupon") return { error: "Type invalide." };
  if (!Number.isFinite(points) || points < 1 || points > 15) {
    return { error: "Le nombre de tampons doit être entre 1 et 15." };
  }

  const count = await prisma.reward.count({ where: { programId: program.id } });

  await prisma.reward.create({
    data: {
      programId: program.id,
      title,
      description: description || null,
      type,
      pointsRequired: points,
      couponCode: type === "coupon" ? couponCode || null : null,
      imageUrl,
      position: count,
    },
  });

  revalidatePath("/dashboard/programme");
  return { ok: true };
}

/** Supprime une récompense (en vérifiant qu'elle appartient bien au commerce). */
export async function deleteReward(rewardId: string): Promise<RewardState> {
  const business = await getSessionBusiness();
  if (!business) return { error: "Vous devez être connecté." };

  const reward = await prisma.reward.findUnique({
    where: { id: rewardId },
    include: { program: true },
  });
  if (!reward || reward.program.businessId !== business.id) {
    return { error: "Récompense introuvable." };
  }

  await prisma.reward.delete({ where: { id: rewardId } });
  revalidatePath("/dashboard/programme");
  return { ok: true };
}
