"use client";

import { useEffect, useState } from "react";
import { useRestaurantStore } from "@/lib/store";
import { Card, PageHeader } from "../../admin/_components/ui";
import { StatusBadge } from "../page";

const PLAN_PRICE = { starter: 19, pro: 39, enterprise: 99 } as const;

export default function BillingPage() {
  const restaurants = useRestaurantStore((s) => s.restaurants);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const mrr = restaurants.reduce(
    (sum, r) => sum + (r.status === "active" ? PLAN_PRICE[r.plan] : 0),
    0
  );
  const arr = mrr * 12;

  return (
    <div className="mx-auto max-w-5xl p-5 lg:p-8">
      <PageHeader
        title="Facturation"
        description="Revenu récurrent et plans actifs."
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="MRR" value={`${mrr} €`} hint="Revenu mensuel récurrent" />
        <Stat label="ARR" value={`${arr} €`} hint="Revenu annuel projeté" />
        <Stat
          label="Clients actifs"
          value={String(restaurants.filter((r) => r.status === "active").length)}
          hint={`sur ${restaurants.length} comptes`}
        />
      </div>

      <Card title="Abonnements en cours">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="py-2 pr-3 font-medium">Restaurant</th>
                <th className="py-2 pr-3 font-medium">Plan</th>
                <th className="py-2 pr-3 font-medium">Prix</th>
                <th className="py-2 pr-3 font-medium">Statut</th>
                <th className="py-2 font-medium">Inscrit le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {restaurants.map((r) => (
                <tr key={r.id}>
                  <td className="py-3 pr-3 font-medium text-neutral-900">
                    {r.name}
                  </td>
                  <td className="py-3 pr-3 capitalize text-neutral-700">
                    {r.plan}
                  </td>
                  <td className="py-3 pr-3 font-semibold text-neutral-900">
                    {PLAN_PRICE[r.plan]} €/mois
                  </td>
                  <td className="py-3 pr-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="py-3 text-xs text-neutral-500">
                    {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="mt-5 text-xs text-neutral-500">
        💡 Les paiements réels seront connectés à Stripe lors du déploiement (Stripe
        Connect ou abonnements classiques).
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-neutral-900">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}
