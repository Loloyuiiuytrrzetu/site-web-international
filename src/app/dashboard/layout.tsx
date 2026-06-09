import Link from "next/link";
import { requireBusiness } from "@/lib/auth";
import { logout } from "@/lib/session-actions";
import { BRAND } from "@/lib/brand";
import { DashboardTabs } from "@/components/DashboardTabs";

// Layout commun à tout l'espace commerçant (/dashboard/*).
// - Protège l'accès (redirige vers /login si non connecté).
// - Affiche l'en-tête (marque + commerce + déconnexion) et les onglets.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const business = await requireBusiness();
  const color = business.color;

  return (
    <div className="flex min-h-full flex-col">
      {/* En-tête */}
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span
              className="text-lg font-extrabold tracking-tight"
              style={{ color: BRAND.bordeaux }}
            >
              {BRAND.name}
            </span>
            <span className="hidden text-sm text-neutral-400 sm:inline">/ {business.name}</span>
          </Link>
          <div className="flex items-center gap-3">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: color }}
              title={business.name}
            >
              {business.name.slice(0, 2).toUpperCase()}
            </span>
            <form action={logout}>
              <button className="btn rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900">
                Déconnexion
              </button>
            </form>
          </div>
        </div>
        <DashboardTabs color={color} />
      </header>

      {children}
    </div>
  );
}
