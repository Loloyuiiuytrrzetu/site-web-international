import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

// Manifest PWA : permet d'« ajouter à l'écran d'accueil » (requis sur iOS pour
// recevoir les notifications push) et donne une apparence d'app native.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND.name} — Carte de fidélité`,
    short_name: BRAND.name,
    description: BRAND.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: BRAND.bordeaux,
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
