"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Rafraîchit les données serveur de la page à intervalle régulier,
 * pour donner l'effet « temps réel » (les nouveaux scans apparaissent seuls).
 * `router.refresh()` recharge les Server Components sans recharger toute la page.
 */
export function AutoRefresh({ seconds = 15 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);
  return null;
}
