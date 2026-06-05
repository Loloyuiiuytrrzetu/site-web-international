"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { WALLETIZ_BRAND } from "@/lib/brand";

const BRAND = WALLETIZ_BRAND.colors.primary;

type Status = "loading" | "ready" | "no-session" | "saving" | "done" | "error";

export default function AuthSetupPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setEmail(data.session.user.email ?? "");
        setStatus("ready");
      } else {
        setStatus("no-session");
      }
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Le mot de passe doit faire au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setStatus("saving");
    const { error: updateErr } = await supabase.auth.updateUser({ password });
    if (updateErr) {
      setStatus("ready");
      setError(updateErr.message);
      return;
    }
    setStatus("done");
    setTimeout(() => router.push("/admin"), 1200);
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-neutral-50">
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
                Activez votre compte
              </h1>
              <p className="mt-1 text-sm text-neutral-600">
                Choisissez le mot de passe que vous utiliserez pour vous connecter.
              </p>
            </div>

            {status === "loading" && (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-neutral-500">
                <Loader2 size={16} className="animate-spin" />
                Vérification du lien...
              </div>
            )}

            {status === "no-session" && (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700">
                  <ShieldAlert size={20} />
                </div>
                <p className="text-sm font-semibold text-neutral-900">
                  Lien invalide ou expiré
                </p>
                <p className="text-xs text-neutral-600">
                  Demandez à votre administrateur Walletiz de vous renvoyer une
                  invitation.
                </p>
                <Link
                  href="/login"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold"
                  style={{ color: BRAND }}
                >
                  Aller à la page de connexion
                </Link>
              </div>
            )}

            {status === "done" && (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  ✓
                </div>
                <p className="text-sm font-semibold text-neutral-900">
                  Mot de passe enregistré !
                </p>
                <p className="text-xs text-neutral-600">
                  Redirection vers votre tableau de bord...
                </p>
              </div>
            )}

            {(status === "ready" || status === "saving") && (
              <form onSubmit={submit} className="flex flex-col gap-3">
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-2.5 text-xs text-neutral-600">
                  Vous activez le compte de{" "}
                  <span className="font-semibold text-neutral-900">{email}</span>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-neutral-700">
                    Nouveau mot de passe
                  </span>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 pr-10 text-sm shadow-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-200"
                      placeholder="Au moins 8 caractères"
                      minLength={8}
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

                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-neutral-700">
                    Confirmer le mot de passe
                  </span>
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-200"
                    placeholder="Retapez le même mot de passe"
                    minLength={8}
                  />
                </label>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    <ShieldAlert size={14} />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "saving"}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-95 disabled:opacity-60"
                  style={{ backgroundColor: BRAND }}
                >
                  {status === "saving" ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      Activer mon compte
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
