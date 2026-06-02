export type Locale = "fr" | "en" | "ar" | "es" | "it" | "de" | "pt" | "zh";

export type Money = {
  amount: number;
  currency: string;
};

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
};

export type Category = {
  id: string;
  name: string;
  tagline?: string;
  imageUrl?: string;
  dishes: Dish[];
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
};
