export type FontOption = {
  id: string;
  label: string;
  description: string;
  family: string;
  googleHref: string;
  weight?: number;
  style?: "normal" | "italic";
};

export const FONT_OPTIONS: FontOption[] = [
  {
    id: "system",
    label: "Système",
    description: "Police par défaut · neutre, lisible",
    family:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    googleHref: "",
  },
  {
    id: "georgia-italic",
    label: "Georgia italique",
    description: "Classique élégant · trattoria, brasserie traditionnelle",
    family: "Georgia, 'Times New Roman', serif",
    googleHref: "",
    style: "italic",
  },
  {
    id: "montserrat-light",
    label: "Montserrat Light",
    description: "Épuré moderne · cuisine contemporaine, healthy",
    family: "'Montserrat', sans-serif",
    googleHref: "Montserrat:wght@300;400;600",
    weight: 300,
  },
  {
    id: "inter",
    label: "Inter",
    description: "Moderne · brasserie, bistrot contemporain",
    family: "'Inter', sans-serif",
    googleHref: "Inter:wght@400;600;700",
  },
  {
    id: "playfair",
    label: "Playfair Display",
    description: "Élégant · gastronomique, haut de gamme",
    family: "'Playfair Display', serif",
    googleHref: "Playfair+Display:wght@500;700",
  },
  {
    id: "poppins",
    label: "Poppins",
    description: "Arrondi · pizzeria, burger, snack",
    family: "'Poppins', sans-serif",
    googleHref: "Poppins:wght@400;600;700",
  },
  {
    id: "cormorant",
    label: "Cormorant Garamond",
    description: "Sophistiqué · cuisine fine, étoilé",
    family: "'Cormorant Garamond', serif",
    googleHref: "Cormorant+Garamond:wght@500;700",
  },
  {
    id: "lora",
    label: "Lora",
    description: "Chaleureux · brasserie traditionnelle",
    family: "'Lora', serif",
    googleHref: "Lora:wght@400;600;700",
  },
  {
    id: "bebas",
    label: "Bebas Neue",
    description: "Impact · street food, food truck",
    family: "'Bebas Neue', sans-serif",
    googleHref: "Bebas+Neue",
  },
  {
    id: "dm-serif",
    label: "DM Serif Display",
    description: "Créatif · cuisine fusion, moderne",
    family: "'DM Serif Display', serif",
    googleHref: "DM+Serif+Display",
  },
];

export function getFontOption(id?: string): FontOption {
  return FONT_OPTIONS.find((f) => f.id === id) ?? FONT_OPTIONS[0];
}

export function buildGoogleFontsUrl(fontIds: string[]): string | null {
  const families = fontIds
    .map((id) => getFontOption(id).googleHref)
    .filter((href) => href.length > 0);
  if (families.length === 0) return null;
  const unique = Array.from(new Set(families));
  return `https://fonts.googleapis.com/css2?${unique
    .map((f) => `family=${f}`)
    .join("&")}&display=swap`;
}
