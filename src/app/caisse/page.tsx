import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireBusiness } from "@/lib/auth";
import { customerName } from "@/lib/format";
import { StampButton } from "@/components/StampButton";

// Données en temps réel : on rend la page à chaque visite (pas de pré-génération).
export const dynamic = "force-dynamic";

// SAISIE MANUELLE (secours du scanner) : protégée par la connexion.
// Le commerçant voit ses cartes clients et ajoute un tampon en un clic,
// quand la caméra n'est pas disponible.
export default async function CaissePage() {
  const business = await requireBusiness();

  const cards = await prisma.stampCard.findMany({
    where: { program: { businessId: business.id } },
    include: {
      customer: true,
      program: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 p-6">
      <header className="mb-6">
        <Link href="/scan" className="text-sm text-neutral-400 hover:underline">
          ← Scanner
        </Link>
        <h1 className="text-2xl font-bold">Saisie manuelle</h1>
        <p className="text-sm text-neutral-500">
          Ajoutez un tampon à un client quand la caméra n'est pas disponible.
        </p>
      </header>

      <ul className="space-y-3">
        {cards.map((card) => {
          const color = business.color;
          return (
            <li
              key={card.id}
              className="lift flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <div>
                <p className="font-medium">{customerName(card.customer)}</p>
                <p className="text-sm text-neutral-500">
                  {card.program.name} —{" "}
                  <span style={{ color }}>
                    {card.stampsCount}/{card.program.stampsGoal}
                  </span>
                </p>
                <Link
                  href={`/c/${card.publicToken}`}
                  className="text-xs text-neutral-400 underline"
                >
                  voir la carte client
                </Link>
              </div>
              <StampButton token={card.publicToken} color={color} />
            </li>
          );
        })}
      </ul>

      {cards.length === 0 && (
        <p className="text-neutral-500">Aucune carte pour l'instant.</p>
      )}
    </main>
  );
}
