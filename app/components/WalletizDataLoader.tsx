"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRestaurantStore } from "@/lib/store";
import { fetchAllManagedRestaurants } from "@/lib/supabase-fetch";

export function WalletizDataLoader({ children }: { children: React.ReactNode }) {
  const session = useAuth((s) => s.session);
  const loadAllFromSupabase = useRestaurantStore((s) => s.loadAllFromSupabase);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!session || session.role !== "walletiz") return;
      const all = await fetchAllManagedRestaurants();
      if (cancelled) return;
      loadAllFromSupabase(all);
      setLoaded(true);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [session, loadAllFromSupabase]);

  if (!loaded) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center">
        <p className="text-sm text-neutral-500">Chargement des restaurants...</p>
      </div>
    );
  }

  return <>{children}</>;
}
