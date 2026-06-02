"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  Building2,
  CreditCard,
  LayoutDashboard,
  Menu as MenuIcon,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { WALLETIZ_BRAND } from "@/lib/brand";

const nav = [
  { href: "/walletiz", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/walletiz/restaurants", label: "Restaurants", icon: Building2 },
  { href: "/walletiz/billing", label: "Facturation", icon: CreditCard },
  { href: "/walletiz/analytics", label: "Statistiques", icon: BarChart3 },
];

const BRAND = WALLETIZ_BRAND.colors.primary;
const BRAND_DARK = WALLETIZ_BRAND.colors.primaryDark;
const BRAND_LIGHT = WALLETIZ_BRAND.colors.primaryLight;

const sidebarStyle: React.CSSProperties = {
  background: `linear-gradient(180deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`,
};

export function WalletizShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="flex flex-col gap-1 p-3">
      {nav.map((n) => {
        const active = pathname === n.href;
        const Icon = n.icon;
        return (
          <Link
            key={n.href}
            href={n.href}
            onClick={onClick}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-white/15 text-white"
                : "text-white/75 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon size={18} />
            {n.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-1 bg-neutral-100">
      <header
        className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-white/10 px-4 text-white lg:hidden"
        style={{ backgroundColor: BRAND_DARK }}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          className="rounded-lg p-2 active:scale-95"
        >
          <MenuIcon size={20} />
        </button>
        <Brand dark />
        <div className="w-9" />
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <aside
            className="absolute inset-y-0 left-0 w-72 max-w-[85vw] text-white shadow-xl"
            style={sidebarStyle}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <Brand dark />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="rounded-lg p-1.5 active:scale-95"
              >
                <X size={18} />
              </button>
            </div>
            <NavLinks onClick={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <aside
        className="hidden w-64 shrink-0 text-white lg:flex lg:flex-col"
        style={sidebarStyle}
      >
        <div className="border-b border-white/10 px-5 py-4">
          <Brand dark />
        </div>
        <NavLinks />
        <div className="mt-auto border-t border-white/10 p-4">
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2"
            style={{ backgroundColor: BRAND_LIGHT + "55" }}
          >
            <ShieldCheck size={16} className="text-white" />
            <div className="leading-tight">
              <p className="text-xs font-semibold">Super admin</p>
              <p className="text-[10px] text-white/70">Accès complet</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 pt-14 lg:pt-0">{children}</main>
    </div>
  );
}

function Brand({ dark }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Image
        src={WALLETIZ_BRAND.logoUrl}
        alt="Walletiz"
        width={32}
        height={32}
        className="h-8 w-8 rounded-lg"
        priority
      />
      <div className="leading-tight">
        <p className={`text-sm font-bold ${dark ? "text-white" : "text-neutral-900"}`}>
          Walletiz
        </p>
        <p
          className={`flex items-center gap-1 text-[10px] uppercase tracking-wider ${
            dark ? "text-white/70" : ""
          }`}
          style={dark ? undefined : { color: BRAND }}
        >
          <Sparkles size={9} /> Console
        </p>
      </div>
    </div>
  );
}
