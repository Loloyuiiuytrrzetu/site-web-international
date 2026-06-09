import Link from "next/link";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { BRAND } from "@/lib/brand";

// Dashboard du GÉRANT du restaurant : vue d'ensemble + stats.
// Pour le MVP on prend le premier restaurant (plus tard : celui de l'utilisateur connecté).
export default async function DashboardPage() {
  const resto = await prisma.restaurant.findFirst({
    include: {
      programs: true,
      customers: { include: { cards: true } },
    },
  });

  if (!resto) {
    return (
      <main className="p-6">
        <p>
          Aucun restaurant. Lancez le seed :{" "}
          <code>npx tsx prisma/seed.ts</code>
        </p>
      </main>
    );
  }

  const program = resto.programs[0];

  // Statistiques simples.
  const totalStamps = await prisma.stamp.count({
    where: { card: { program: { restaurantId: resto.id } } },
  });
  const totalRewards = await prisma.rewardRedemption.count({
    where: { card: { program: { restaurantId: resto.id } } },
  });

  // QR code de la carte d'un client (démo) — ce QR pointe vers sa carte.
  const demoCard = resto.customers[0]?.cards[0];
  const cardUrl = demoCard ? `/c/${demoCard.publicToken}` : null;
  const qrDataUrl = demoCard
    ? await QRCode.toDataURL(`https://walletiz.app/c/${demoCard.publicToken}`, {
        color: { dark: BRAND.bordeaux, light: "#ffffff" },
        margin: 1,
        width: 220,
      })
    : null;

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 bg-white p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/" className="text-sm text-neutral-400 hover:underline">
            ← {BRAND.name}
          </Link>
          <h1 className="text-2xl font-bold">{resto.name}</h1>
          <p className="text-sm text-neutral-500">
            Plan {resto.plan} · {program?.name}
          </p>
        </div>
        <Link
          href="/caisse"
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
          style={{ background: BRAND.bordeaux }}
        >
          Ouvrir la caisse
        </Link>
      </header>

      {/* Cartes de stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Clients", value: resto.customers.length },
          { label: "Tampons distribués", value: totalStamps },
          { label: "Récompenses gagnées", value: totalRewards },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-neutral-100 p-5 shadow-sm"
          >
            <p className="text-sm text-neutral-500">{s.label}</p>
            <p
              className="text-3xl font-extrabold"
              style={{ color: BRAND.bordeaux }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_auto]">
        {/* Liste des clients */}
        <section>
          <h2 className="mb-3 font-bold">Vos clients</h2>
          <ul className="space-y-2">
            {resto.customers.map((c) => {
              const card = c.cards[0];
              return (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded-xl border border-neutral-100 p-3 text-sm"
                >
                  <span>{c.name ?? c.email ?? "Client"}</span>
                  {card && (
                    <Link
                      href={`/c/${card.publicToken}`}
                      className="font-medium"
                      style={{ color: BRAND.bordeaux }}
                    >
                      {card.stampsCount}/{program?.stampsGoal} tampons →
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* QR code à afficher / imprimer pour que les clients prennent leur carte */}
        {qrDataUrl && cardUrl && (
          <section className="text-center">
            <h2 className="mb-3 font-bold">Carte démo (QR)</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrDataUrl}
              alt="QR code carte de fidélité"
              className="rounded-xl border border-neutral-100"
              width={220}
              height={220}
            />
            <Link
              href={cardUrl}
              className="mt-2 block text-xs text-neutral-400 underline"
            >
              ouvrir la carte
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
