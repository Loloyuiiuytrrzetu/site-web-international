import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { StampGrid } from "@/components/StampGrid";
import { customerName } from "@/lib/format";
import { baseUrl } from "@/lib/url";
import { AutoRefresh } from "@/components/AutoRefresh";
import { PushToggle } from "@/components/PushToggle";

export const dynamic = "force-dynamic";

// La carte de fidélité vue par le CLIENT.
// - Affiche un QR personnel : c'est CE QR que le commerçant scanne (+1 tampon).
// - Affiche TOUTES les récompenses du commerçant (cadeaux/coupons), avec une
//   flèche pour y accéder. Une carte Wallet renverra ici pour cette vue riche.
export default async function CustomerCardPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const card = await prisma.stampCard.findUnique({
    where: { publicToken: token },
    include: {
      program: {
        include: {
          business: true,
          rewards: { where: { active: true }, orderBy: { pointsRequired: "asc" } },
        },
      },
      customer: true,
      redemptions: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!card) notFound();

  const { program, customer } = card;
  const business = program.business;
  const color = business.color;
  const remaining = program.stampsGoal - card.stampsCount;
  const rewards = program.rewards;

  // QR personnel de la carte : scanné par le commerçant pour ajouter un tampon.
  const cardQr = await QRCode.toDataURL(`${baseUrl()}/c/${card.publicToken}`, {
    margin: 1,
    width: 200,
  });

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col gap-5 px-4 py-6 sm:px-6">
      {/* Temps réel : la carte se met à jour quand le commerçant scanne. */}
      <AutoRefresh seconds={10} />

      {/* Carte de fidélité (en-tête + tampons) */}
      <section
        className="shimmer animate-fade-up overflow-hidden rounded-3xl p-6 text-white shadow-xl"
        style={{ background: color }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm opacity-80">{business.category ?? "Carte de fidélité"}</p>
            <h1 className="text-2xl font-bold">{business.name}</h1>
            <p className="mt-1 text-sm opacity-90">{program.name}</p>
          </div>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tabular-nums">
            {card.stampsCount} / {program.stampsGoal}
          </span>
        </div>

        <div className="mt-5 rounded-2xl bg-white/10 p-3">
          <StampGrid count={card.stampsCount} goal={program.stampsGoal} color="#ffffff" />
        </div>

        <p className="mt-4 text-center text-sm opacity-95">
          {remaining > 0 ? (
            <>
              Plus que <strong>{remaining}</strong> tampon{remaining > 1 ? "s" : ""} pour{" "}
              <strong>{program.rewardLabel}</strong> 🎁
            </>
          ) : (
            <>Récompense atteinte ! 🎉</>
          )}
        </p>

        {/* Flèche d'accès aux récompenses */}
        {rewards.length > 0 && (
          <a
            href="#recompenses"
            className="btn mt-4 flex items-center justify-center gap-1 rounded-xl bg-white/15 py-2.5 text-sm font-semibold backdrop-blur"
          >
            Voir mes récompenses
            <span className="animate-float inline-block">↓</span>
          </a>
        )}
      </section>

      {/* QR personnel à présenter au commerçant */}
      <section
        className="animate-fade-up rounded-3xl border border-neutral-200 bg-white p-6 text-center shadow-sm"
        style={{ "--delay": "80ms" } as React.CSSProperties}
      >
        <p className="mb-3 text-sm font-medium text-neutral-600">
          Présentez ce code au commerçant
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cardQr}
          alt="QR code de ma carte"
          className="mx-auto rounded-xl"
          width={200}
          height={200}
        />
      </section>

      {/* Notifications push : le client est prévenu des points, récompenses et
          promos (dont anniversaire 🎂). */}
      <PushToggle token={card.publicToken} color={color} />

      {/* Bouton Wallet (à venir) — la vue riche des récompenses est ci-dessous. */}
      <button
        disabled
        className="rounded-2xl border border-dashed border-neutral-300 py-3 text-sm text-neutral-400"
      >
        📲 Ajouter à Apple / Google Wallet — bientôt
      </button>

      {/* Récompenses du commerçant */}
      {rewards.length > 0 && (
        <section
          id="recompenses"
          className="animate-fade-up scroll-mt-6"
          style={{ "--delay": "120ms" } as React.CSSProperties}
        >
          <h2 className="mb-3 font-bold">🎁 Récompenses</h2>
          <ul className="space-y-3">
            {rewards.map((r) => {
              const unlocked = card.stampsCount >= r.pointsRequired;
              const left = r.pointsRequired - card.stampsCount;
              return (
                <li
                  key={r.id}
                  className="lift flex gap-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm"
                  style={{ opacity: unlocked ? 1 : 0.92 }}
                >
                  {r.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.imageUrl}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <span
                      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-2xl"
                      style={{ background: `${color}12` }}
                    >
                      {r.type === "coupon" ? "🏷️" : "🎁"}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold">{r.title}</p>
                      {unlocked ? (
                        <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                          Débloquée ✓
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-500">
                          {left} tampon{left > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    {r.description && (
                      <p className="text-sm text-neutral-600">{r.description}</p>
                    )}
                    {unlocked && r.type === "coupon" && r.couponCode && (
                      <p className="mt-1 inline-block rounded-md border border-dashed px-2 py-0.5 font-mono text-sm" style={{ borderColor: color, color }}>
                        {r.couponCode}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

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
