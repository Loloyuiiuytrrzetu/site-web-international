import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EnrollForm } from "@/components/EnrollForm";

export const dynamic = "force-dynamic";

// Page PUBLIQUE d'inscription du client (ce que le client ouvre en scannant
// le QR du commerce). Il remplit prénom / nom / anniversaire et reçoit sa carte.
export default async function JoinPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const business = await prisma.business.findUnique({
    where: { slug },
    include: { programs: { where: { active: true }, take: 1 } },
  });
  if (!business) notFound();

  const program = business.programs[0];
  const color = business.color;

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col gap-6 p-6">
      {/* En-tête commerce */}
      <div className="rounded-3xl p-6 text-white shadow-lg" style={{ background: color }}>
        <p className="text-sm opacity-80">
          {business.category ?? "Carte de fidélité"}
        </p>
        <h1 className="text-2xl font-bold">{business.name}</h1>
        {program && (
          <p className="mt-1 text-sm opacity-90">
            {program.stampsGoal} tampons = {program.rewardLabel} 🎁
          </p>
        )}
      </div>

      <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-lg font-bold">Créez votre carte</h2>
        <p className="mb-5 text-sm text-neutral-500">
          En quelques secondes — et gagnez des récompenses à chaque passage.
        </p>
        <EnrollForm slug={slug} color={color} />
      </section>

      <p className="text-center text-xs text-neutral-400">
        Vos informations restent confidentielles et servent uniquement à votre
        fidélité.
      </p>
    </main>
  );
}
