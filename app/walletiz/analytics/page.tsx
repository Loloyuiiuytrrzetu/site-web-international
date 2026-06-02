"use client";

import { useEffect, useState } from "react";
import { useRestaurantStore } from "@/lib/store";
import { Card, PageHeader } from "../../admin/_components/ui";

export default function AnalyticsPage() {
  const restaurants = useRestaurantStore((s) => s.restaurants);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const ranked = [...restaurants]
    .map((r) => ({
      r,
      dishes: r.categories.reduce((n, c) => n + c.dishes.length, 0),
    }))
    .sort((a, b) => b.dishes - a.dishes);

  return (
    <div className="mx-auto max-w-5xl p-5 lg:p-8">
      <PageHeader
        title="Statistiques"
        description="Activité des restaurants clients."
      />

      <Card
        title="Catalogue par restaurant"
        description="Nombre de plats dans chaque menu."
      >
        <ul className="flex flex-col gap-2.5">
          {ranked.map(({ r, dishes }) => {
            const max = ranked[0]?.dishes || 1;
            const pct = Math.max(8, Math.round((dishes / max) * 100));
            return (
              <li key={r.id}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-neutral-900">{r.name}</span>
                  <span className="text-neutral-500">{dishes} plats</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-violet-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <p className="mt-5 text-xs text-neutral-500">
        💡 Les statistiques de scans, commandes et trafic seront ajoutées dès la
        mise en production (Plausible ou Vercel Analytics).
      </p>
    </div>
  );
}
