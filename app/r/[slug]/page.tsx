"use client";

import { useEffect, useState, use } from "react";
import { useRestaurantStore } from "@/lib/store";
import { MenuView } from "@/app/components/MenuView";

export default function RestaurantMenuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const restaurants = useRestaurantStore((s) => s.restaurants);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const restaurant = restaurants.find((r) => r.slug === slug);

  if (!restaurant) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center bg-neutral-50 p-6 text-center">
        <div>
          <p className="text-6xl">🍽️</p>
          <h1 className="mt-4 text-xl font-semibold text-neutral-900">
            Menu introuvable
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Le restaurant <span className="font-mono">{slug}</span> n&apos;existe
            pas ou a été désactivé.
          </p>
        </div>
      </div>
    );
  }

  if (restaurant.status === "suspended") {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center bg-neutral-50 p-6 text-center">
        <div>
          <p className="text-6xl">⏸️</p>
          <h1 className="mt-4 text-xl font-semibold text-neutral-900">
            Menu temporairement indisponible
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Merci de revenir plus tard.
          </p>
        </div>
      </div>
    );
  }

  return <MenuView restaurant={restaurant} />;
}
