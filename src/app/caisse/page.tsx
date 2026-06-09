import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StampButton } from "@/components/StampButton";

// Espace CAISSE : utilisé par le serveur / caissier du restaurant.
// Il voit la liste des cartes clients et ajoute un tampon en un clic.
// (Plus tard : scan direct du QR code du client.)
export default async function CaissePage() {
  const cards = await prisma.stampCard.findMany({
    include: {
      customer: true,
      program: { include: { restaurant: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Caisse</h1>
        <p className="text-sm text-neutral-500">
          Ajoutez un tampon à un client après son passage.
        </p>
      </header>

      <ul className="space-y-3">
        {cards.map((card) => {
          const color = card.program.restaurant.color;
          return (
            <li
              key={card.id}
              className="flex items-center justify-between rounded-2xl border border-black/5 bg-white p-4 shadow-sm dark:bg-neutral-900"
            >
              <div>
                <p className="font-medium">
                  {card.customer.name ?? "Client"}
                </p>
                <p className="text-sm text-neutral-500">
                  {card.program.restaurant.name} · {card.program.name} —{" "}
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
