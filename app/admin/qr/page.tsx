"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, Printer } from "lucide-react";
import { useCurrentRestaurant } from "@/lib/store";
import { Button, Card, PageHeader } from "../_components/ui";
import { WALLETIZ_BRAND } from "@/lib/brand";

const BRAND = WALLETIZ_BRAND.colors.primary;

export default function QrPage() {
  const restaurant = useCurrentRestaurant();
  const [mounted, setMounted] = useState(false);
  const [origin, setOrigin] = useState("");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [color, setColor] = useState<"black" | "brand">("black");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  const menuUrl = restaurant ? `${origin}/r/${restaurant.slug}` : "";

  useEffect(() => {
    if (!menuUrl) return;
    QRCode.toDataURL(menuUrl, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 800,
      color: {
        dark: color === "brand" ? BRAND : "#000000",
        light: "#ffffff",
      },
    }).then(setDataUrl);
  }, [menuUrl, color]);

  if (!mounted || !restaurant) return null;

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qr-${restaurant.slug}.png`;
    a.click();
  };

  const print = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-3xl p-5 lg:p-8">
      <PageHeader
        title="QR Code"
        description="Imprimez et posez ce QR code sur vos tables. Vos clients scanneront pour voir votre menu."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="URL publique de votre menu">
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 font-mono text-xs break-all">
            {menuUrl || "..."}
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            Cette URL est unique à votre restaurant. Partagez-la, encodez-la dans
            votre QR ou imprimez-la directement.
          </p>

          <div className="mt-5">
            <p className="mb-2 text-xs font-medium text-neutral-700">Couleur du QR</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setColor("black")}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${
                  color === "black"
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 bg-white text-neutral-700"
                }`}
              >
                <span className="h-3 w-3 rounded bg-neutral-900" /> Noir
              </button>
              <button
                type="button"
                onClick={() => setColor("brand")}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${
                  color === "brand"
                    ? "text-white"
                    : "border-neutral-200 bg-white text-neutral-700"
                }`}
                style={
                  color === "brand"
                    ? { backgroundColor: BRAND, borderColor: BRAND }
                    : undefined
                }
              >
                <span
                  className="h-3 w-3 rounded"
                  style={{ backgroundColor: BRAND }}
                />
                Bordeaux
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Button onClick={download} className="flex-1">
              <Download size={16} /> Télécharger PNG
            </Button>
            <Button variant="secondary" onClick={print} className="flex-1">
              <Printer size={16} /> Imprimer chevalet
            </Button>
          </div>
        </Card>

        <Card title="Aperçu">
          <div className="flex items-center justify-center rounded-xl bg-neutral-50 p-6">
            {dataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={dataUrl} alt="QR code" className="h-56 w-56" />
            ) : (
              <div className="h-56 w-56 animate-pulse rounded bg-neutral-200" />
            )}
          </div>
          <p className="mt-3 text-center text-xs text-neutral-500">
            Pointez votre téléphone pour tester
          </p>
        </Card>
      </div>

      <div ref={printRef} className="print-only">
        {dataUrl && (
          <PrintableChevalet
            restaurant={restaurant}
            qrDataUrl={dataUrl}
            url={menuUrl}
          />
        )}
      </div>

      <style jsx global>{`
        .print-only {
          display: none;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          .print-only,
          .print-only * {
            visibility: visible;
          }
          .print-only {
            display: block;
            position: absolute;
            inset: 0;
          }
        }
      `}</style>
    </div>
  );
}

function PrintableChevalet({
  restaurant,
  qrDataUrl,
  url,
}: {
  restaurant: { name: string };
  qrDataUrl: string;
  url: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-12 text-center">
      <h1 className="text-4xl font-bold">{restaurant.name}</h1>
      <p className="text-xl">Scannez pour découvrir notre menu</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qrDataUrl} alt="QR" style={{ width: 320, height: 320 }} />
      <p className="font-mono text-sm text-neutral-700">{url}</p>
      <p className="mt-4 text-xs text-neutral-400">Powered by Walletiz</p>
    </div>
  );
}
