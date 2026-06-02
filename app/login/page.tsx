"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useRestaurantStore } from "@/lib/store";
import { WALLETIZ_BRAND } from "@/lib/brand";

const BRAND = WALLETIZ_BRAND.colors.primary;
const BRAND_DARK = WALLETIZ_BRAND.colors.primaryDark;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuth((s) => s.login);
  const setCurrentRestaurant = useRestaurantStore((s) => s.setCurrentRestaurant);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = login(email, password);
    if (!result.ok) {
      setError("Email ou mot de passe incorrect.");
      return;
    }
    if (result.role === "walletiz") {
      router.push("/walletiz");
    } else {
      const session = useAuth.getState().session;
      if (session?.restaurantId) setCurrentRestaurant(session.restaurantId);
      router.push("/admin");
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-neutral-50">
      <header className="px-4 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft size={14} /> Retour
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-neutral-200 bg-white p-7 shadow-xl">
            <div className="mb-6 flex flex-col items-center text-center">
              <Image
                src={WALLETIZ_BRAND.logoUrl}
                alt="Walletiz"
                width={56}
                height={56}
                className="h-14 w-14 rounded-2xl"
                priority
              />
              <h1 className="mt-4 text-2xl font-bold text-neutral-900">
                Connexion à Walletiz
              </h1>
              <p className="mt-1 text-sm text-neutral-600">
                Accédez à votre espace pour gérer votre menu.
              </p>
            </div>

            <form onSubmit={submit} className="flex flex-col gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-neutral-700">
                  Email
                </span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-200"
                  placeholder="vous@restaurant.com"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-neutral-700">
                  Mot de passe
                </span>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 pr-10 text-sm shadow-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? "Masquer" : "Afficher"}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-neutral-400 hover:text-neutral-700"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  <ShieldAlert size={14} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-95"
                style={{ backgroundColor: BRAND }}
              >
                Se connecter
                <ArrowRight size={14} />
              </button>
            </form>

            <div className="mt-6 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-3 text-xs text-neutral-600">
              <p className="font-semibold text-neutral-800">Comptes de démo</p>
              <ul className="mt-1.5 space-y-1">
                <li>
                  <span className="font-medium" style={{ color: BRAND_DARK }}>
                    Super admin Walletiz :
                  </span>{" "}
                  <code className="rounded bg-white px-1.5 py-0.5">admin@walletiz.com</code>{" "}
                  /{" "}
                  <code className="rounded bg-white px-1.5 py-0.5">walletiz</code>
                </li>
                <li>
                  <span className="font-medium" style={{ color: BRAND_DARK }}>
                    Restaurateur :
                  </span>{" "}
                  <code className="rounded bg-white px-1.5 py-0.5">resto@walletiz.com</code>{" "}
                  /{" "}
                  <code className="rounded bg-white px-1.5 py-0.5">resto</code>
                </li>
              </ul>
            </div>
          </div>

          <p className="mt-5 text-center text-xs text-neutral-500">
            Pas encore client ?{" "}
            <Link href="/" className="font-semibold" style={{ color: BRAND }}>
              Découvrir Walletiz
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
