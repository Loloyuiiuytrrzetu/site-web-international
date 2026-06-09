# Google Wallet — mise en service (clients Android)

Le code Google Wallet est **déjà en place**. Il s'active dès que les variables
d'environnement ci-dessous sont définies sur Vercel. Sinon, le bouton
« Ajouter à Google Wallet » ne s'affiche pas et l'app fonctionne normalement.

> ⚠️ Google Wallet fonctionne sur **Android** (toutes marques : Samsung, Pixel,
> Xiaomi…), **pas sur iPhone**. Pour les iPhone, c'est Apple Wallet.

## Ce que ça donne une fois configuré

- Bouton **« Ajouter à Google Wallet »** sur la carte du client.
- Carte ajoutée = **notifications automatiques** (points, promos, anniversaire),
  sans que le client n'active quoi que ce soit.
- Les points se mettent à jour tout seuls.

## Étapes (tout est gratuit)

### 1. Compte Google Cloud + projet
- Va sur https://console.cloud.google.com (connecte-toi avec un compte Google).
- Crée un **projet** (ex. « Walletiz »).

### 2. Activer l'API Google Wallet
- Dans le projet : **APIs & Services → Library** → cherche **« Google Wallet API »** → **Enable**.

### 3. Compte de service + clé
- **APIs & Services → Credentials → Create credentials → Service account**.
- Donne-lui un nom, crée-le.
- Ouvre le compte de service → onglet **Keys → Add key → Create new key → JSON**.
- Un fichier `.json` se télécharge. Dedans tu trouveras :
  - `client_email` → ce sera `GOOGLE_WALLET_SA_EMAIL`
  - `private_key` → ce sera `GOOGLE_WALLET_SA_KEY` (tout le bloc, avec les `\n`)

### 4. Compte émetteur Google Wallet (Issuer)
- Va sur https://pay.google.com/business/console
- Section **Google Wallet API** → accepte les conditions → tu obtiens un
  **Issuer ID** (un nombre) → ce sera `GOOGLE_WALLET_ISSUER_ID`.
- Dans **Users / Accès**, **ajoute l'e-mail du compte de service**
  (`client_email`) avec le rôle **Developer/Admin**, pour qu'il puisse créer les
  cartes.

### 5. Variables d'environnement sur Vercel
Project → Settings → Environment Variables :

| Variable | Valeur |
|---|---|
| `GOOGLE_WALLET_ISSUER_ID` | l'Issuer ID (nombre) |
| `GOOGLE_WALLET_SA_EMAIL` | le `client_email` du JSON |
| `GOOGLE_WALLET_SA_KEY` | le `private_key` du JSON (colle tout le bloc) |
| `NEXT_PUBLIC_BASE_URL` | l'URL publique du site (ex. `https://walletiz.app`) |

Puis **redéploie**. Le bouton « Ajouter à Google Wallet » apparaît.

## Mode démo

Un nouvel Issuer est d'abord en **mode démo** : la carte ne s'ajoute que pour
les **comptes Google de test** que tu déclares dans la console
(*Google Wallet API → Demo / test accounts*). Pour ouvrir à tout le monde, fais
une **demande de publication** dans la console (gratuit, validation rapide).

## Test (sur un téléphone Android)

1. Ouvre la carte d'un client sur l'Android → **Ajouter à Google Wallet**.
2. +1 tampon → la carte se met à jour dans Google Wallet.
3. Campagne « Envoyer maintenant » → notification sur l'Android.
