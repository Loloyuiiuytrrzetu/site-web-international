"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRestaurantStore } from "@/lib/store";
import { fetchRestaurantById } from "@/lib/supabase-fetch";

export function AdminDataLoader({ children }: { children: React.ReactNode }) {
  const session = useAuth((s) => s.session);
  const loadFromSupabase = useRestaurantStore((s) => s.loadFromSupabase);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!session) return;
      if (session.role === "walletiz") {
        setLoaded(true);
        return;
      }
      if (!session.restaurantId) {
        setError(
          "Votre compte n'est lié à aucun restaurant. Contactez l'administrateur Walletiz."
        );
        setLoaded(true);
        return;
      }
      const restaurant = await fetchRestaurantById(session.restaurantId);
      if (cancelled) return;
      if (!restaurant) {
        setError(
          "Impossible de charger votre restaurant. Réessayez ou contactez le support."
        );
        setLoaded(true);
        return;
      }
      loadFromSupabase(restaurant);
      setLoaded(true);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [session, loadFromSupabase]);

  if (!loaded) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center">
        <p className="text-sm text-neutral-500">Chargement de votre restaurant...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center p-6 text-center">
        <p className="max-w-md text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return <>{children}</>;
}
