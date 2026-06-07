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
  | "molluscs"
  | "celery"
  | "lupin"
  | "mushroom"
  | "onion";

export const ALLERGENS: {
  id: Allergen;
  emoji: string;
  label: string;
  labels: Record<Locale, string>;
}[] = [
  {
    id: "gluten",
    emoji: "🌾",
    label: "Gluten",
    labels: {
      fr: "Gluten",
      en: "Gluten",
      ar: "غلوتين",
      es: "Gluten",
      it: "Glutine",
      de: "Gluten",
      pt: "Glúten",
      zh: "麸质",
    },
  },
  {
    id: "lactose",
    emoji: "🥛",
    label: "Lactose",
    labels: {
      fr: "Lactose",
      en: "Lactose",
      ar: "لاكتوز",
      es: "Lactosa",
      it: "Lattosio",
      de: "Laktose",
      pt: "Lactose",
      zh: "乳糖",
    },
  },
  {
    id: "eggs",
    emoji: "🥚",
    label: "Œufs",
    labels: {
      fr: "Œufs",
      en: "Eggs",
      ar: "بيض",
      es: "Huevos",
      it: "Uova",
      de: "Eier",
      pt: "Ovos",
      zh: "鸡蛋",
    },
  },
  {
    id: "peanuts",
    emoji: "🥜",
    label: "Arachides",
    labels: {
      fr: "Arachides",
      en: "Peanuts",
      ar: "فول سوداني",
      es: "Cacahuetes",
      it: "Arachidi",
      de: "Erdnüsse",
      pt: "Amendoins",
      zh: "花生",
    },
  },
  {
    id: "nuts",
    emoji: "🌰",
    label: "Fruits à coque",
    labels: {
      fr: "Fruits à coque",
      en: "Tree nuts",
      ar: "مكسرات",
      es: "Frutos secos",
      it: "Frutta a guscio",
      de: "Schalenfrüchte",
      pt: "Frutos secos",
      zh: "坚果",
    },
  },
  {
    id: "crustaceans",
    emoji: "🦐",
    label: "Crustacés",
    labels: {
      fr: "Crustacés",
      en: "Crustaceans",
      ar: "قشريات",
      es: "Crustáceos",
      it: "Crostacei",
      de: "Krebstiere",
      pt: "Crustáceos",
      zh: "甲壳类",
    },
  },
  {
    id: "fish",
    emoji: "🐟",
    label: "Poisson",
    labels: {
      fr: "Poisson",
      en: "Fish",
      ar: "سمك",
      es: "Pescado",
      it: "Pesce",
      de: "Fisch",
      pt: "Peixe",
      zh: "鱼",
    },
  },
  {
    id: "molluscs",
    emoji: "🦪",
    label: "Mollusques",
    labels: {
      fr: "Mollusques",
      en: "Molluscs",
      ar: "رخويات",
      es: "Moluscos",
      it: "Molluschi",
      de: "Weichtiere",
      pt: "Moluscos",
      zh: "软体动物",
    },
  },
  {
    id: "soy",
    emoji: "🌱",
    label: "Soja",
    labels: {
      fr: "Soja",
      en: "Soy",
      ar: "صويا",
      es: "Soja",
      it: "Soia",
      de: "Soja",
      pt: "Soja",
      zh: "大豆",
    },
  },
  {
    id: "celery",
    emoji: "🥬",
    label: "Céleri",
    labels: {
      fr: "Céleri",
      en: "Celery",
      ar: "كرفس",
      es: "Apio",
      it: "Sedano",
      de: "Sellerie",
      pt: "Aipo",
      zh: "芹菜",
    },
  },
  {
    id: "lupin",
    emoji: "🌼",
    label: "Lupin",
    labels: {
      fr: "Lupin",
      en: "Lupin",
      ar: "ترمس",
      es: "Altramuces",
      it: "Lupini",
      de: "Lupinen",
      pt: "Tremoço",
      zh: "羽扇豆",
    },
  },
  {
    id: "mushroom",
    emoji: "🍄",
    label: "Champignon",
    labels: {
      fr: "Champignon",
      en: "Mushroom",
      ar: "فطر",
      es: "Setas",
      it: "Funghi",
      de: "Pilze",
      pt: "Cogumelos",
      zh: "蘑菇",
    },
  },
  {
    id: "onion",
    emoji: "🧅",
    label: "Oignon",
    labels: {
      fr: "Oignon",
      en: "Onion",
      ar: "بصل",
      es: "Cebolla",
      it: "Cipolla",
      de: "Zwiebel",
      pt: "Cebola",
      zh: "洋葱",
    },
  },
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
