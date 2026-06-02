export type Locale = "fr" | "en" | "ar" | "es" | "it" | "de" | "pt" | "zh";

export type Translatable<K extends string> = Partial<
  Record<Locale, Partial<Record<K, string>>>
>;

export type Money = {
  amount: number;
  currency: string;
};

export type Allergen =
  | "gluten"
  | "lactose"
  | "eggs"
  | "peanuts"
  | "nuts"
  | "crustaceans"
  | "fish"
  | "soy"
  | "mustard"
  | "molluscs"
  | "celery"
  | "sulfites"
  | "sesame"
  | "lupin";

export const ALLERGENS: { id: Allergen; emoji: string; label: string }[] = [
  { id: "gluten", emoji: "🌾", label: "Gluten" },
  { id: "lactose", emoji: "🥛", label: "Lactose" },
  { id: "eggs", emoji: "🥚", label: "Œufs" },
  { id: "peanuts", emoji: "🥜", label: "Arachides" },
  { id: "nuts", emoji: "🌰", label: "Fruits à coque" },
  { id: "crustaceans", emoji: "🦐", label: "Crustacés" },
  { id: "fish", emoji: "🐟", label: "Poisson" },
  { id: "molluscs", emoji: "🦪", label: "Mollusques" },
  { id: "soy", emoji: "🌱", label: "Soja" },
  { id: "mustard", emoji: "🌭", label: "Moutarde" },
  { id: "celery", emoji: "🥬", label: "Céleri" },
  { id: "sulfites", emoji: "🍷", label: "Sulfites" },
  { id: "sesame", emoji: "🫘", label: "Sésame" },
  { id: "lupin", emoji: "🌼", label: "Lupin" },
];

export type Dish = {
  id: string;
  name: string;
  subtitle?: string;
  description?: string;
  price: Money;
  imageUrl?: string;
  model3dUrl?: string;
  tags?: string[];
  available: boolean;
  allergens?: Allergen[];
  translations?: Translatable<"name" | "subtitle" | "description">;
};

export type Category = {
  id: string;
  name: string;
  tagline?: string;
  imageUrl?: string;
  dishes: Dish[];
  translations?: Translatable<"name" | "tagline">;
};

export type RestaurantTheme = {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily?: string;
};

export type RestaurantContact = {
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  mapsUrl?: string;
};

export type Restaurant = {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  logoUrl?: string;
  coverUrl?: string;
  locales: Locale[];
  defaultLocale: Locale;
  theme: RestaurantTheme;
  contact: RestaurantContact;
  categories: Category[];
  translations?: Translatable<"name" | "tagline">;
};
