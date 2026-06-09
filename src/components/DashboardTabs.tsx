"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Onglets de l'espace commerçant. L'onglet actif est déterminé par l'URL.
// Barre responsive : défile horizontalement sur téléphone, centrée sur grand
// écran. Utilisée dans le layout du dashboard.
const TABS = [
  { href: "/dashboard", label: "Tableau de bord", icon: "📊" },
  { href: "/dashboard/programme", label: "Mon programme", icon: "🎁" },
  { href: "/dashboard/campagnes", label: "Campagne", icon: "📣" },
  { href: "/scan", label: "Scanner", icon: "📷" },
];

export function DashboardTabs({ color }: { color: string }) {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-20 border-b border-neutral-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl gap-1 overflow-x-auto px-3 sm:px-6">
        {TABS.map((tab) => {
          // Actif si l'URL correspond exactement, ou commence par l'onglet
          // (sauf /dashboard qui ne doit pas s'activer pour /dashboard/...).
          const active =
            tab.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative whitespace-nowrap px-3 py-3 text-sm font-semibold transition-colors sm:px-4"
              style={{ color: active ? color : "#525252" }}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
              {/* Soulignement animé de l'onglet actif */}
              <span
                className="absolute inset-x-2 bottom-0 h-0.5 rounded-full transition-all duration-300"
                style={{
                  background: color,
                  opacity: active ? 1 : 0,
                  transform: active ? "scaleX(1)" : "scaleX(0)",
                }}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
