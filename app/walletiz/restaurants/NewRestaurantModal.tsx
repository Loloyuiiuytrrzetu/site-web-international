"use client";

import { useState } from "react";
import { Mail, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useRestaurantStore, type ManagedRestaurant } from "@/lib/store";
import { fetchAllManagedRestaurants } from "@/lib/supabase-fetch";
import { Button, Field, Input } from "../../admin/_components/ui";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

type Success = {
  restaurantId: string;
  slug: string;
  ownerEmail: string;
  emailSent: boolean;
};

export function NewRestaurantModal({ onClose }: { onClose: () => void }) {
  const setCurrent = useRestaurantStore((s) => s.setCurrentRestaurant);
  const loadAll = useRestaurantStore((s) => s.loadAllFromSupabase);
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [plan, setPlan] = useState<ManagedRestaurant["plan"]>("starter");
  const [slugTouched, setSlugTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Success | null>(null);

  const onName = (v: string) => {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const submit = async () => {
    if (!name.trim() || !ownerEmail.trim()) return;
    setError(null);
    setSubmitting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setError("Session expirée, reconnectez-vous.");
        return;
      }
      const res = await fetch("/api/walletiz/create-restaurant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || slugify(name.trim()),
          tagline: tagline.trim() || undefined,
          plan,
          ownerEmail: ownerEmail.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de la création.");
        return;
      }
      const all = await fetchAllManagedRestaurants();
      loadAll(all);
      setSuccess(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau.");
    } finally {
      setSubmitting(false);
    }
  };

  const finish = () => {
    if (success) {
      setCurrent(success.restaurantId);
      onClose();
      router.push("/admin/restaurant");
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Fermer"
        onClick={success ? finish : onClose}
        className="absolute inset-0 bg-black/50"
      />
      <div className="relative z-10 max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {success ? "Compte créé ✓" : "Nouveau restaurant"}
          </h2>
          <button
            type="button"
            aria-label="Fermer"
            onClick={success ? finish : onClose}
            className="rounded-lg p-1.5 hover:bg-neutral-100"
          >
            <X size={18} />
          </button>
        </header>

        {success ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Mail size={22} />
              </div>
              <div>
                <p className="text-base font-semibold text-emerald-900">
                  Email d&apos;activation envoyé
                </p>
                <p className="mt-1 text-sm text-emerald-800">
                  Un lien vient d&apos;être envoyé à{" "}
                  <span className="font-semibold">{success.ownerEmail}</span>.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-700">
              <p className="font-semibold text-neutral-900">Prochaines étapes</p>
              <ul className="mt-1.5 list-decimal pl-4 space-y-1">
                <li>Le restaurateur reçoit l&apos;email.</li>
                <li>Il clique sur le lien pour activer son compte.</li>
                <li>Il définit son propre mot de passe et accède à son admin.</li>
              </ul>
            </div>

            <Button onClick={finish} className="w-full">
              Gérer ce restaurant
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              <Field label="Nom du restaurant">
                <Input
                  autoFocus
                  value={name}
                  onChange={(e) => onName(e.target.value)}
                  placeholder="Ex: La Trattoria"
                />
              </Field>

              <Field
                label="URL du menu"
                hint={`Le menu sera accessible sur /r/${slug || "votre-resto"}`}
              >
                <div className="flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm">
                  <span className="text-neutral-400">/r/</span>
                  <input
                    value={slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setSlug(slugify(e.target.value));
                    }}
                    className="flex-1 bg-transparent outline-none"
                    placeholder="la-trattoria"
                  />
                </div>
              </Field>

              <Field label="Slogan (optionnel)">
                <Input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Cuisine italienne authentique"
                />
              </Field>

              <Field
                label="Email du restaurateur"
                hint="Servira d'identifiant de connexion."
              >
                <Input
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="contact@latrattoria.com"
                />
              </Field>

              <Field label="Plan d'abonnement">
                <div className="grid grid-cols-3 gap-2">
                  {(["starter", "pro", "enterprise"] as const).map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPlan(p)}
                      className={`rounded-lg border px-3 py-2 text-xs font-medium capitalize transition ${
                        plan === p
                          ? "border-brand-700 bg-brand-50 text-brand-700"
                          : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      {p}
                      <span className="mt-0.5 block text-[10px] text-neutral-500">
                        {p === "starter"
                          ? "19 €"
                          : p === "pro"
                            ? "39 €"
                            : "99 €"}
                        /mois
                      </span>
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            {error && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </p>
            )}

            <div className="mt-5 flex gap-2">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={submitting}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={submit}
                disabled={!name.trim() || !ownerEmail.trim() || submitting}
                className="flex-1"
              >
                {submitting ? "Création..." : "Créer le compte"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
