"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSessionBusiness } from "@/lib/auth";
import { announceAll } from "@/lib/wallet-notify";

// Campagnes de notification du commerçant.
// trigger :
//   - "now"      : envoi immédiat (marquée envoyée)
//   - "scheduled": programmée pour une date/heure
//   - "birthday" : automatique, le jour d'anniversaire de chaque client 🎂
export type CampaignState = { ok?: boolean; error?: string };

export async function createCampaign(
  _prev: CampaignState | undefined,
  formData: FormData,
): Promise<CampaignState> {
  const business = await getSessionBusiness();
  if (!business) return { error: "Vous devez être connecté." };

  const title = String(formData.get("title") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const trigger = String(formData.get("trigger") ?? "now").trim();
  const scheduledRaw = String(formData.get("scheduledAt") ?? "").trim();

  if (!title) return { error: "Donnez un titre à la campagne." };
  if (!message) return { error: "Écrivez le message de la notification." };
  if (!["now", "scheduled", "birthday"].includes(trigger)) {
    return { error: "Type de déclenchement invalide." };
  }

  let scheduledAt: Date | null = null;
  let status = "draft";
  let sentAt: Date | null = null;
  let recipients = 0;

  if (trigger === "now") {
    status = "sent";
    sentAt = new Date();
    // Diffusion immédiate sur les cartes Wallet du commerce (Apple + Google).
    recipients = await announceAll(business.id, title, message);
  } else if (trigger === "scheduled") {
    const d = scheduledRaw ? new Date(scheduledRaw) : null;
    if (!d || isNaN(d.getTime())) {
      return { error: "Choisissez une date d'envoi valide." };
    }
    if (d.getTime() < Date.now()) {
      return { error: "La date programmée doit être dans le futur." };
    }
    scheduledAt = d;
    status = "scheduled";
  } else {
    // birthday : campagne automatique récurrente.
    status = "active";
  }

  await prisma.campaign.create({
    data: { businessId: business.id, title, message, trigger, scheduledAt, status, sentAt, recipients },
  });

  revalidatePath("/dashboard/campagnes");
  return { ok: true };
}

export async function deleteCampaign(campaignId: string): Promise<CampaignState> {
  const business = await getSessionBusiness();
  if (!business) return { error: "Vous devez être connecté." };

  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign || campaign.businessId !== business.id) {
    return { error: "Campagne introuvable." };
  }

  await prisma.campaign.delete({ where: { id: campaignId } });
  revalidatePath("/dashboard/campagnes");
  return { ok: true };
}
