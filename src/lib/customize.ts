"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSessionBusiness } from "@/lib/auth";

/**
 * Personnalisation de la carte par le commerçant (connecté uniquement) :
 * nom du commerce, catégorie, couleur, et le programme de fidélité
 * (nom, objectif de tampons, récompense).
 */
export async function updateBranding(
  _prev: { ok?: boolean; error?: string } | undefined,
  formData: FormData,
) {
  const business = await getSessionBusiness();
  if (!business) return { error: "Vous devez être connecté." };

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim();
  const programName = String(formData.get("programName") ?? "").trim();
  const rewardLabel = String(formData.get("rewardLabel") ?? "").trim();
  const stampsGoal = parseInt(String(formData.get("stampsGoal") ?? ""), 10);

  if (!name) return { error: "Le nom du commerce est obligatoire." };
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
    return { error: "Couleur invalide." };
  }
  if (!Number.isFinite(stampsGoal) || stampsGoal < 2 || stampsGoal > 15) {
    return { error: "L'objectif doit être entre 2 et 15 tampons." };
  }

  await prisma.business.update({
    where: { id: business.id },
    data: { name, category: category || null, color },
  });

  // On met à jour le premier programme actif (le commerce n'en a qu'un pour l'instant).
  const program = await prisma.loyaltyProgram.findFirst({
    where: { businessId: business.id },
    orderBy: { createdAt: "asc" },
  });
  if (program) {
    await prisma.loyaltyProgram.update({
      where: { id: program.id },
      data: {
        name: programName || program.name,
        rewardLabel: rewardLabel || program.rewardLabel,
        stampsGoal,
      },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/programme");
  return { ok: true };
}
