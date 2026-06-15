import type { Locale, Translatable } from "./types";

export function t<K extends string>(
  fallback: string | undefined,
  key: K,
  translations: Translatable<K> | undefined,
  locale: Locale
): string | undefined {
  return translations?.[locale]?.[key] || fallback;
}

export const UI_LABELS: Record<Locale, {
  back: string;
  dishes: (n: number) => string;
  myOrder: string;
  add: string;
  photo: string;
  view3d: string;
  available: string;
  unavailable: string;
  whatsapp: string;
  call: string;
  map: string;
  googleReview: string;
  noDishes: string;
  allergens: string;
  total: string;
}> = {
  fr: {
    back: "Retour",
    dishes: (n) => `${n} plat${n > 1 ? "s" : ""}`,
    myOrder: "Ma commande",
    add: "Ajouter",
    photo: "Photo",
    view3d: "3D",
    available: "Disponible",
    unavailable: "Indisponible",
    whatsapp: "WhatsApp",
    call: "Appeler",
    map: "Plan",
    googleReview: "Avis Google",
    noDishes: "Aucun plat dans cette catégorie.",
    allergens: "Allergènes",
    total: "Total",
  },
  en: {
    back: "Back",
    dishes: (n) => `${n} dish${n > 1 ? "es" : ""}`,
    myOrder: "My order",
    add: "Add",
    photo: "Photo",
    view3d: "3D",
    available: "Available",
    unavailable: "Unavailable",
    whatsapp: "WhatsApp",
    call: "Call",
    map: "Map",
    googleReview: "Google Review",
    noDishes: "No dishes in this category.",
    allergens: "Allergens",
    total: "Total",
  },
  ar: {
    back: "رجوع",
    dishes: (n) => `${n} طبق`,
    myOrder: "طلبي",
    add: "أضف",
    photo: "صورة",
    view3d: "ثلاثي الأبعاد",
    available: "متوفر",
    unavailable: "غير متوفر",
    whatsapp: "واتساب",
    call: "اتصال",
    map: "الخريطة",
    googleReview: "تقييم Google",
    noDishes: "لا توجد أطباق في هذه الفئة.",
    allergens: "مسببات الحساسية",
    total: "المجموع",
  },
  es: {
    back: "Volver",
    dishes: (n) => `${n} plato${n > 1 ? "s" : ""}`,
    myOrder: "Mi pedido",
    add: "Añadir",
    photo: "Foto",
    view3d: "3D",
    available: "Disponible",
    unavailable: "No disponible",
    whatsapp: "WhatsApp",
    call: "Llamar",
    map: "Mapa",
    googleReview: "Reseña Google",
    noDishes: "No hay platos en esta categoría.",
    allergens: "Alérgenos",
    total: "Total",
  },
  it: {
    back: "Indietro",
    dishes: (n) => `${n} piatt${n > 1 ? "i" : "o"}`,
    myOrder: "Il mio ordine",
    add: "Aggiungi",
    photo: "Foto",
    view3d: "3D",
    available: "Disponibile",
    unavailable: "Non disponibile",
    whatsapp: "WhatsApp",
    call: "Chiama",
    map: "Mappa",
    googleReview: "Recensione Google",
    noDishes: "Nessun piatto in questa categoria.",
    allergens: "Allergeni",
    total: "Totale",
  },
  de: {
    back: "Zurück",
    dishes: (n) => `${n} Gericht${n > 1 ? "e" : ""}`,
    myOrder: "Meine Bestellung",
    add: "Hinzufügen",
    photo: "Foto",
    view3d: "3D",
    available: "Verfügbar",
    unavailable: "Nicht verfügbar",
    whatsapp: "WhatsApp",
    call: "Anrufen",
    map: "Karte",
    googleReview: "Google-Bewertung",
    noDishes: "Keine Gerichte in dieser Kategorie.",
    allergens: "Allergene",
    total: "Gesamt",
  },
  pt: {
    back: "Voltar",
    dishes: (n) => `${n} prato${n > 1 ? "s" : ""}`,
    myOrder: "Meu pedido",
    add: "Adicionar",
    photo: "Foto",
    view3d: "3D",
    available: "Disponível",
    unavailable: "Indisponível",
    whatsapp: "WhatsApp",
    call: "Ligar",
    map: "Mapa",
    googleReview: "Avaliação Google",
    noDishes: "Nenhum prato nesta categoria.",
    allergens: "Alérgenos",
    total: "Total",
  },
  zh: {
    back: "返回",
    dishes: (n) => `${n} 道菜`,
    myOrder: "我的订单",
    add: "添加",
    photo: "照片",
    view3d: "3D",
    available: "可用",
    unavailable: "不可用",
    whatsapp: "WhatsApp",
    call: "致电",
    map: "地图",
    googleReview: "Google 评价",
    noDishes: "此分类中没有菜品。",
    allergens: "过敏原",
    total: "总计",
  },
};
