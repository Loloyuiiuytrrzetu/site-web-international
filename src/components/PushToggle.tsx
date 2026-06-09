"use client";

import { useEffect, useState } from "react";
import { getPushPublicKey, subscribeUser, unsubscribeUser } from "@/lib/push-actions";

// Convertit la clé VAPID (base64url) en Uint8Array pour `applicationServerKey`.
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
}

// Bouton d'activation des notifications push sur la carte du client.
// Enregistre le service worker, demande l'autorisation et abonne le navigateur.
export function PushToggle({ token, color }: { token: string; color: string }) {
  const [supported, setSupported] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setSupported(false);
      return;
    }
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setSubscribed(!!sub))
      .catch(() => setSupported(false));
  }, []);

  async function enable() {
    setBusy(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const key = await getPushPublicKey();
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      });
      const res = await subscribeUser(token, JSON.parse(JSON.stringify(sub)));
      if ("error" in res && res.error) {
        setError(res.error);
      } else {
        setSubscribed(true);
      }
    } catch {
      setError("Autorisation refusée ou non disponible.");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await unsubscribeUser(sub.endpoint);
        await sub.unsubscribe();
      }
      setSubscribed(false);
    } catch {
      setError("Impossible de se désabonner.");
    } finally {
      setBusy(false);
    }
  }

  if (!supported) {
    return (
      <p className="rounded-2xl border border-neutral-200 bg-white p-3 text-center text-xs text-neutral-500">
        🔔 Les notifications ne sont pas disponibles sur ce navigateur. Sur
        iPhone, ajoutez d'abord la carte à l'écran d'accueil.
      </p>
    );
  }

  return (
    <div>
      {subscribed ? (
        <button
          onClick={disable}
          disabled={busy}
          className="btn w-full rounded-2xl border-2 py-3 text-sm font-semibold disabled:opacity-50"
          style={{ borderColor: color, color }}
        >
          {busy ? "…" : "🔔 Notifications activées — appuyez pour désactiver"}
        </button>
      ) : (
        <button
          onClick={enable}
          disabled={busy}
          className="btn w-full rounded-2xl py-3 text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: color }}
        >
          {busy ? "Activation…" : "🔔 Activer les notifications"}
        </button>
      )}
      {error && <p className="mt-1 text-center text-xs text-red-600">{error}</p>}
    </div>
  );
}
