"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Palette,
  QrCode,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { useCurrentRestaurant } from "@/lib/store";
import { Card, PageHeader } from "./_components/ui";
import { TranslationsBanner } from "./_components/TranslationsBanner";

export default function AdminDashboardPage() {
  const restaurant = useCurrentRestaurant();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !restaurant) return null;

  const totalDishes = restaurant.categories.reduce(
    (n, c) => n + c.dishes.length,
    0
  );

  const shortcuts = [
    {
      href: "/admin/restaurant",
      icon: Store,
      title: "Mon restaurant",
      desc: "Nom, logo, contact",
    },
    {
      href: "/admin/theme",
      icon: Palette,
      title: "Apparence",
      desc: "Couleurs et thème",
    },
    {
      href: "/admin/menu",
      icon: UtensilsCrossed,
      title: "Menu",
      desc: "Catégories et plats",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl p-5 lg:p-8">
      <PageHeader
        title={`Bonjour ${restaurant.name}`}
        description="Voici un aperçu de votre menu digital."
      />

      <TranslationsBanner />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Catégories" value={restaurant.categories.length} />
        <Stat label="Plats" value={totalDishes} />
        <Stat label="Langues" value={restaurant.locales.length} />
        <Stat label="Statut" value="En ligne" highlight />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card title="Raccourcis" description="Modifiez votre menu en un clic.">
          <ul className="flex flex-col gap-2">
            {shortcuts.map((s) => {
              const Icon = s.icon;
              return (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className="flex items-center gap-3 rounded-xl border border-neutral-200 p-3 transition hover:border-brand-300 hover:bg-brand-50/40"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                      <Icon size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-neutral-900">
                        {s.title}
                      </p>
                      <p className="text-xs text-neutral-500">{s.desc}</p>
                    </div>
                    <ArrowRight size={16} className="text-neutral-400" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card title="QR Code de votre menu" description="À imprimer pour vos tables.">
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="flex h-40 w-40 items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50">
              <QrCode size={64} className="text-neutral-400" />
            </div>
            <Link
              href="/admin/qr"
              className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
            >
              Générer mon QR <ArrowRight size={12} />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-neutral-500">{label}</p>
      <p
        className={`mt-1 text-2xl font-bold ${
          highlight ? "text-emerald-600" : "text-neutral-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
