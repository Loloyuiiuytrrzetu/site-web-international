"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronsUpDown,
  Eye,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  Palette,
  QrCode,
  ShieldCheck,
  Store,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useRestaurantStore } from "@/lib/store";
import { WALLETIZ_BRAND } from "@/lib/brand";

const nav = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/restaurant", label: "Mon restaurant", icon: Store },
  { href: "/admin/theme", label: "Apparence", icon: Palette },
  { href: "/admin/menu", label: "Menu & plats", icon: UtensilsCrossed },
  { href: "/admin/qr", label: "QR code", icon: QrCode },
];

const BRAND = WALLETIZ_BRAND.colors.primary;
const BRAND_TINT = WALLETIZ_BRAND.colors.surfaceTint;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const restaurants = useRestaurantStore((s) => s.restaurants);
  const currentId = useRestaurantStore((s) => s.currentRestaurantId);
  const setCurrent = useRestaurantStore((s) => s.setCurrentRestaurant);
  const current = restaurants.find((r) => r.id === currentId);
  const logout = useAuth((s) => s.logout);
  const handleLogout = () => {
    logout();
    router.push("/");
  };

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
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition"
            style={
              active
                ? { backgroundColor: BRAND, color: "#fff" }
                : { color: "#404040" }
            }
          >
            <Icon size={18} />
            {n.label}
          </Link>
        );
      })}
      {current && (
        <Link
          href={`/r/${current.slug}`}
          target="_blank"
          onClick={onClick}
          className="mt-2 flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium"
          style={{ borderColor: `${BRAND}33`, color: BRAND, backgroundColor: BRAND_TINT }}
        >
          <Eye size={18} />
          Voir mon menu
        </Link>
      )}
      <button
        type="button"
        onClick={() => {
          onClick?.();
          handleLogout();
        }}
        className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
      >
        <LogOut size={18} /> Déconnexion
      </button>
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
        {current ? (
          <Link
            href={`/r/${current.slug}`}
            target="_blank"
            aria-label="Voir mon menu"
            className="rounded-lg p-2 active:scale-95"
            style={{ color: BRAND }}
          >
            <Eye size={20} />
          </Link>
        ) : (
          <div className="w-9" />
        )}
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

        {mounted && current && restaurants.length > 1 && (
          <div className="relative border-b p-3">
            <button
              type="button"
              onClick={() => setSwitcherOpen((v) => !v)}
              className="flex w-full items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-left hover:bg-neutral-100"
            >
              <div
                className="flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold text-white"
                style={{ backgroundColor: current.theme.primaryColor }}
              >
                {current.name.charAt(0)}
              </div>
              <span className="flex-1 truncate text-sm font-medium">
                {current.name}
              </span>
              <ChevronsUpDown size={14} className="text-neutral-400" />
            </button>
            {switcherOpen && (
              <div className="absolute inset-x-3 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-lg border bg-white p-1 shadow-lg">
                {restaurants.map((r) => (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => {
                      setCurrent(r.id);
                      setSwitcherOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-neutral-100"
                    style={
                      r.id === currentId
                        ? { backgroundColor: BRAND_TINT, color: BRAND }
                        : undefined
                    }
                  >
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold text-white"
                      style={{ backgroundColor: r.theme.primaryColor }}
                    >
                      {r.name.charAt(0)}
                    </div>
                    <span className="flex-1 truncate">{r.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <NavLinks />

        <div className="mt-auto border-t p-3">
          <Link
            href="/walletiz"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium"
            style={{ backgroundColor: BRAND_TINT, color: BRAND }}
          >
            <ShieldCheck size={14} />
            Console Walletiz
          </Link>
          <p className="mt-3 px-1 text-[11px] text-neutral-500">
            Walletiz · Admin v0.1
          </p>
        </div>
      </aside>

      <main className="flex-1 pt-14 lg:pt-0">{children}</main>
    </div>
  );
}

function Brand() {
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
        <p className="text-sm font-bold text-neutral-900">Walletiz</p>
        <p className="text-[10px] uppercase tracking-wider" style={{ color: BRAND }}>
          Admin
        </p>
      </div>
    </div>
  );
}
