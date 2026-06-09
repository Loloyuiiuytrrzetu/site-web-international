import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StampGrid } from "@/components/StampGrid";

// La carte de fidélité vue par le CLIENT.
// C'est cette page (accessible par un lien/QR unique) qui sera,
// en phase 2, transformée en passe Apple/Google Wallet.
export default async function CustomerCardPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const card = await prisma.stampCard.findUnique({
    where: { publicToken: token },
    include: {
      program: { include: { restaurant: true } },
      customer: true,
      redemptions: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!card) notFound();

  const { program, customer } = card;
  const resto = program.restaurant;
  const color = resto.color;
  const remaining = program.stampsGoal - card.stampsCount;

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col gap-6 p-6">
      {/* En-tête resto */}
      <div
        className="rounded-3xl p-6 text-white shadow-lg"
        style={{ background: color }}
      >
        <p className="text-sm opacity-80">Carte de fidélité</p>
        <h1 className="text-2xl font-bold">{resto.name}</h1>
        <p className="mt-1 text-sm opacity-90">{program.name}</p>
      </div>

      {/* Carte à tampons */}
      <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm dark:bg-neutral-900">
        <div className="mb-4 flex items-baseline justify-between">
          <span className="text-sm text-neutral-500">
            {customer.name ?? "Client"}
          </span>
          <span className="text-sm font-medium" style={{ color }}>
            {card.stampsCount} / {program.stampsGoal}
          </span>
        </div>

        <StampGrid
          count={card.stampsCount}
          goal={program.stampsGoal}
          color={color}
        />

        <p className="mt-5 text-center text-sm text-neutral-600 dark:text-neutral-300">
          {remaining > 0 ? (
            <>
              Plus que <strong>{remaining}</strong> tampon
              {remaining > 1 ? "s" : ""} pour gagner{" "}
              <strong>{program.rewardLabel}</strong> 🎁
            </>
          ) : (
            <>Récompense atteinte ! 🎉</>
          )}
        </p>
      </section>

      {/* Placeholder bouton Wallet (phase 2) */}
      <button
        disabled
        className="rounded-2xl border border-dashed border-neutral-300 py-3 text-sm text-neutral-400"
      >
        📲 Ajouter à Apple / Google Wallet — bientôt
      </button>

      {card.redemptions.length > 0 && (
        <section className="text-sm text-neutral-500">
          <p className="mb-2 font-medium">Récompenses gagnées</p>
          <ul className="space-y-1">
            {card.redemptions.map((r) => (
              <li key={r.id} className="flex justify-between">
                <span>🎁 {r.label}</span>
                <span>{r.createdAt.toLocaleDateString("fr-FR")}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
