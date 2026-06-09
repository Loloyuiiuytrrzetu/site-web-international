# Walletiz 🍷

**Cartes de fidélité digitales pour restaurants.**

Walletiz est une plateforme SaaS qui remplace les cartes de fidélité papier
par une carte digitale. Les clients cumulent leurs tampons sur leur téléphone,
et les restaurateurs fidélisent leur clientèle sans effort.

Vendu en abonnement mensuel par restaurant (architecture **multi-tenant** :
un seul logiciel, plusieurs restaurants isolés).

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** (thème bordeaux / fond blanc)
- **Prisma 6** + **SQLite** (MVP ; migration vers PostgreSQL prévue)
- **qrcode** pour les QR codes des cartes

## Démarrer en local

```bash
npm install
npx prisma migrate dev   # crée la base SQLite
npm run db:seed          # données de démo (resto "Chez Mario")
npm run dev              # http://localhost:3000
```

## Les pages

| URL | Pour qui | Rôle |
|-----|----------|------|
| `/` | Restaurateurs | Landing commerciale + tarifs |
| `/dashboard` | Gérant | Stats, clients, QR code de carte |
| `/caisse` | Serveur / caissier | Ajoute un tampon après un passage |
| `/c/[token]` | Client final | Sa carte de fidélité (future passe Wallet) |

## Modèle de données

`Restaurant` → `LoyaltyProgram` → `StampCard` (du `Customer`) → `Stamp` / `RewardRedemption`

Voir `prisma/schema.prisma`.

## Feuille de route

- [x] Phase 0 — Fondations (projet, base de données multi-resto)
- [x] Phase 1 — MVP : carte à tampons (client + caisse + dashboard)
- [ ] Phase 2 — Intégration Apple Wallet (`.pkpass`) & Google Wallet
- [ ] Phase 3 — Authentification des restos + abonnements Stripe
- [ ] Phase 4 — Emails de relance, statistiques avancées
