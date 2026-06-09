import { prisma } from "@/lib/prisma";
import { requireBusiness } from "@/lib/auth";
import { CustomizeForm } from "@/components/CustomizeForm";
import { RewardsManager } from "@/components/RewardsManager";

export const dynamic = "force-dynamic";

// « Mon programme » : le commerçant gère ici sa carte de fidélité.
// - Personnalisation (nom, couleur, objectif de tampons jusqu'à 15…).
// - Récompenses : cadeaux ou coupons, avec photo, débloqués à X tampons.
// Ces récompenses s'affichent ensuite sur la carte du client.
export default async function ProgrammePage() {
  const business = await requireBusiness();

  const program = await prisma.loyaltyProgram.findFirst({
    where: { businessId: business.id },
    orderBy: { createdAt: "asc" },
    include: { rewards: { orderBy: { position: "asc" } } },
  });

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
      <div className="mb-6 animate-fade-up">
        <h1 className="text-2xl font-bold sm:text-3xl">Mon programme</h1>
        <p className="text-sm text-neutral-500">
          Personnalisez votre carte et définissez les récompenses. L'aperçu se
          met à jour en direct.
        </p>
      </div>

      {/* Personnalisation de la carte */}
      <section
        className="mb-10 animate-fade-up rounded-2xl border border-neutral-200 p-5 shadow-sm sm:p-6"
      >
        <h2 className="mb-4 font-bold">🎨 Apparence de la carte</h2>
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
      </section>

      {/* Récompenses */}
      <section
        className="animate-fade-up rounded-2xl border border-neutral-200 p-5 shadow-sm sm:p-6"
        style={{ "--delay": "100ms" } as React.CSSProperties}
      >
        <h2 className="mb-1 font-bold">🎁 Récompenses</h2>
        <p className="mb-4 text-sm text-neutral-500">
          Elles apparaissent sur la carte de fidélité de vos clients.
        </p>
        <RewardsManager
          color={business.color}
          rewards={(program?.rewards ?? []).map((r) => ({
            id: r.id,
            title: r.title,
            description: r.description,
            type: r.type,
            pointsRequired: r.pointsRequired,
            imageUrl: r.imageUrl,
            couponCode: r.couponCode,
          }))}
        />
      </section>
    </main>
  );
}
