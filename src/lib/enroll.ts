"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

/**
 * Inscription d'un NOUVEAU client (1er scan du QR d'un commerce).
 * Public : c'est le client lui-même qui remplit le formulaire.
 *
 * On crée le client (prénom, nom, anniversaire) + sa carte de fidélité,
 * puis on le redirige vers sa carte (qu'il pourra ajouter au Wallet).
 */
export async function enrollCustomer(
  slug: string,
  _prev: { error?: string } | undefined,
  formData: FormData,
) {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const birthdateRaw = String(formData.get("birthdate") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!firstName || !lastName) {
    return { error: "Merci d'indiquer votre prénom et votre nom." };
  }

  const business = await prisma.business.findUnique({
    where: { slug },
    include: { programs: { where: { active: true }, take: 1 } },
  });
  if (!business) return { error: "Commerce introuvable." };

  const program = business.programs[0];
  if (!program) {
    return { error: "Ce commerce n'a pas encore de programme de fidélité." };
  }

  // birthdate au format "YYYY-MM-DD" (input type=date) -> Date, sinon null.
  const birthdate = birthdateRaw ? new Date(birthdateRaw) : null;

  const customer = await prisma.customer.create({
    data: {
      businessId: business.id,
      firstName,
      lastName,
      email: email || null,
      birthdate: birthdate && !isNaN(birthdate.getTime()) ? birthdate : null,
      cards: {
        create: { programId: program.id },
      },
    },
    include: { cards: true },
  });

  // On redirige vers la carte du client (son QR personnel + bouton Wallet).
  redirect(`/c/${customer.cards[0].publicToken}`);
}
