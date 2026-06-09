"use client";

import { useEffect, useRef, useState } from "react";
import { addStamp, type StampResult } from "@/lib/loyalty";

// État affiché après un scan (bandeau de confirmation).
type Feedback =
  | { kind: "success"; customer: string; stampsCount: number; goal: number; color: string }
  | { kind: "reward"; customer: string; reward: string; color: string }
  | { kind: "error"; message: string }
  | null;

const READER_ID = "wlz-reader";
// On ignore un même QR rescanné dans cet intervalle (évite les doublons).
const COOLDOWN_MS = 4000;

/**
 * Scanner caméra pour le commerçant : lit le QR de la carte d'un client
 * et ajoute automatiquement un tampon. Utilise html5-qrcode (chargé côté client).
 */
export function QrScanner() {
  const [status, setStatus] = useState<"loading" | "scanning" | "denied">("loading");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [processing, setProcessing] = useState(false);

  // Réfs pour piloter le scanner sans relancer l'effet.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scannerRef = useRef<any>(null);
  const lastTokenRef = useRef<{ token: string; at: number } | null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;
        const scanner = new Html5Qrcode(READER_ID);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText: string) => handleDecoded(decodedText),
          () => {
            /* erreurs de décodage par image : normal, on ignore */
          },
        );
        if (!cancelled) setStatus("scanning");
      } catch (e) {
        console.error("Scanner:", e);
        if (!cancelled) setStatus("denied");
      }
    }

    start();

    return () => {
      cancelled = true;
      const s = scannerRef.current;
      if (s) {
        s.stop()
          .then(() => s.clear())
          .catch(() => {});
        scannerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Extrait le jeton de carte depuis le texte du QR (URL .../c/<token> ou jeton brut). */
  function extractToken(text: string): string {
    const t = text.trim();
    const marker = "/c/";
    const idx = t.indexOf(marker);
    if (idx >= 0) {
      return t.slice(idx + marker.length).split(/[/?#]/)[0];
    }
    return t;
  }

  async function handleDecoded(decodedText: string) {
    const token = extractToken(decodedText);
    if (!token) return;

    // Anti-doublon : même carte scannée trop vite -> on ignore.
    const now = Date.now();
    const last = lastTokenRef.current;
    if (last && last.token === token && now - last.at < COOLDOWN_MS) return;
    if (busyRef.current) return;

    lastTokenRef.current = { token, at: now };
    busyRef.current = true;
    setProcessing(true);

    try {
      const res: StampResult = await addStamp(token);
      if ("error" in res) {
        setFeedback({ kind: "error", message: res.error });
      } else if (res.rewarded) {
        setFeedback({
          kind: "reward",
          customer: res.customer,
          reward: res.reward ?? "Récompense",
          color: res.color,
        });
      } else {
        setFeedback({
          kind: "success",
          customer: res.customer,
          stampsCount: res.stampsCount,
          goal: res.goal,
          color: res.color,
        });
      }
    } catch {
      setFeedback({ kind: "error", message: "Erreur réseau, réessayez." });
    } finally {
      busyRef.current = false;
      setProcessing(false);
      // Le bandeau disparaît après quelques secondes.
      setTimeout(() => setFeedback(null), COOLDOWN_MS);
    }
  }

  return (
    <div className="space-y-4">
      {/* Zone caméra */}
      <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-black">
        <div id={READER_ID} className="aspect-square w-full" />

        {status === "loading" && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-white/70">
            Activation de la caméra…
          </p>
        )}

        {status === "denied" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center text-white">
            <p className="font-semibold">📷 Caméra non disponible</p>
            <p className="text-sm text-white/70">
              Autorisez l'accès à la caméra dans votre navigateur, ou utilisez la
              saisie manuelle.
            </p>
          </div>
        )}

        {processing && (
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold">
            …
          </span>
        )}
      </div>

      {/* Bandeau de confirmation après scan */}
      {feedback && (
        <div
          className="rounded-2xl p-4 text-center text-white shadow-lg"
          style={{
            background:
              feedback.kind === "error"
                ? "#b91c1c"
                : "color" in feedback
                  ? feedback.color
                  : "#16a34a",
          }}
        >
          {feedback.kind === "success" && (
            <p className="font-semibold">
              ✓ {feedback.customer} — {feedback.stampsCount}/{feedback.goal} tampons
            </p>
          )}
          {feedback.kind === "reward" && (
            <p className="font-semibold">
              🎉 {feedback.customer} a gagné : {feedback.reward} !
            </p>
          )}
          {feedback.kind === "error" && <p className="font-semibold">⚠️ {feedback.message}</p>}
        </div>
      )}

      {status === "scanning" && !feedback && (
        <p className="text-center text-sm text-neutral-500">
          Visez le QR code de la carte du client 📲
        </p>
      )}
    </div>
  );
}
