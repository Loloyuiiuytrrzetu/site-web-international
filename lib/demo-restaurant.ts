import type { Restaurant } from "./types";

export const demoRestaurant: Restaurant = {
  id: "demo-il-piatto",
  slug: "il-piatto",
  name: "Il Piatto",
  tagline: "Cuisine italienne authentique",
  translations: {
    fr: { tagline: "Cuisine italienne authentique" },
    en: { tagline: "Authentic Italian cuisine" },
    ar: { tagline: "مطبخ إيطالي أصيل" },
    es: { tagline: "Auténtica cocina italiana" },
    it: { tagline: "Autentica cucina italiana" },
    de: { tagline: "Authentische italienische Küche" },
    pt: { tagline: "Autêntica cozinha italiana" },
    zh: { tagline: "正宗意大利美食" },
  },
  logoUrl: "/demo/logo.svg",
  coverUrl:
    "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200&q=80",
  locales: ["fr", "en", "ar", "es", "it", "de", "pt", "zh"],
  defaultLocale: "fr",
  theme: {
    primaryColor: "#7a1226",
    backgroundColor: "#f4e4c1",
    textColor: "#451a03",
    accentColor: "#b45309",
  },
  contact: {
    phone: "+97312345678",
    whatsapp: "+97312345678",
    email: "contact@ilpiatto.example",
    address: "Juffair, Bahreïn",
    mapsUrl: "https://maps.google.com/?q=Juffair+Bahrain",
  },
  categories: [
    {
      id: "cat-mains",
      name: "Plats principaux",
      tagline: "Des assiettes généreuses pour tous les appétits",
      translations: {
        en: { name: "Main courses", tagline: "Hearty plates for every craving" },
        ar: { name: "الأطباق الرئيسية", tagline: "أطباق وفيرة لكل شهية" },
        es: { name: "Platos principales", tagline: "Platos abundantes para cada antojo" },
        it: { name: "Piatti principali", tagline: "Piatti generosi per ogni appetito" },
        de: { name: "Hauptgerichte", tagline: "Herzhafte Gerichte für jeden Hunger" },
        pt: { name: "Pratos principais", tagline: "Pratos fartos para cada apetite" },
        zh: { name: "主菜", tagline: "丰盛的菜肴满足每一种渴望" },
      },
      imageUrl:
        "https://images.unsplash.com/photo-1432139509613-5c4255815697?auto=format&fit=crop&w=800&q=80",
      dishes: [
        {
          id: "dish-truffle-pasta",
          name: "Tagliatelles à la truffe",
          subtitle: "Crème fraîche, parmesan affiné 24 mois",
          description:
            "Pâtes fraîches maison, crème de truffe noire et copeaux de parmesan.",
          translations: {
            en: {
              name: "Truffle tagliatelle",
              subtitle: "Crème fraîche, 24-month aged parmesan",
              description: "Homemade fresh pasta, black truffle cream and parmesan shavings.",
            },
            es: {
              name: "Tagliatelle a la trufa",
              subtitle: "Crème fraîche, parmesano curado 24 meses",
              description: "Pasta fresca casera, crema de trufa negra y virutas de parmesano.",
            },
            it: {
              name: "Tagliatelle al tartufo",
              subtitle: "Panna fresca, parmigiano stagionato 24 mesi",
              description: "Pasta fresca fatta in casa, crema di tartufo nero e scaglie di parmigiano.",
            },
                      de: {
              name: "Tagliatelle mit Trüffel",
              subtitle: "Crème fraîche, 24 Monate gereifter Parmesan",
              description: "Hausgemachte frische Pasta, schwarze Trüffelcreme und Parmesanspäne.",
            },
            ar: {
              name: "تالياتيلي بالكمأة",
              subtitle: "كريم فريش، بارميزان معتق 24 شهرًا",
              description: "معكرونة طازجة منزلية، كريمة الكمأة السوداء ورقائق البارميزان.",
            },
            pt: {
              name: "Tagliatelle com trufa",
              subtitle: "Crème fraîche, parmesão curado 24 meses",
              description: "Massa fresca caseira, creme de trufa negra e lascas de parmesão.",
            },
            zh: {
              name: "松露宽面",
              subtitle: "法式酸奶油，陈年24个月帕玛森奶酪",
              description: "自制新鲜意面，黑松露奶油配帕玛森奶酪刨花。",
            },
          },
          price: { amount: 18.5, currency: "EUR" },
          imageUrl:
            "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80",
          tags: ["Signature", "Végétarien"],
          allergens: ["gluten", "lactose", "eggs"],
          available: true,
        },
        {
          id: "dish-osso-buco",
          name: "Osso buco à la milanaise",
          subtitle: "Risotto safrané, gremolata",
          description:
            "Jarret de veau braisé pendant 6 heures, servi avec un risotto crémeux au safran.",
          translations: {
            en: {
              name: "Milanese osso buco",
              subtitle: "Saffron risotto, gremolata",
              description: "Veal shank braised for 6 hours, served with creamy saffron risotto.",
            },
            es: {
              name: "Osso buco a la milanesa",
              subtitle: "Risotto al azafrán, gremolata",
              description: "Jarrete de ternera braseado 6 horas, con risotto cremoso al azafrán.",
            },
            it: {
              name: "Ossobuco alla milanese",
              subtitle: "Risotto allo zafferano, gremolata",
              description: "Stinco di vitello brasato 6 ore, servito con risotto cremoso allo zafferano.",
            },
                      de: {
              name: "Ossobuco nach Mailänder Art",
              subtitle: "Safran-Risotto, Gremolata",
              description: "6 Stunden geschmorte Kalbshaxe, serviert mit cremigem Safran-Risotto.",
            },
            ar: {
              name: "أوسو بوكو على الطريقة الميلانية",
              subtitle: "ريزوتو بالزعفران، غريمولاتا",
              description: "ساق عجل مطهية 6 ساعات، مع ريزوتو كريمي بالزعفران.",
            },
            pt: {
              name: "Ossobuco à milanesa",
              subtitle: "Risoto de açafrão, gremolata",
              description: "Jarrete de vitela braseado 6 horas, servido com risoto cremoso de açafrão.",
            },
            zh: {
              name: "米兰式炖小牛膝",
              subtitle: "藏红花烩饭，柠檬碎香料",
              description: "小牛膝慢炖6小时，配奶油藏红花烩饭。",
            },
          },
          price: { amount: 26, currency: "EUR" },
          imageUrl:
            "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
          allergens: ["lactose", "celery", "sulfites"],
          available: true,
        },
        {
          id: "dish-risotto",
          name: "Risotto aux cèpes",
          subtitle: "Cèpes frais, beurre noisette",
          description: "Riz arborio crémeux, cèpes poêlés et copeaux de parmesan.",
          translations: {
            en: {
              name: "Porcini risotto",
              subtitle: "Fresh porcini, brown butter",
              description: "Creamy arborio rice, sautéed porcini mushrooms and parmesan shavings.",
            },
            es: {
              name: "Risotto de boletus",
              subtitle: "Boletus frescos, mantequilla avellana",
              description: "Arroz arborio cremoso, boletus salteados y virutas de parmesano.",
            },
            it: {
              name: "Risotto ai funghi porcini",
              subtitle: "Porcini freschi, burro nocciola",
              description: "Riso arborio cremoso, porcini saltati e scaglie di parmigiano.",
            },
                      de: {
              name: "Steinpilz-Risotto",
              subtitle: "Frische Steinpilze, braune Butter",
              description: "Cremiger Arborio-Reis, gebratene Steinpilze und Parmesanspäne.",
            },
            ar: {
              name: "ريزوتو بالفطر البورسيني",
              subtitle: "بورسيني طازج، زبدة بنية",
              description: "أرز أربوريو كريمي، فطر بورسيني مقلي ورقائق بارميزان.",
            },
            pt: {
              name: "Risoto de funghi porcini",
              subtitle: "Porcini fresco, manteiga noisette",
              description: "Arroz arbóreo cremoso, cogumelos porcini salteados e lascas de parmesão.",
            },
            zh: {
              name: "牛肝菌烩饭",
              subtitle: "新鲜牛肝菌，焦化黄油",
              description: "奶油阿勃瑞欧米，炒牛肝菌配帕玛森奶酪刨花。",
            },
          },
          price: { amount: 19, currency: "EUR" },
          imageUrl:
            "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=800&q=80",
          tags: ["Végétarien"],
          allergens: ["lactose", "sulfites"],
          available: true,
        },
      ],
    },
    {
      id: "cat-breakfast",
      name: "Petit-déjeuner",
      tagline: "Des envies matinales pour bien commencer",
      translations: {
        en: { name: "Breakfast", tagline: "Morning favorites to start fresh" },
        ar: { name: "الفطور", tagline: "وجبات الصباح المفضلة لبداية منعشة" },
        es: { name: "Desayuno", tagline: "Los favoritos de la mañana para empezar bien" },
        it: { name: "Colazione", tagline: "I preferiti del mattino per iniziare bene" },
        de: { name: "Frühstück", tagline: "Morgendliche Favoriten für einen frischen Start" },
        pt: { name: "Café da manhã", tagline: "Favoritos da manhã para começar bem" },
        zh: { name: "早餐", tagline: "晨间最爱，清新开启" },
      },
      imageUrl:
        "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=800&q=80",
      dishes: [
        {
          id: "dish-cornetto",
          name: "Cornetto à la crème",
          subtitle: "Viennoiserie italienne classique",
          description: "Croissant italien feuilleté garni de crème pâtissière maison.",
          translations: {
            en: {
              name: "Cream cornetto",
              subtitle: "Classic Italian pastry",
              description: "Flaky Italian croissant filled with homemade pastry cream.",
            },
            es: {
              name: "Cornetto de crema",
              subtitle: "Bollería italiana clásica",
              description: "Croissant italiano hojaldrado relleno de crema pastelera casera.",
            },
            it: {
              name: "Cornetto alla crema",
              subtitle: "Classica pasticceria italiana",
              description: "Cornetto sfogliato italiano farcito con crema pasticcera fatta in casa.",
            },
                      de: {
              name: "Cornetto mit Sahne",
              subtitle: "Klassisches italienisches Gebäck",
              description: "Blättriges italienisches Croissant mit hausgemachter Konditorcreme.",
            },
            ar: {
              name: "كورنيتو بالكريمة",
              subtitle: "معجنات إيطالية كلاسيكية",
              description: "كرواسون إيطالي مورق محشو بكريمة الحلواني المنزلية.",
            },
            pt: {
              name: "Cornetto com creme",
              subtitle: "Pastelaria italiana clássica",
              description: "Croissant italiano folhado recheado com creme pasteleiro caseiro.",
            },
            zh: {
              name: "奶油羊角包",
              subtitle: "经典意式糕点",
              description: "酥脆意式羊角包，填充自制糕点奶油。",
            },
          },
          price: { amount: 3.5, currency: "EUR" },
          imageUrl:
            "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80",
          allergens: ["gluten", "lactose", "eggs"],
          available: true,
        },
        {
          id: "dish-eggs-benedict",
          name: "Œufs Bénédicte",
          subtitle: "Pain brioché, sauce hollandaise",
          description: "Œufs pochés, bacon, sauce hollandaise maison sur pain brioché toasté.",
          translations: {
            en: {
              name: "Eggs Benedict",
              subtitle: "Brioche bread, hollandaise sauce",
              description: "Poached eggs, bacon, homemade hollandaise sauce on toasted brioche.",
            },
            es: {
              name: "Huevos Benedict",
              subtitle: "Pan brioche, salsa holandesa",
              description: "Huevos escalfados, bacon, salsa holandesa casera sobre brioche tostado.",
            },
            it: {
              name: "Uova alla Benedict",
              subtitle: "Pane brioche, salsa olandese",
              description: "Uova in camicia, bacon, salsa olandese fatta in casa su brioche tostata.",
            },
                      de: {
              name: "Eier Benedict",
              subtitle: "Brioche-Brot, Sauce Hollandaise",
              description: "Pochierte Eier, Speck, hausgemachte Sauce Hollandaise auf getoasteter Brioche.",
            },
            ar: {
              name: "بيض بنديكت",
              subtitle: "خبز بريوش، صلصة هولنديز",
              description: "بيض مسلوق، لحم مقدد، صلصة هولنديز منزلية على بريوش محمص.",
            },
            pt: {
              name: "Ovos Benedict",
              subtitle: "Pão brioche, molho holandês",
              description: "Ovos pochê, bacon, molho holandês caseiro sobre brioche tostado.",
            },
            zh: {
              name: "本尼迪克蛋",
              subtitle: "布里欧吐司，荷兰酱",
              description: "水波蛋、培根、自制荷兰酱配烤布里欧吐司。",
            },
          },
          price: { amount: 12, currency: "EUR" },
          imageUrl:
            "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=800&q=80",
          allergens: ["gluten", "lactose", "eggs"],
          available: true,
        },
      ],
    },
    {
      id: "cat-pizza",
      name: "Pizzas",
      tagline: "Pâtes étalées à la main, garnitures audacieuses",
      translations: {
        en: { name: "Pizzas", tagline: "Hand-tossed pies with bold toppings" },
        ar: { name: "البيتزا", tagline: "عجين مفرود يدويًا مع إضافات جريئة" },
        es: { name: "Pizzas", tagline: "Masas estiradas a mano con coberturas audaces" },
        it: { name: "Pizze", tagline: "Impasti stesi a mano con condimenti audaci" },
        de: { name: "Pizzen", tagline: "Handgeworfener Teig mit kühnen Belägen" },
        pt: { name: "Pizzas", tagline: "Massas abertas à mão com coberturas ousadas" },
        zh: { name: "披萨", tagline: "手工抛饼，大胆配料" },
      },
      imageUrl:
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
      dishes: [
        {
          id: "dish-margherita",
          name: "Margherita",
          subtitle: "Mozzarella di bufala, basilic frais",
          description: "Sauce tomate San Marzano, mozzarella di bufala et basilic frais.",
          translations: {
            en: {
              subtitle: "Buffalo mozzarella, fresh basil",
              description: "San Marzano tomato sauce, buffalo mozzarella and fresh basil.",
            },
            es: {
              subtitle: "Mozzarella de búfala, albahaca fresca",
              description: "Salsa de tomate San Marzano, mozzarella de búfala y albahaca fresca.",
            },
            it: {
              subtitle: "Mozzarella di bufala, basilico fresco",
              description: "Salsa di pomodoro San Marzano, mozzarella di bufala e basilico fresco.",
            },
                      de: {
              subtitle: "Büffelmozzarella, frisches Basilikum",
              description: "San-Marzano-Tomatensauce, Büffelmozzarella und frisches Basilikum.",
            },
            ar: {
              subtitle: "موزاريلا الجاموس، ريحان طازج",
              description: "صلصة طماطم سان مارزانو، موزاريلا الجاموس وريحان طازج.",
            },
            pt: {
              subtitle: "Mozzarella de búfala, manjericão fresco",
              description: "Molho de tomate San Marzano, mozzarella de búfala e manjericão fresco.",
            },
            zh: {
              subtitle: "水牛奶酪，新鲜罗勒",
              description: "圣马尔扎诺番茄酱、水牛奶酪和新鲜罗勒。",
            },
          },
          price: { amount: 13, currency: "EUR" },
          imageUrl:
            "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80",
          tags: ["Classique", "Végétarien"],
          allergens: ["gluten", "lactose"],
          available: true,
        },
        {
          id: "dish-tartufo",
          name: "Pizza Tartufo",
          subtitle: "Crème truffée, champignons, parmesan",
          description: "Base crème de truffe, mozzarella, champignons et parmesan.",
          translations: {
            en: {
              name: "Tartufo pizza",
              subtitle: "Truffle cream, mushrooms, parmesan",
              description: "Truffle cream base, mozzarella, mushrooms and parmesan.",
            },
            es: {
              name: "Pizza Tartufo",
              subtitle: "Crema de trufa, champiñones, parmesano",
              description: "Base de crema de trufa, mozzarella, champiñones y parmesano.",
            },
            it: {
              name: "Pizza al tartufo",
              subtitle: "Crema al tartufo, funghi, parmigiano",
              description: "Base con crema di tartufo, mozzarella, funghi e parmigiano.",
            },
                      de: {
              name: "Trüffelpizza",
              subtitle: "Trüffelcreme, Pilze, Parmesan",
              description: "Trüffelcreme-Basis, Mozzarella, Pilze und Parmesan.",
            },
            ar: {
              name: "بيتزا الكمأة",
              subtitle: "كريمة الكمأة، فطر، بارميزان",
              description: "قاعدة كريمة الكمأة، موزاريلا، فطر وبارميزان.",
            },
            pt: {
              subtitle: "Creme de trufa, cogumelos, parmesão",
              description: "Base de creme de trufa, mozzarella, cogumelos e parmesão.",
            },
            zh: {
              name: "松露披萨",
              subtitle: "松露酱，蘑菇，帕玛森奶酪",
              description: "松露奶油底，马苏里拉奶酪、蘑菇和帕玛森奶酪。",
            },
          },
          price: { amount: 17, currency: "EUR" },
          imageUrl:
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
          tags: ["Signature"],
          allergens: ["gluten", "lactose"],
          available: true,
        },
      ],
    },
    {
      id: "cat-desserts",
      name: "Desserts",
      tagline: "Des douceurs pour se faire plaisir",
      translations: {
        en: { name: "Desserts", tagline: "Sweet bites to treat yourself" },
        ar: { name: "الحلويات", tagline: "قطع حلوة لتدليل نفسك" },
        es: { name: "Postres", tagline: "Dulces bocados para darte un capricho" },
        it: { name: "Dolci", tagline: "Dolcezze per coccolarsi" },
        de: { name: "Desserts", tagline: "Süße Häppchen zum Verwöhnen" },
        pt: { name: "Sobremesas", tagline: "Doces para se mimar" },
        zh: { name: "甜点", tagline: "甜蜜小食，犒赏自己" },
      },
      imageUrl:
        "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80",
      dishes: [
        {
          id: "dish-tiramisu",
          name: "Tiramisu maison",
          subtitle: "Mascarpone, café espresso, cacao",
          description: "Le grand classique italien : biscuits imbibés d'espresso, crème de mascarpone et cacao.",
          translations: {
            en: {
              name: "Homemade tiramisu",
              subtitle: "Mascarpone, espresso, cocoa",
              description: "The Italian classic: espresso-soaked ladyfingers, mascarpone cream and cocoa.",
            },
            es: {
              name: "Tiramisú casero",
              subtitle: "Mascarpone, espresso, cacao",
              description: "El clásico italiano: bizcochos remojados en espresso, crema de mascarpone y cacao.",
            },
            it: {
              name: "Tiramisù della casa",
              subtitle: "Mascarpone, caffè espresso, cacao",
              description: "Il grande classico italiano: savoiardi inzuppati nell'espresso, crema al mascarpone e cacao.",
            },
                      de: {
              name: "Hausgemachtes Tiramisu",
              subtitle: "Mascarpone, Espresso, Kakao",
              description: "Der italienische Klassiker: in Espresso getränkte Löffelbiskuits, Mascarponecreme und Kakao.",
            },
            ar: {
              name: "تيراميسو منزلي",
              subtitle: "ماسكاربوني، إسبريسو، كاكاو",
              description: "الكلاسيكية الإيطالية: أصابع البسكويت المنقوعة بالإسبريسو، كريمة الماسكاربوني والكاكاو.",
            },
            pt: {
              name: "Tiramisu caseiro",
              subtitle: "Mascarpone, espresso, cacau",
              description: "O clássico italiano: biscoitos embebidos em espresso, creme de mascarpone e cacau.",
            },
            zh: {
              name: "自制提拉米苏",
              subtitle: "马斯卡彭，浓缩咖啡，可可",
              description: "意式经典：浓缩咖啡浸泡的手指饼干、马斯卡彭奶油和可可粉。",
            },
          },
          price: { amount: 8, currency: "EUR" },
          imageUrl:
            "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80",
          tags: ["Signature"],
          allergens: ["gluten", "lactose", "eggs"],
          available: true,
        },
        {
          id: "dish-panna-cotta",
          name: "Panna cotta",
          subtitle: "Coulis de fruits rouges",
          description: "Crème onctueuse à la vanille de Madagascar et coulis de fruits rouges.",
          translations: {
            en: {
              subtitle: "Red berry coulis",
              description: "Smooth Madagascar vanilla cream with red berry coulis.",
            },
            es: {
              subtitle: "Coulis de frutos rojos",
              description: "Crema suave de vainilla de Madagascar con coulis de frutos rojos.",
            },
            it: {
              subtitle: "Coulis di frutti rossi",
              description: "Crema vellutata alla vaniglia del Madagascar con coulis di frutti rossi.",
            },
                      de: {
              subtitle: "Rote-Beeren-Coulis",
              description: "Samtige Madagaskar-Vanillecreme mit Rote-Beeren-Coulis.",
            },
            ar: {
              subtitle: "كولي التوت الأحمر",
              description: "كريمة الفانيليا المدغشقرية الناعمة مع كولي التوت الأحمر.",
            },
            pt: {
              subtitle: "Coulis de frutas vermelhas",
              description: "Creme aveludado de baunilha de Madagascar com coulis de frutas vermelhas.",
            },
            zh: {
              subtitle: "红色浆果酱",
              description: "丝滑马达加斯加香草奶油配红色浆果酱。",
            },
          },
          price: { amount: 7, currency: "EUR" },
          imageUrl:
            "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80",
          allergens: ["lactose"],
          available: true,
        },
      ],
    },
    {
      id: "cat-drinks",
      name: "Boissons",
      tagline: "Des boissons fraîches pour se désaltérer",
      translations: {
        en: { name: "Drinks", tagline: "Cool drinks to refresh your day" },
        ar: { name: "المشروبات", tagline: "مشروبات منعشة لإنعاش يومك" },
        es: { name: "Bebidas", tagline: "Bebidas frescas para refrescar el día" },
        it: { name: "Bevande", tagline: "Bevande fresche per dissetarsi" },
        de: { name: "Getränke", tagline: "Erfrischende Getränke für den Tag" },
        pt: { name: "Bebidas", tagline: "Bebidas refrescantes para o seu dia" },
        zh: { name: "饮品", tagline: "清爽饮品，焕新一日" },
      },
      imageUrl:
        "https://images.unsplash.com/photo-1437418747212-8d9709afab22?auto=format&fit=crop&w=800&q=80",
      dishes: [
        {
          id: "dish-spritz",
          name: "Aperol Spritz",
          subtitle: "Aperol, prosecco, eau gazeuse",
          description: "L'apéritif italien par excellence, servi sur glace avec une tranche d'orange.",
          translations: {
            en: {
              subtitle: "Aperol, prosecco, sparkling water",
              description: "The quintessential Italian aperitif, served over ice with an orange slice.",
            },
            es: {
              subtitle: "Aperol, prosecco, agua con gas",
              description: "El aperitivo italiano por excelencia, servido con hielo y una rodaja de naranja.",
            },
            it: {
              subtitle: "Aperol, prosecco, acqua frizzante",
              description: "L'aperitivo italiano per eccellenza, servito con ghiaccio e fetta d'arancia.",
            },
                      de: {
              subtitle: "Aperol, Prosecco, Sodawasser",
              description: "Der italienische Aperitif schlechthin, auf Eis mit Orangenscheibe serviert.",
            },
            ar: {
              subtitle: "أبيرول، بروسيكو، ماء غازي",
              description: "المشروب الإيطالي الفاتح للشهية بامتياز، مع الثلج وشريحة برتقال.",
            },
            pt: {
              subtitle: "Aperol, prosecco, água com gás",
              description: "O aperitivo italiano por excelência, servido com gelo e fatia de laranja.",
            },
            zh: {
              subtitle: "Aperol、普罗赛克、苏打水",
              description: "意式开胃酒经典，加冰配橙片享用。",
            },
          },
          price: { amount: 9, currency: "EUR" },
          imageUrl:
            "https://images.unsplash.com/photo-1605270012917-bf357a1fae9e?auto=format&fit=crop&w=800&q=80",
          allergens: ["sulfites"],
          available: true,
        },
        {
          id: "dish-limonata",
          name: "Limonata maison",
          subtitle: "Citrons de Sicile pressés",
          description: "Limonade artisanale aux citrons jaunes de Sicile, légèrement gazeuse.",
          translations: {
            en: {
              name: "Homemade limonata",
              subtitle: "Freshly squeezed Sicilian lemons",
              description: "Artisanal lemonade with Sicilian yellow lemons, lightly sparkling.",
            },
            es: {
              name: "Limonata casera",
              subtitle: "Limones de Sicilia exprimidos",
              description: "Limonada artesanal con limones amarillos de Sicilia, ligeramente gasificada.",
            },
            it: {
              name: "Limonata della casa",
              subtitle: "Limoni di Sicilia spremuti",
              description: "Limonata artigianale con limoni gialli di Sicilia, leggermente frizzante.",
            },
                      de: {
              name: "Hausgemachte Limonata",
              subtitle: "Frisch gepresste sizilianische Zitronen",
              description: "Handwerkliche Limonade mit gelben sizilianischen Zitronen, leicht prickelnd.",
            },
            ar: {
              name: "ليموناتة منزلية",
              subtitle: "ليمون صقلي معصور طازج",
              description: "ليموناتة حرفية بليمون صقلي أصفر، خفيفة الغازية.",
            },
            pt: {
              name: "Limonata caseira",
              subtitle: "Limões sicilianos espremidos",
              description: "Limonada artesanal com limões amarelos sicilianos, levemente gaseificada.",
            },
            zh: {
              name: "自制柠檬水",
              subtitle: "现榨西西里柠檬",
              description: "手工柠檬水，西西里黄柠檬，微气泡。",
            },
          },
          price: { amount: 5, currency: "EUR" },
          imageUrl:
            "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=800&q=80",
          available: true,
        },
      ],
    },
  ],
};
