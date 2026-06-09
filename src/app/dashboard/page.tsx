import Link from "next/link";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { BRAND } from "@/lib/brand";
import { requireBusiness } from "@/lib/auth";
import { logout } from "@/lib/session-actions";
import { customerName, initials } from "@/lib/format";
import { weeklyScans } from "@/lib/stats";
import { baseUrl } from "@/lib/url";
import { WeekChart } from "@/components/WeekChart";
import { AutoRefresh } from "@/components/AutoRefresh";

// Données en temps réel : on rend la page à chaque visite (pas de pré-génération).
export const dynamic = "force-dynamic";

// Tableau de bord du COMMERÇANT : protégé par la connexion.
// Vue d'ensemble, graphique des scans, clients, et QR d'inscription à afficher.
export default async function DashboardPage() {
  const business = await requireBusiness();

  const program = await prisma.loyaltyProgram.findFirst({
    where: { businessId: business.id },
    orderBy: { createdAt: "asc" },
  });

  // Statistiques.
  const [customers, totalStamps, totalRewards, week] = await Promise.all([
    prisma.customer.findMany({
      where: { businessId: business.id },
      include: { cards: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.stamp.count({ where: { card: { program: { businessId: business.id } } } }),
    prisma.rewardRedemption.count({
      where: { card: { program: { businessId: business.id } } },
    }),
    weeklyScans(business.id),
  ]);

  const todayScans = week.find((d) => d.isToday)?.count ?? 0;
  const color = business.color;

  // QR d'INSCRIPTION : à afficher/imprimer pour que les NOUVEAUX clients
  // s'inscrivent (prénom, nom, anniversaire) et reçoivent leur carte.
  const joinUrl = `${baseUrl()}/j/${business.slug}`;
  const joinQr = await QRCode.toDataURL(joinUrl, {
    color: { dark: color, light: "#ffffff" },
    margin: 1,
    width: 240,
  });

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 bg-white p-6">
      {/* Rafraîchissement automatique pour l'effet temps réel */}
      <AutoRefresh seconds={15} />

      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/" className="text-sm text-neutral-400 hover:underline">
            ← {BRAND.name}
          </Link>
          <h1 className="text-2xl font-bold">{business.name}</h1>
          <p className="text-sm text-neutral-500">
            {business.category ? `${business.category} · ` : ""}Plan {business.plan}
            {program ? ` · ${program.name}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/personnaliser"
            className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-semibold"
          >
            🎨 Personnaliser
          </Link>
          <Link
            href="/scan"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ background: color }}
          >
            📷 Scanner
          </Link>
          <form action={logout}>
            <button className="rounded-lg px-3 py-2 text-sm text-neutral-400 hover:underline">
              Déconnexion
            </button>
          </form>
        </div>
      </header>

      {/* Cartes de stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Scans aujourd'hui", value: todayScans },
          { label: "Clients", value: customers.length },
          { label: "Tampons distribués", value: totalStamps },
          { label: "Récompenses gagnées", value: totalRewards },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-neutral-100 p-5 shadow-sm">
            <p className="text-sm text-neutral-500">{s.label}</p>
            <p className="text-3xl font-extrabold" style={{ color }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Graphique des scans de la semaine */}
      <section className="mb-8 rounded-2xl border border-neutral-100 p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold">Scans cette semaine</h2>
          <span className="flex items-center gap-1 text-xs text-neutral-400">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-green-500" />
            temps réel
          </span>
        </div>
        <WeekChart data={week} color={color} />
      </section>

      <div className="grid gap-8 md:grid-cols-[1fr_auto]">
        {/* Liste des clients */}
        <section>
          <h2 className="mb-3 font-bold">Vos clients</h2>
          {customers.length === 0 && (
            <p className="text-sm text-neutral-500">
              Aucun client pour l'instant. Affichez votre QR d'inscription ! →
            </p>
          )}
          <ul className="space-y-2">
            {customers.map((c) => {
              const card = c.cards[0];
              return (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded-xl border border-neutral-100 p-3 text-sm"
                >
                  <span className="flex items-center gap-3">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ background: color }}
                    >
                      {initials(c)}
                    </span>
                    {customerName(c)}
                  </span>
                  {card && (
                    <Link
                      href={`/c/${card.publicToken}`}
                      className="font-medium"
                      style={{ color }}
                    >
                      {card.stampsCount}/{program?.stampsGoal ?? 10} →
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* QR d'inscription à afficher pour les nouveaux clients */}
        <section className="text-center">
          <h2 className="mb-1 font-bold">QR d'inscription</h2>
          <p className="mb-3 max-w-[240px] text-xs text-neutral-500">
            Affichez-le en boutique : le client le scanne pour s'inscrire et
            recevoir sa carte.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={joinQr}
            alt="QR code d'inscription"
            className="mx-auto rounded-xl border border-neutral-100"
            width={240}
            height={240}
          />
          <Link href={`/j/${business.slug}`} className="mt-2 block text-xs text-neutral-400 underline">
            ouvrir la page d'inscription
          </Link>
        </section>
      </div>
    </main>
  );
}
