import { prisma } from "@/lib/prisma";
import { requireBusiness } from "@/lib/auth";
import { CampaignForm } from "@/components/CampaignForm";

export const dynamic = "force-dynamic";

// Onglet « Campagne » : le commerçant compose des notifications push,
// les envoie immédiatement, les programme, ou les automatise (anniversaire 🎂).
export default async function CampagnesPage() {
  const business = await requireBusiness();

  const campaigns = await prisma.campaign.findMany({
    where: { businessId: business.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
      <div className="mb-6 animate-fade-up">
        <h1 className="text-2xl font-bold sm:text-3xl">Campagne</h1>
        <p className="text-sm text-neutral-500">
          Relancez vos clients par notification : une promo, un événement, ou un
          message automatique le jour de leur anniversaire.
        </p>
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
          }))}
        />
      </div>

      {/* Note d'honnêteté : la livraison réelle des push viendra avec
          l'activation des notifications côté client (web push / Wallet). */}
      <p className="mt-8 rounded-xl bg-neutral-50 p-4 text-xs text-neutral-500">
        ℹ️ Les campagnes sont enregistrées et planifiées dès maintenant. L'envoi
        réel des notifications sera activé avec les notifications push du
        téléphone (prochaine étape, en lien avec le Wallet).
      </p>
    </main>
  );
}
