import type { Restaurant } from "./types";

export const demoRestaurant: Restaurant = {
  id: "demo-il-piatto",
  slug: "il-piatto",
  name: "Il Piatto",
  tagline: "Cuisine italienne authentique",
  logoUrl: "/demo/logo.svg",
  coverUrl:
    "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200&q=80",
  locales: ["fr", "en", "ar", "es", "it", "de", "pt", "zh"],
  defaultLocale: "fr",
  theme: {
    primaryColor: "#1f2937",
    backgroundColor: "#faf7f2",
    textColor: "#1f2937",
    accentColor: "#c2410c",
  },
  contact: {
    phone: "+97312345678",
    whatsapp: "+97312345678",
    email: "contact@ilpiatto.example",
    address: "Juffair, Bahrain",
    mapsUrl: "https://maps.google.com/?q=Juffair+Bahrain",
  },
  categories: [
    {
      id: "cat-mains",
      name: "Plats principaux",
      tagline: "Hearty plates for every craving",
      imageUrl:
        "https://images.unsplash.com/photo-1432139509613-5c4255815697?auto=format&fit=crop&w=800&q=80",
      dishes: [
        {
          id: "dish-truffle-pasta",
          name: "Tagliatelles à la truffe",
          subtitle: "Crème fraîche, parmesan affiné 24 mois",
          description:
            "Pâtes fraîches maison, crème de truffe noire et copeaux de parmesan.",
          price: { amount: 18.5, currency: "EUR" },
          imageUrl:
            "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80",
          tags: ["Signature", "Végétarien"],
          available: true,
        },
        {
          id: "dish-osso-buco",
          name: "Osso buco milanese",
          subtitle: "Risotto safrané, gremolata",
          description:
            "Jarret de veau braisé pendant 6h, servi avec un risotto crémeux au safran.",
          price: { amount: 26, currency: "EUR" },
          imageUrl:
            "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
          available: true,
        },
        {
          id: "dish-risotto",
          name: "Risotto aux cèpes",
          subtitle: "Cèpes frais, beurre noisette",
          price: { amount: 19, currency: "EUR" },
          imageUrl:
            "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=800&q=80",
          tags: ["Végétarien"],
          available: true,
        },
      ],
    },
    {
      id: "cat-breakfast",
      name: "Petit-déjeuner",
      tagline: "Morning favorites to start fresh",
      imageUrl:
        "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=800&q=80",
      dishes: [
        {
          id: "dish-cornetto",
          name: "Cornetto crème",
          subtitle: "Viennoiserie italienne",
          price: { amount: 3.5, currency: "EUR" },
          imageUrl:
            "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80",
          available: true,
        },
        {
          id: "dish-eggs-benedict",
          name: "Œufs Bénédicte",
          subtitle: "Pain brioché, sauce hollandaise",
          price: { amount: 12, currency: "EUR" },
          imageUrl:
            "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=800&q=80",
          available: true,
        },
      ],
    },
    {
      id: "cat-pizza",
      name: "Pizzas",
      tagline: "Hand tossed pies with bold toppings",
      imageUrl:
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
      dishes: [
        {
          id: "dish-margherita",
          name: "Margherita",
          subtitle: "Mozzarella di bufala, basilic frais",
          price: { amount: 13, currency: "EUR" },
          imageUrl:
            "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80",
          tags: ["Classique"],
          available: true,
        },
        {
          id: "dish-tartufo",
          name: "Tartufo",
          subtitle: "Crème truffée, champignons, parmesan",
          price: { amount: 17, currency: "EUR" },
          imageUrl:
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
          tags: ["Signature"],
          available: true,
        },
      ],
    },
    {
      id: "cat-desserts",
      name: "Desserts",
      tagline: "Sweet bites to treat yourself",
      imageUrl:
        "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80",
      dishes: [
        {
          id: "dish-tiramisu",
          name: "Tiramisu maison",
          subtitle: "Mascarpone, café espresso, cacao",
          price: { amount: 8, currency: "EUR" },
          imageUrl:
            "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80",
          tags: ["Signature"],
          available: true,
        },
        {
          id: "dish-panna-cotta",
          name: "Panna cotta",
          subtitle: "Coulis de fruits rouges",
          price: { amount: 7, currency: "EUR" },
          imageUrl:
            "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80",
          available: true,
        },
      ],
    },
    {
      id: "cat-drinks",
      name: "Boissons",
      tagline: "Cool drinks to refresh your day",
      imageUrl:
        "https://images.unsplash.com/photo-1437418747212-8d9709afab22?auto=format&fit=crop&w=800&q=80",
      dishes: [
        {
          id: "dish-spritz",
          name: "Aperol Spritz",
          subtitle: "Aperol, prosecco, eau gazeuse",
          price: { amount: 9, currency: "EUR" },
          imageUrl:
            "https://images.unsplash.com/photo-1560508601-aa00ce11a4ec?auto=format&fit=crop&w=800&q=80",
          available: true,
        },
        {
          id: "dish-limonata",
          name: "Limonata maison",
          subtitle: "Citrons de Sicile pressés",
          price: { amount: 5, currency: "EUR" },
          imageUrl:
            "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=800&q=80",
          available: true,
        },
      ],
    },
  ],
};
