import { prisma } from "@/lib/prisma";
import { requireBusiness } from "@/lib/auth";
import { CampaignForm } from "@/components/CampaignForm";

export const dynamic = "force-dynamic";

// Onglet « Campagne » : le commerçant compose des notifications push,
// les envoie immédiatement, les programme, ou les automatise (anniversaire 🎂).
export default async function CampagnesPage() {
  const business = await requireBusiness();

  const [campaigns, walletCount] = await Promise.all([
    prisma.campaign.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.passRegistration.count({
      where: { card: { program: { businessId: business.id } } },
    }),
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
      <div className="mb-6 animate-fade-up">
        <h1 className="text-2xl font-bold sm:text-3xl">Campagne</h1>
        <p className="text-sm text-neutral-500">
          Relancez vos clients par notification : une promo, un événement, ou un
          message automatique le jour de leur anniversaire.
        </p>
      </div>

      <div
        className="mb-5 animate-fade-up rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm"
        style={{ "--delay": "60ms" } as React.CSSProperties}
      >
        🎫 <strong>{walletCount}</strong> carte{walletCount > 1 ? "s" : ""} ajoutée
        {walletCount > 1 ? "s" : ""} au Wallet (reçoivent les notifications).{" "}
        {walletCount === 0 && (
          <span className="text-neutral-500">
            Vos clients ajoutent leur carte à Apple Wallet — ensuite ils sont
            notifiés automatiquement, sans rien activer.
          </span>
        )}
      </div>

      <div className="animate-fade-up" style={{ "--delay": "80ms" } as React.CSSProperties}>
        <CampaignForm
          color={business.color}
          campaigns={campaigns.map((c) => ({
            id: c.id,
            title: c.title,
            message: c.message,
            trigger: c.trigger,
            status: c.status,
            scheduledAt: c.scheduledAt ? c.scheduledAt.toISOString() : null,
            sentAt: c.sentAt ? c.sentAt.toISOString() : null,
            recipients: c.recipients,
          }))}
        />
      </div>

      <p className="mt-8 rounded-xl bg-neutral-50 p-4 text-xs text-neutral-500">
        ℹ️ Les envois « maintenant » partent immédiatement. Les campagnes
        programmées et les anniversaires sont envoyés par une tâche planifiée
        (quotidienne) — voir <code>vercel.json</code> pour ajuster la fréquence.
      </p>
    </main>
  );
}
