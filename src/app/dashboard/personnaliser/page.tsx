import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireBusiness } from "@/lib/auth";
import { CustomizeForm } from "@/components/CustomizeForm";

export const dynamic = "force-dynamic";

// Personnalisation de la carte (couleur, objectif, récompense…) — protégée.
export default async function PersonnaliserPage() {
  const business = await requireBusiness();
  const program = await prisma.loyaltyProgram.findFirst({
    where: { businessId: business.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 p-6">
      <header className="mb-6">
        <Link href="/dashboard" className="text-sm text-neutral-400 hover:underline">
          ← Tableau de bord
        </Link>
        <h1 className="text-2xl font-bold">Personnaliser ma carte</h1>
        <p className="text-sm text-neutral-500">
          Adaptez la carte à votre commerce. L'aperçu se met à jour en direct.
        </p>
      </header>

      <CustomizeForm
        initial={{
          name: business.name,
          category: business.category ?? "",
          color: business.color,
          programName: program?.name ?? "Carte de fidélité",
          rewardLabel: program?.rewardLabel ?? "1 produit offert",
          stampsGoal: program?.stampsGoal ?? 10,
        }}
      />
    </main>
  );
}
