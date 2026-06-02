"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Eye,
  LayoutDashboard,
  Menu as MenuIcon,
  Palette,
  Store,
  UtensilsCrossed,
  X,
} from "lucide-react";

const nav = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/restaurant", label: "Mon restaurant", icon: Store },
  { href: "/admin/theme", label: "Apparence", icon: Palette },
  { href: "/admin/menu", label: "Menu & plats", icon: UtensilsCrossed },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
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
                ? "bg-violet-600 text-white"
                : "text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            <Icon size={18} />
            {n.label}
          </Link>
        );
      })}
      <Link
        href="/"
        target="_blank"
        onClick={onClick}
        className="mt-2 flex items-center gap-3 rounded-lg border border-violet-200 px-3 py-2.5 text-sm font-medium text-violet-700 hover:bg-violet-50"
      >
        <Eye size={18} />
        Voir mon menu
      </Link>
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-1 bg-neutral-100">
      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b bg-white px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          className="rounded-lg p-2 active:scale-95"
        >
          <MenuIcon size={20} />
        </button>
        <Brand />
        <Link
          href="/"
          target="_blank"
          aria-label="Voir mon menu"
          className="rounded-lg p-2 text-violet-700 active:scale-95"
        >
          <Eye size={20} />
        </Link>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <Brand />
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

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-white lg:flex lg:flex-col">
        <div className="border-b px-5 py-4">
          <Brand />
        </div>
        <NavLinks />
        <div className="mt-auto border-t p-3 text-[11px] text-neutral-500">
          <p className="font-medium text-neutral-700">Walletiz</p>
          <p>Solution menu QR · Admin v0.1</p>
        </div>
      </aside>

      <main className="flex-1 pt-14 lg:pt-0">{children}</main>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-sm font-bold text-white">
        W
      </div>
      <div className="leading-tight">
        <p className="text-sm font-bold text-neutral-900">Walletiz</p>
        <p className="text-[10px] uppercase tracking-wider text-violet-600">
          Admin
        </p>
      </div>
    </div>
  );
}
